'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../results/aichi-2026/registrations/agent39-rank16-natural-direct-shake-20261102.json');

const ROOT=path.resolve(__dirname,'../..');
const SCHEMA='agent39-rank16-original-direct-shake-native-v1';
const REGISTRATION_PATH='results/aichi-2026/registrations/agent39-rank16-natural-direct-shake-20261102.json';
const CANDIDATE_IDS=['champion-reference','new-moon-lockbreaker-v1'];
const MAX_ACTIONS=96;

/** @param {string|Buffer} data @returns {string} */
function sha256(data){
  return createHash('sha256').update(data).digest('hex');
}
/** @param {Buffer} data @returns {string} */
function gitBlob(data){
  return createHash('sha1').update('blob '+data.length+'\0')
    .update(data).digest('hex');
}

/** A once-preregistered independent source-deal frame, never seed-selected post hoc. */
function scheduledArms(){
  assert.equal(registration.schema,'agent39-rank16-natural-source-shake-v1');
  assert.equal(registration.originalRank,16);
  assert.equal(registration.seedGroups,32);
  assert.equal(registration.nativeArms,64);
  assert.equal(registration.unmodifiedControlArms,64);
  assert.equal(registration.maxNativeRootActions,MAX_ACTIONS);
  assert.deepEqual(registration.candidateIds,CANDIDATE_IDS);
  const groups=registration.seedFrame;
  assert.equal(groups.length,32);
  assert.equal(sha256(JSON.stringify(groups)),registration.seedFrameSha256);
  const distinct=new Set();
  for(let group=0;group<groups.length;group++){
    const row=groups[group];
    assert.equal(row.group,group);
    assert.equal(row.sourceSeat,group%2);
    assert.ok(Number.isSafeInteger(row.seed)&&row.seed>=0&&row.seed<=0xffffffff);
    assert.equal(row.seed,createHash('sha256')
      .update(registration.seedLabel+':'+group).digest().readUInt32BE(0));
    assert.ok(!distinct.has(row.seed));
    distinct.add(row.seed);
  }
  const trials=groups.flatMap(row=>CANDIDATE_IDS.map(candidateId=>({
    ...row,candidateId,id:[16,row.group,row.sourceSeat,candidateId].join(':')
  })));
  assert.equal(trials.length,64);
  assert.equal(new Set(trials.map(row=>row.id)).size,64);
  return trials;
}

/** Exact published source identity gate, independent of printed English alias count. */
function validateSource(){
  const bytes=fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'));
  assert.equal(gitBlob(bytes),registration.sourceRosterGitBlobSha);
  const source=JSON.parse(bytes.toString('utf8'));
  const original=source.decks.find(row=>row.rank===16);
  assert.equal(original?.player,registration.sourcePlayer);
  assert.equal(original?.archetype,registration.sourceArchetype);
  assert.equal(original.cards.reduce((n,row)=>n+row.count,0),60);
  const printed=original.cards.map(card=>[
    card.category,card.name,card.count,card.printing.set,
    card.printing.number,card.printing.language
  ]).sort((a,b)=>{
    const left=JSON.stringify(a),right=JSON.stringify(b);
    return left<right?-1:left>right?1:0;
  });
  assert.equal(sha256(JSON.stringify(printed)),
    registration.originalPrinted60Sha256);
  return original;
}

/** @param {object} e Native action ledger element */
function rootPublic(e){
  return {ordinal:e.actionOrdinal??null,turn:e.turnBefore??null,
    seat:e.playerSlot??null,action:e.action??null,
    card:e.card??null,attack:e.attack??null};
}

/** @param {object} game Complete actual Store result. @param {0|1} sourceSeat */
function summarizeGame(game,sourceSeat){
  const decisionTrace=game.decisionTrace??[];
  const roots=game.rootActionLedger??[];
  const nativeFirstTurn=game.firstTurnSlot===sourceSeat?1:2;
  const sourceRoots=roots.filter(row=>
    row.playerSlot===sourceSeat&&row.turnBefore===nativeFirstTurn&&
    row.pendingPrompt==null);
  return {
    nativeFinished:game.finished===true,
    nativeEndReason:game.endReason??null,
    rootActionCount:game.actions??null,
    actualFirstSeat:game.firstTurnSlot??null,
    sourceActuallyFirst:game.firstTurnSlot===sourceSeat,
    sourceDeal:game.initialSourceDealFingerprint??null,
    physicalFullDeal:game.initialFullPhysicalDealFingerprint??null,
    decisionTraceSha256:sha256(JSON.stringify(decisionTrace)),
    firstSourceOwnTurn:nativeFirstTurn,
    firstSourceRootActions:sourceRoots.map(rootPublic),
    sourceRootsObserved:sourceRoots.length,
    nativeGameWinnerExcludedFromResearchOutcome:true
  };
}

/** Fixed labels: no terminal/result is a paper-game winner. */
function classifyPair(control,treatment,audit){
  if(control.error||treatment.error)return 'NATIVE_ERROR';
  if(!control.game?.sourceDeal||!treatment.game?.sourceDeal)
    return 'SOURCE_DEAL_UNVERIFIED';
  if(JSON.stringify(control.game.sourceDeal)!==
     JSON.stringify(treatment.game.sourceDeal))
    return 'SOURCE_DEAL_DIFFERENT';
  if(audit?.opportunityTurn===null)
    return control.game.decisionTraceSha256===
      treatment.game.decisionTraceSha256?
      'NO_OPPORTUNITY_TRACE_IDENTICAL':'NO_OPPORTUNITY_TRACE_DIFFERENT';
  if(audit?.completed===true)return 'NATIVE_DIRECT_LOCK_LINE_OBSERVED';
  if(audit?.aborted)return 'OWNER_SELECTED_LINE_ABORTED';
  return 'OWNER_SELECTED_LINE_INCOMPLETE';
}

/** @param {object} trial Preregistered source seat/seed/candidate. */
function runTrial(trial,prepared,Store,{powerReplyObserver=false}={}){
  const source=prepared.get(trial.candidateId);
  const candidateSeat=1-trial.sourceSeat;
  const candidate=source.plan.candidate.cards;
  const opponent=source.plan.opponents.find(row=>row.rank===16);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const request={
    deckA:trial.sourceSeat===0?opponent.cards:candidate,
    deckB:trial.sourceSeat===1?opponent.cards:candidate,
    seed:trial.seed,maxActions:MAX_ACTIONS,
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    doubleDragonRecovery:true,
    supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,
    leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,
    entryDrawLockCorrection:true,
    captureDecisionTrace:true,
    captureInitialSourceDealFingerprintSeat:trial.sourceSeat,
    captureInitialFullPhysicalDeal:true,
    label:SCHEMA+':'+trial.id
  };
  const {runMatch}=require('../twinleaf/headless.cjs');
  const {withRank11DirectBoostShake}=
    require('../twinleaf/rank11-direct-boostshake.cjs');
  const {withRank8AuthenticK0Observer}=
    require('../twinleaf/agent44-rank8-box-k0-source-census.cjs');
  /** @param {()=>object} execute */
  const capture=execute=>{
    try{
      const observed=withRank8AuthenticK0Observer(
        Store,trial.sourceSeat,powerReplyObserver?()=>
          require('../twinleaf/agent39-rank16-original-power-reply.cjs')
            .withOriginalSourcePowerReply(Store,trial.sourceSeat,execute):
          execute);
      const raw=powerReplyObserver?observed.result.result:observed.result;
      const replyPowerAudit=powerReplyObserver?observed.result.audit:null;
      return {error:null,game:raw?.policyAudit?null:
        summarizeGame(raw,trial.sourceSeat),
        sourceK0:observed.sourceK0,raw,replyPowerAudit};
    }catch(error){
      return {error:{name:error?.name??'Error',
        message:String(error?.message??error).slice(0,500)},
        game:null,sourceK0:null,raw:null};
    }
  };
  const control=capture(()=>runMatch(request));
  const treatment=capture(()=>withRank11DirectBoostShake(
    trial.sourceSeat,()=>runMatch(request),
    registration.policyParameters));
  // The treatment returns a wrapper result. Reconcile without changing the
  // independent control/error denominators.
  const nativeTreatment=treatment.raw;
  if(nativeTreatment&&nativeTreatment.policyAudit){
    treatment.game=summarizeGame(nativeTreatment.result,trial.sourceSeat);
    treatment.audit=nativeTreatment.policyAudit;
  }
  const audit=treatment.audit??null;
  const decision=treatment.game??null;
  const replies=audit?.completed&&decision?
    (nativeTreatment?.result?.rootActionLedger??[]).filter(row=>
      row.playerSlot===candidateSeat &&
      row.turnBefore===audit.opportunityTurn+1 &&
      row.pendingPrompt==null).slice(0,12).map(rootPublic):[];
  const status=classifyPair(control,treatment,audit);
  const ctrl=control.game,treat=treatment.game;
  const result={
    id:trial.id,group:trial.group,sourceSeat:trial.sourceSeat,
    candidateId:trial.candidateId,seed:trial.seed,
    baseline:{error:control.error,game:ctrl,sourceK0:control.sourceK0,
      ...(powerReplyObserver?{replyPowerAudit:control.replyPowerAudit}: {})},
    intervention:{
      error:treatment.error,game:treat,
      sourceK0:treatment.sourceK0,
      policyAudit:audit,
      ...(powerReplyObserver?{replyPowerAudit:treatment.replyPowerAudit}: {})
    },
    status,
    exactlySameSourcePhysicalDeal:
      ctrl?.sourceDeal&&treat?.sourceDeal?
        JSON.stringify(ctrl.sourceDeal)===JSON.stringify(treat.sourceDeal):null,
    sameOriginalFirstOwnHand:
      control.sourceK0&&treatment.sourceK0?
        JSON.stringify(control.sourceK0.ownerHandPrintings)===
        JSON.stringify(treatment.sourceK0.ownerHandPrintings):null,
    completeLineNextCandidateTurnRoots:replies,
    verifiedMeaningfulOpponentReply:false,
    independentPaperPromptQualification:false,
    competitiveGameQualified:false
  };
  delete control.raw;
  delete treatment.raw;
  return result;
}

/** @param {number} partition Prespecified group blocks of 8, from 0 to 3. */
function run(partition=0,{powerReplyObserver=false}={}){
  assert.ok(Number.isSafeInteger(partition)&&partition>=0&&partition<4);
  const scheduled=scheduledArms();
  validateSource();
  const selected=scheduled.filter(row=>Math.floor(row.group/8)===partition);
  assert.equal(selected.length,16);
  const {planAichi}=require('./aichi-pilot.cjs');
  const {loadNewMoonCandidate}=
    require('../../scripts/aichi-new-moon-candidate.cjs');
  const published=JSON.parse(fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const reference=published.decks.find(row=>row.rank===1);
  assert.equal(reference?.cards.reduce((n,row)=>n+row.count,0),60);
  const moon=loadNewMoonCandidate();
  assert.equal(moon.cards.reduce((n,row)=>n+row.count,0),60);
  const candidates=new Map([
    ['champion-reference',{label:'champion-reference',cards:reference.cards}],
    ['new-moon-lockbreaker-v1',{label:'new-moon-lockbreaker-v1',cards:moon.cards}]
  ].map(([id,manifest])=>[id,{
    plan:planAichi(manifest,{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    })}]));
  for(const item of candidates.values())
    assert.equal(item.plan.engineRevision,registration.enginePin);
  const {initializeCards}=require('../twinleaf/headless.cjs');
  initializeCards();
  const engineBase=path.join(ROOT,'vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(engineBase,'game/store/store'));
  const rows=selected.map(trial=>runTrial(trial,candidates,Store,{powerReplyObserver}));
  assert.equal(rows.length,16);
  const counts={};
  for(const row of rows)counts[row.status]=(counts[row.status]??0)+1;
  const crossCandidateSourcePairs=[];
  for(let group=partition*8;group<partition*8+8;group++){
    const pair=rows.filter(row=>row.group===group);
    assert.equal(pair.length,2);
    const first=pair[0].intervention.game?.sourceDeal;
    const second=pair[1].intervention.game?.sourceDeal;
    crossCandidateSourcePairs.push({group,
      status:!first||!second?'UNVERIFIED':
        JSON.stringify(first)===JSON.stringify(second)?
        'EXACT_SOURCE_DEAL_MATCH':'SOURCE_DEAL_DIFFERENT'
    });
  }
  return {
    schema:powerReplyObserver?SCHEMA+'-read-only-reply-v1':SCHEMA,
    originalNativePanelProtocol:SCHEMA,powerReplyObserver,
    preregistration:REGISTRATION_PATH,
    researchHeadCommit:process.env.GITHUB_SHA??null,
    nativeEnginePin:registration.enginePin,
    partition,registeredSeedGroups:32,registeredTreatmentArms:64,
    scheduledPartitionArms:16,actualPartitionArms:rows.length,
    maxNativeRootActions:MAX_ACTIONS,sourceRank:16,
    experimentalPolicy:'original-owner-first-turn direct Shake reused rank11 action policy',
    noPostHocDealSelection:true,baselineVsTreatment:true,
    counts,sourcePhysicalPairs:crossCandidateSourcePairs,
    nativeCompleted:rows.filter(row=>
      row.intervention.policyAudit?.completed===true).length,
    nativeSelectedOpportunities:rows.filter(row=>
      Number.isSafeInteger(row.intervention.policyAudit?.opportunityTurn)).length,
    competitivelyQualifiedGames:0,
    caveat:'Preregistered original-source physical deals. Native root selections and K1 prompts are development observations. Candidate policy, paper game/legal opponent replies and event time controls are not certified. No matchup win-rate inference.',
    rows
  };
}
if(require.main===module){
  const partition=Number(process.env.AGENT39_RANK16_PARTITION??'0');
  process.stdout.write(JSON.stringify(run(partition,{
    powerReplyObserver:process.env.AGENT39_RANK16_POWER_REPLY==='true'
  }),null,2)+'\n');
}
module.exports={SCHEMA,scheduledArms,validateSource,rootPublic,
  summarizeGame,classifyPair,runTrial,run};
