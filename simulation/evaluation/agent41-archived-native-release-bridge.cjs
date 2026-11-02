'use strict';

const {classifyNativeAttempt}=require('./native-attempt-disposition.cjs');
const {classifySourceChain}=
  require('./agent41-native-attempt-disposition.cjs');

const SHA256=/^[0-9a-f]{64}$/;

/**
 * Read the two verified historical result envelopes. The original JSON
 * remains unchanged. Successful game rows normally have no status field.
 * @param {object} archive Original immutable native release archive.
 * @returns {{rows:object[],expected:string[],registrySource:string}}
 */
function resolveArchive(archive){
  if(!archive || typeof archive!=='object')
    throw new TypeError('Native archive must be an object');
  const rank16=archive.allNativeDevelopmentRows;
  const frozen=archive.rawNativeResult?.rows;
  const rows=Array.isArray(rank16)?rank16:frozen;
  if(!Array.isArray(rows))
    throw new TypeError('No known native row collection in archive');
  const registration=archive.registration;
  if(Array.isArray(registration?.seeds)&&
     Array.isArray(registration.candidateIds)){
    const expected=registration.seeds.flatMap(s=>
      registration.candidateIds.map(candidateId=>
        [s.rank,s.repeat,s.candidateSlot,candidateId].join(':')));
    return {rows,expected,registrySource:'ORIGINAL_PRECOMMITTED_SEEDS'};
  }
  const releaseAttempts=archive.releaseDisposition?.attempts;
  if(Array.isArray(releaseAttempts))return {
    rows,expected:releaseAttempts.map(e=>e.trialId),
    registrySource:'HISTORICAL_REPORTER_ATTEMPT_LEDGER'
  };
  return {rows,expected:[],registrySource:'UNAVAILABLE'};
}

/**
 * Capture actual setup prompt history without interpreting native prompt
 * counts as proof of a paper mulligan or compensation award.
 * @param {object} row Canonical Store row.
 * @returns {object} Root-ledger setup counts for each physical seat.
 */
function nativeSetupHistory(row){
  if(!Array.isArray(row?.rootActionLedger)||
      ![0,1].includes(row.sourceSeat)||
      ![0,1].includes(row.candidateSeat))return {observed:false};
  const setup=row.rootActionLedger.filter(e=>
    e.turnBefore===0&&e.action==='ResolvePromptAction');
  const count=(seat,kind)=>setup.filter(e=>e.playerSlot===seat&&
    e.pendingPrompt===kind).length;
  return {
    observed:true,
    sourceShufflePromptActions:count(row.sourceSeat,'ShuffleDeckPrompt'),
    candidateShufflePromptActions:count(row.candidateSeat,'ShuffleDeckPrompt'),
    sourceShowMulliganPromptActions:count(row.sourceSeat,'ShowMulliganPrompt'),
    candidateShowMulliganPromptActions:count(row.candidateSeat,'ShowMulliganPrompt'),
    sourceSelectPromptActions:count(row.sourceSeat,'SelectPrompt'),
    candidateSelectPromptActions:count(row.candidateSeat,'SelectPrompt')
  };
}

/**
 * Independently check whether both registered candidates received the same
 * original-source physical deal. Never equate matching PRNG seeds with
 * matching source hands and prizes.
 * @param {object[]} rows Native canonical rows (never simplified outcomes).
 * @returns {object[]} Physical source pair receipts.
 */
function sourcePairReceipts(rows){
  const groups=new Map();
  const EXPECTED=new Set(['champion-reference','new-moon-lockbreaker-v1']);
  for(const row of rows){
    const t=row?.trial;
    if(!t||!Number.isInteger(t.rank)||!Number.isInteger(t.repeat)||
        !['A','B'].includes(t.candidateSlot)||
        !Number.isSafeInteger(t.seed))continue;
    const pairId=[t.rank,t.repeat,t.candidateSlot,t.seed].join(':');
    if(!groups.has(pairId))groups.set(pairId,[]);
    groups.get(pairId).push(row);
  }
  return [...groups].map(([pairId,attempts])=>{
    const ids=attempts.map(r=>r.trial.id);
    const present=attempts.length===2&&
      attempts.every(r=>EXPECTED.has(r.trial.candidateId)&&
        r.trial.id===[r.trial.rank,r.trial.repeat,
          r.trial.candidateSlot,r.trial.candidateId].join(':'))&&
      new Set(attempts.map(r=>r.trial.candidateId)).size===2;
    const correctlySeated=present&&attempts.every(r=>
      r.verifiedFirstTurn===true &&
      r.candidateSeat===(r.trial.candidateSlot==='A'?0:1)&&
      r.sourceSeat===1-r.candidateSeat &&
      typeof r.sourceActuallyFirst==='boolean');
    const hashes=attempts.map(r=>r.sourceDealFingerprint??null);
    const authenticated=correctlySeated&&hashes.every(h=>
      typeof h==='string'&&SHA256.test(h));
    const sameStarter=authenticated&&attempts[0].sourceActuallyFirst===
      attempts[1].sourceActuallyFirst;
    const status=!authenticated?'UNVERIFIED':
      !sameStarter?'STARTER_STRATUM_DIFFERENT':
      hashes[0]!==hashes[1]?'SOURCE_PHYSICAL_DEAL_DIFFERENT':
      'EXACT_SOURCE_PHYSICAL_MATCH';
    const setupHistories=attempts.map(nativeSetupHistory);
    const sameSetupHistory=present&&setupHistories.every(x=>x.observed)&&
      setupHistories.every(x=>JSON.stringify(x)===JSON.stringify(setupHistories[0]));
    // Historical 'sourceFirstOwnHandSha256' selects the FIRST owner
    // decisionTrace entry, which can be a turn-0 setup ChooseCardsPrompt.
    // This SHA is NOT an authenticated first-live-turn hand fingerprint.
    const sourceHandHashes=attempts.map(r=>r.sourceFirstOwnHandSha256??null);
    const sameLegacyEarlySourceHandSha=present&&sourceHandHashes.every(h=>
      typeof h==='string'&&SHA256.test(h))&&
      sourceHandHashes.every(h=>h===sourceHandHashes[0]);
    return {pairId,trialIds:ids,status,
      sourceHashes:hashes,setupHistories,
      sameSetupHistory,
      sameLegacyEarlySourceHandSha,
      legacyDigestMayBeSetupPhase:true,
      actualFirstLiveOwnerHandEqualityCertified:false,
      identicalEarlyHashButDifferentSourceDeal:
        sameLegacyEarlySourceHandSha&&status==='SOURCE_PHYSICAL_DEAL_DIFFERENT',
      candidateComparisonCompetitivelyQualified:false};
  });
}

/**
 * Record chronological source first-turn action selections, without
 * manufacturing an eligible lock opportunity or a paper-valid payoff.
 * @param {object} row Canonical original Store row.
 * @returns {object} Source first-own-turn attendance and action receipt.
 */
function firstSourceTurnReceipt(row){
  const seat=row?.sourceSeat;
  if(![0,1].includes(seat)||typeof row.sourceActuallyFirst!=='boolean')
    return {state:'UNVERIFIED_FIRST_SOURCE_TURN',
      characteristicRootSelected:null,legalOpportunityQualified:false};
  const firstTurn=row.sourceActuallyFirst?1:2;
  const firstTurnObserved=row.sourceFirstOwnedAffordances?.status==='observed';
  const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger.filter(e=>
    e.playerSlot===seat&&e.turnBefore===firstTurn&&
    e.pendingPrompt==null):[];
  const sourceRank=row?.trial?.rank;
  const rank16Characteristic=sourceRank===16;
  const selected=rank16Characteristic?roots.some(e=>
    e.action==='AttackAction'&&e.attack==='Itchy Pollen'||
    e.action==='PlayCardAction'&&
      typeof e.card==='string'&&e.card.startsWith('Boost Shake')):null;
  const firstHand=row.sourceFirstOwnedAffordances?.firstOwnHand;
  const heldShake=Number.isInteger(firstHand?.resources?.['Boost Shake'])?
    firstHand.resources['Boost Shake']:null;
  return {
    state:firstTurnObserved?'FIRST_SOURCE_TURN_OBSERVED':
      'FIRST_SOURCE_TURN_UNVERIFIED',
    firstTurn,sourceSeat:seat,nativeRootCount:roots.length,
    characteristicRootSelected:firstTurnObserved?selected:null,
    characteristicAssessment:rank16Characteristic?
      'RANK16_ITCHY_POLLEN_OR_BOOST_SHAKE_FIRST_TURN':'NOT_ASSESSED',
    heldBoostShake:firstTurnObserved&&rank16Characteristic?heldShake:null,
    legalOpportunityQualified:false,
    paperEffectQualified:false,
    consequentOpponentReplyQualified:false
  };
}

/**
 * Reclassify registered native attempts without altering their source rows,
 * changing policy choices, or promoting any native winner to paper status.
 * @param {object} archive Original rank16 / frozen rank6 release archive.
 * @returns {object} Read-only postprocessed disposition.
 */
function correctNativeArchive(archive){
  const {rows,expected,registrySource}=resolveArchive(archive);
  const expectedSet=new Set(expected),seen=new Set(),duplicates=[];
  const duplicateRegisteredIds=expected.filter((id,i)=>expected.indexOf(id)!==i);
  const unexpected=[];
  const dispositions={},perAttempt=[];
  for(const row of rows){
    const trialId=typeof row?.trial?.id==='string'?row.trial.id:null;
    if(trialId!==null){
      if(seen.has(trialId))duplicates.push(trialId);
      seen.add(trialId);
    }
    if(expected.length>0&&!expectedSet.has(trialId))
      unexpected.push(trialId);
    const disposition=classifyNativeAttempt(row);
    dispositions[disposition.kind]=(dispositions[disposition.kind]??0)+1;
    perAttempt.push({trialId,nativeDisposition:disposition,
      firstSourceTurn:firstSourceTurnReceipt(row),
      // A chronological first turn is not an attested legal opportunity.
      firstMissingPaperPhase:classifySourceChain({}).firstMissingPhase});
  }
  const missing=expected.filter(id=>!seen.has(id));
  const pairs=sourcePairReceipts(rows);
  const sourceFirstTurns=perAttempt.map(x=>x.firstSourceTurn);
  const observed=sourceFirstTurns.filter(x=>
    x.state==='FIRST_SOURCE_TURN_OBSERVED');
  const groups={};
  for(const pair of pairs)
    groups[pair.status]=(groups[pair.status]??0)+1;
  return {
    schema:'agent41-readonly-native-release-correction-v1',
    registrySource,registeredAttempts:expected.length,
    observedAttempts:rows.length,missing,unexpected,duplicates,
    duplicateRegisteredIds,
    nativeDispositionCounts:dispositions,sourcePairStatusCounts:groups,
    sourcePairs:pairs,perAttempt,
    originalSourceFirstTurnAttendance:{
      observed:observed.length,
      characteristicRootSelected:observed.filter(x=>
        x.characteristicRootSelected===true).length,
      heldShakeKnownPositive:observed.filter(x=>
        typeof x.heldBoostShake==='number'&&x.heldBoostShake>0).length,
      legalOpportunitiesCertified:0
    },
    registrationIdentityFullyVerified:registrySource===
      'ORIGINAL_PRECOMMITTED_SEEDS'&&missing.length===0&&
      duplicates.length===0&&unexpected.length===0&&
      duplicateRegisteredIds.length===0,
    competitivelyQualifiedPaperGames:0,
    paperWinRateCertified:false
  };
}

module.exports={resolveArchive,nativeSetupHistory,sourcePairReceipts,firstSourceTurnReceipt,
  correctNativeArchive};
