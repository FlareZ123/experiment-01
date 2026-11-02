'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withPaperAstralBarrageTargets}=
  require('../twinleaf/agent4-astral-barrage-active-target-hook.cjs');
const {withPaperPromptContractPortfolio,VERSION}=
  require('../twinleaf/agent41-paper-prompt-contract-portfolio.cjs');

const root=path.resolve(__dirname,'../..');
const registration=JSON.parse(fs.readFileSync(path.join(root,
  'results/aichi-2026/registrations/agent4-astral-rank1-rank6-natural-20261102.json'),'utf8'));

/** @param {string} filename @returns {string} Git blob SHA-1. */
function gitBlobSha(filename){
  const bytes=fs.readFileSync(path.join(root,filename));
  return crypto.createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
}
/** @param {unknown} value @returns {string} Deterministic SHA256. */
const hash=value=>crypto.createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/** Validate all frozen experiment inputs before the first original Store. */
function preflight(){
  assert.equal(registration.schema,
    'agent4-original-rank1-astral-versus-rank6-iron-thorns-prospective-v1');
  assert.equal(registration.nativeEnginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(registration.paperPromptPortfolioVersion,VERSION);
  assert.equal(registration.maxActions,180);
  assert.equal(registration.armsPerPhysicalSeat,8);
  assert.equal(registration.originalRank1Printed60Sha256,
    '159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090');
  assert.equal(registration.originalRank6Printed60Sha256,
    '9c479091770e7e682624d4f86f6de0c7f85a9723adcf7877539012dfbc0295e5');
  assert.equal(registration.sourceRank,6);
  assert.equal(registration.candidateRank,1);
  assert.deepEqual(registration.physicalCandidateSeats,[0,1]);
  assert.deepEqual(registration.randomSeeds,
    [1015365796,2565306089,217633110,460334966]);
  for(const [relative,expected] of Object.entries(registration.frozenGitBlobShas)){
    assert.equal(gitBlobSha(relative),expected,
      'Frozen prospective source or selected policy changed: '+relative);
  }
  const {candidate,opponents}=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const original=opponents.find(x=>x.rank===6);
  assert.equal(original?.status,'ready');
  assert.equal(candidate.cards.length,60);
  assert.equal(original.cards.length,60);
  return {candidate: candidate.cards,source: original.cards};
}

/**
 * Source-dealt original-60 native Store arm. Common v10 printed negatives
 * are enabled identically for both treatment and control. Only the
 * reversible CRE74 Astral Barrage source-card reducer differs.
 *
 * @param {{seed:number,seat:0|1,corrected:boolean}} trial
 * @param {{candidate:string[],source:string[]}} decks
 * @returns {object} Failure-inclusive, public-only result.
 */
function runArm(trial,decks){
  const sourceSeat=1-trial.seat;
  const request={
    deckA:trial.seat===0?decks.candidate:decks.source,
    deckB:trial.seat===1?decks.candidate:decks.source,
    seed:trial.seed,maxActions:registration.maxActions,
    label:['agent4-rank1-rank6-astral',trial.seed,trial.seat,
      trial.corrected?'corrected':'original'].join(':'),
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    doubleDragonRecovery:true,
    supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    capturePublicAttackTransitions:true,
    captureInitialSourceDealFingerprintSeat:sourceSeat,
    captureInitialFullPhysicalDeal:true,
    captureFinalPublicBoard:true,
    leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,
    entryDrawLockCorrection:true
  };
  let game=null,audit=null,error=null;
  try{
    const execute=()=>withPaperPromptContractPortfolio(
      ()=>runMatch(request),{requireLiveStore:true});
    const observed=trial.corrected?
      withPaperAstralBarrageTargets(execute):execute();
    game=observed.result;
    audit=observed.audit;
    assert.equal(game.engine,'twinleafgg/'+registration.nativeEnginePin);
    assert.deepEqual(game.deckHashes,[hash(request.deckA),hash(request.deckB)]);
    assert.equal(game.verifiedByDrawLog,true);
  }catch(e){
    error={name:String(e?.name??'Error'),message:String(e?.message??e)};
    audit=e?.agent41UnifiedPaperPromptPortfolio??audit;
  }
  const attacks=game?.attackTrace??[];
  const candidateAstral=attacks.filter(row=>
    row.seat===trial.seat&&row.attack==='Astral Barrage');
  const opponentAttacks=attacks.filter(row=>row.seat===sourceSeat);
  const fp=game?.initialSourceDealFingerprint??null;
  const full=game?.initialFullPhysicalDealFingerprint??null;
  return {
    trialId:request.label,seed:trial.seed,candidateSeat:trial.seat,
    sourceSeat,correctedAstral:trial.corrected,
    status:error?'NATIVE_ERROR':game.finished?'ENGINE_TERMINAL_UNQUALIFIED':
      'CENSORED_ACTION_LIMIT',
    error,
    sourcePhysicalDealSha256:fp?hash(fp):null,
    fullPhysicalDealSha256:full?hash(full):null,
    originalDeckHashes:game?.deckHashes??[hash(request.deckA),hash(request.deckB)],
    rootActions:game?.actions??null,turns:game?.turns??null,
    nativeEngineWinner:game?.finished?game.winner:null,
    candidateAstralCount:candidateAstral.length,
    candidateAstralAttacks:candidateAstral,
    sourceAttackCount:opponentAttacks.length,
    sourceAttacks:opponentAttacks.slice(-12),
    firstTurnSlot:game?.firstTurnSlot??null,
    paperPromptStatusCounts:audit?.statusCounts??null,
    paperPromptAttempted:audit?.resolvedNativeReplies??null,
    paperPromptInvalid:audit?.vetoedBeforeDispatch??null,
    liveStoreCount:audit?.liveSourceTrialCount??null,
    finalPrizesRemaining:game?.prizesRemaining??null,
    finalActivePokemon:game?.finalState?.map(x=>x.activePokemon)??null,
    qualification:'developmental-native-only'
  };
}

/** @returns {object} All scheduled original-source, both-seat contrasts. */
function main(){
  const decks=preflight();
  const rows=[];
  for(const seed of registration.randomSeeds){
    for(const seat of registration.physicalCandidateSeats){
      rows.push(runArm({seed,seat,corrected:false},decks));
      rows.push(runArm({seed,seat,corrected:true},decks));
    }
  }
  assert.equal(rows.length,16);
  const paired=[];
  for(let i=0;i<rows.length;i+=2){
    const original=rows[i],corrected=rows[i+1];
    assert.equal(original.seed,corrected.seed);
    assert.equal(original.candidateSeat,corrected.candidateSeat);
    const sourceMatch=original.sourcePhysicalDealSha256!==null&&
      original.sourcePhysicalDealSha256===corrected.sourcePhysicalDealSha256;
    const fullMatch=original.fullPhysicalDealSha256!==null&&
      original.fullPhysicalDealSha256===corrected.fullPhysicalDealSha256;
    paired.push({seed:original.seed,seat:original.candidateSeat,
      sourceDealMatch:sourceMatch,fullDealMatch:fullMatch,
      originalStatus:original.status,correctedStatus:corrected.status,
      originalAstral:original.candidateAstralCount,
      correctedAstral:corrected.candidateAstralCount,
      comparable:sourceMatch&&fullMatch});
  }
  return {
    schema:registration.schema,
    paperPromptPortfolio:VERSION,
    nativeEnginePin:registration.nativeEnginePin,
    originalCandidateRank:1,originalSourceRank:6,
    registeredSeeds:registration.randomSeeds,
    frozenGitBlobShas:registration.frozenGitBlobShas,
    sourcePrintedSixtySha256:registration.originalRank6Printed60Sha256,
    candidatePrintedSixtySha256:registration.originalRank1Printed60Sha256,
    scheduledArms:16,attemptedArms:rows.length,
    paired,rows,
    fullyQualifiedGames:0,winRateCertified:false,
    caveat:'Native original-60 developmental controls; all bot policies, printed interactions beyond examined negative prompts, historical physical legality and paper tournament clock remain unverified. Raw engine terminals are not competitive game wins.'
  };
}

if(require.main===module){
  const result=main();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.paired.some(p=>!p.comparable))process.exitCode=2;
}
module.exports={main,preflight,runArm};
