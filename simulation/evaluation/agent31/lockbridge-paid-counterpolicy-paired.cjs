'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../../results/aichi-2026/registrations/2026-11/agent31-lockbridge-hybrid-owner-counterpolicy-ab-20261109.json');
const candidate=require('../../../results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {classifyNativeAttempt}=require('../agent41-native-attempt-disposition.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {withProtectedHoodUnderworld,withHeldHoodToolPriority}=
  require('../../twinleaf/2026-11/agent4-hood-protected-underworld-owner-exception.cjs');

const VERSION='agent31-lockbridge-paid-hood-and-temple-owner-counterpolicy-ab-v1';
const OUTPUT=process.env.AGENT31_PAID_COUNTER_OUTPUT??
  path.resolve(__dirname,'../../../artifacts/agent31-lockbridge-paid-counterpolicy-native.json');
const digest=val=>createHash('sha256').update(JSON.stringify(val)).digest('hex');

/** @returns {object[]} Immutable 32 physical opening source groups. */
function inspect(){
  assert.equal(registration.schema,
    'agent31-20261109-lockbridge-same-deck-double-counter-policy-ab-v1');
  assert.equal(registration.status,'FROZEN BEFORE FIRST NATIVE MATCH');
  assert.equal(registration.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  assert.equal(registration.nativeRootCap,260);
  assert.equal(registration.physicalGroups,32);
  assert.equal(registration.nativeArms,64);
  assert.deepEqual(registration.originalRanks,[6,11,13,24]);
  assert.equal(registration.candidateId,candidate.label);
  assert.equal(candidate.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(registration.groups.length,32);
  assert.deepEqual(registration.policyArms.map(x=>x.id),['control','treatment']);
  assert.deepEqual(registration.policyArms.map(x=>[
    x.heldHoodPriority,x.protectedHoodUnderworld,x.templeDdeDenial
  ]),[[false,false,false],[true,true,true]]);
  const admitted=require('../agent25-authenticated-source-admission.cjs')
    .authenticatedSourceRanks(
      require('../../../results/aichi-2026/full-decklists.json'),true);
  validateRegisteredTrialGroups(registration.groups,admitted,false,true);
  assert.equal(new Set(registration.groups.map(g=>g.seed)).size,32);
  for(const rank of registration.originalRanks){
    for(const candidateSlot of ['A','B']){
      const subset=registration.groups.filter(g=>
        g.rank===rank&&g.candidateSlot===candidateSlot);
      assert.deepEqual(subset.map(g=>g.repeat),
        [20261109,20261110,20261111,20261112]);
    }
  }
  return registration.groups.map(g=>({...g}));
}

/** Get genuine native roots and disposition without hiding any failed trial. */
function diagnosis(row){
  const trial=row.trial,seat=trial.candidateSlot==='A'?0:1;
  const status=classifyNativeAttempt(row);
  const roots=row.rootActionLedger??
    row.nativeAbortEvidence?.rootActionLedger??[];
  const selected=roots.filter(r=>r.playerSlot===seat);
  const played=name=>selected.filter(root=>root.action==='PlayCardAction'&&
    (root.card===name||root.card?.startsWith(name+' '))).length;
  return {
    id:trial.id,rank:trial.rank,seed:trial.seed,
    seat,candidateId:trial.candidateId,
    nativeDisposition:status.kind,
    finished:status.kind==='ENGINE_TERMINAL',
    winner:status.kind==='ENGINE_TERMINAL'?status.winner:null,
    nativeCandidateWin:status.kind==='ENGINE_TERMINAL'&&status.winner===seat,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    nativeRootCount:roots.length,
    nativeRootSha256:digest(roots),
    attemptedHoodPlayRoots:played('Stealthy Hood'),
    attemptedTemplePlayRoots:played('Temple of Sinnoh'),
    attemptedArvenPlayRoots:played('Arven'),
    attemptedWobbuffetPlayRoots:played('Wobbuffet'),
    error:row.error?String(row.error).slice(0,1400):null,
    rootActionLedger:roots,competitivePaperQualified:false
  };
}

/** Physical source+candidate deal equivalence required for paired policy test. */
function compare(control,treatment){
  assert.equal(control.length,32);
  assert.equal(treatment.length,32);
  const groups=registration.groups.map((trial,i)=>{
    const a=control[i],b=treatment[i];
    assert.equal(a.id,trial.id);
    assert.equal(b.id,trial.id);
    const sameFullPhysicalDeal=Boolean(a.fullPhysicalDealFingerprint&&
      a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint);
    const sameSourceDeal=Boolean(a.sourceDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint);
    const sameStarter=a.actualStarterSeat!==null&&
      a.actualStarterSeat===b.actualStarterSeat;
    const comparable=sameFullPhysicalDeal&&sameSourceDeal&&sameStarter;
    const bothTerminal=a.finished&&b.finished;
    const firstDiff=a.rootActionLedger.length&&b.rootActionLedger.length?
      Array.from({length:Math.max(a.rootActionLedger.length,
        b.rootActionLedger.length)},(_,i)=>i).find(i=>
        JSON.stringify(a.rootActionLedger[i]??null)!==
        JSON.stringify(b.rootActionLedger[i]??null))??null:null;
    return {
      id:trial.id,rank:trial.rank,
      seat:trial.candidateSlot,seed:trial.seed,
      sameFullPhysicalDeal,sameSourceDeal,sameStarter,comparable,
      bothTerminal,
      nativeWinReversal:comparable&&bothTerminal&&
        a.nativeCandidateWin!==b.nativeCandidateWin,
      treatmentGain:comparable&&bothTerminal&&
        b.nativeCandidateWin&&!a.nativeCandidateWin,
      treatmentLoss:comparable&&bothTerminal&&
        a.nativeCandidateWin&&!b.nativeCandidateWin,
      firstDifferentAcceptedRoot:firstDiff,
      firstControlAcceptedRoot:firstDiff===null?null:
        a.rootActionLedger[firstDiff]??null,
      firstTreatmentAcceptedRoot:firstDiff===null?null:
        b.rootActionLedger[firstDiff]??null,
      control:a,treatment:b,competitivePaperQualified:false
    };
  });
  const arms=groups.flatMap(g=>[g.control,g.treatment]);
  const byArm={};
  for(const [label,selector] of [
    ['control',g=>g.control],['treatment',g=>g.treatment]
  ]){
    const list=groups.map(selector);
    byArm[label]={
      nativeTerminals:list.filter(x=>x.finished).length,
      nativeWins:list.filter(x=>x.nativeCandidateWin).length,
      actionCaps:list.filter(x=>x.nativeDisposition==='ACTION_CAP').length,
      errors:list.filter(x=>x.nativeDisposition==='NATIVE_ABORT').length,
      otherCensored:list.filter(x=>!x.finished&&
        x.nativeDisposition!=='ACTION_CAP'&&
        x.nativeDisposition!=='NATIVE_ABORT').length,
      genuineHoodPlayRoots:list.reduce((n,x)=>n+x.attemptedHoodPlayRoots,0),
      genuineTemplePlayRoots:list.reduce((n,x)=>n+x.attemptedTemplePlayRoots,0),
      genuineArvenPlayRoots:list.reduce((n,x)=>n+x.attemptedArvenPlayRoots,0)
    };
  }
  const summary={
    registeredPhysicalGroups:32,
    nativeGameAttempts:arms.length,
    matchedFullPhysicalInitialDeals:groups
      .filter(g=>g.sameFullPhysicalDeal).length,
    matchedSourceInitialDeals:groups.filter(g=>g.sameSourceDeal).length,
    matchedStarterSeat:groups.filter(g=>g.sameStarter).length,
    comparableMatchedPhysicalGroups:groups.filter(g=>g.comparable).length,
    matchedBothNaturallyTerminal:groups
      .filter(g=>g.comparable&&g.bothTerminal).length,
    treatmentNativeWinnerGains:groups.filter(g=>g.treatmentGain).length,
    treatmentNativeWinnerLosses:groups.filter(g=>g.treatmentLoss).length,
    byArm,
    originalRanks:registration.originalRanks,
    paperQualifiedGames:0,
    competitiveWinRateClaim:null
  };
  return {summary,groups,
    admission:groups.every(g=>g.control.nativeRootCount===0&&
      g.treatment.nativeRootCount===0)?
      'INVALID_NO_NATIVE_ACTIONS':'DEVELOPMENT_ONLY'};
}

/** Lock and atomically replace one output. */
function save(record){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',temp=OUTPUT+'.tmp.'+process.pid;
  const fd=fs.openSync(lock,'wx',0o600);
  try{
    fs.writeFileSync(temp,JSON.stringify(record)+'\n',{flag:'wx'});
    const file=fs.openSync(temp,'r');
    try{fs.fsyncSync(file);}finally{fs.closeSync(file);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
/** Execute both policy states with exactly the same printed candidate 60. */
function run(){
  const groups=inspect();
  const flags=[
    ['AGENT2_HELD_GUZMA_MOBILITY_DEV','true'],
    ['AGENT4_NATIVE_PAYMENT_RECEIPT_DEV','true']
  ];
  const old=flags.map(([key])=>process.env[key]);
  flags.forEach(([k,v])=>{process.env[k]=v;});
  const undoDoor=installUnderworldDoorPsychicRecipientHook();
  const native=[];
  try{
    for(const arm of registration.policyArms){
      const invoke=()=>withPaperSemanticsProfileV1(()=>runDevelopment({
        ...frozen.policyOptions,
        registeredTrials:groups,
        registeredFrameName:VERSION+'-'+arm.id,
        registeredCandidateDecks:{[registration.candidateId]:candidate},
        allowSingleCandidatePerGroup:true,
        allowAdditionalOriginalSourceRanks:true,
        nativeRootActionLimit:registration.nativeRootCap,
        isolatePolicyRandomness:true,
        isolatePhysicalShuffleRandomnessAfterSetup:true,
        bilateralBasicEnergyRecipientFrontier:true,
        actorUnderworldDoorPromptOwner:true,
        actorUnderworldDoorRoot:true,
        actorFundedShadowRiderFloatStoneRoot:false,
        actorGuzmaPromptContinuation:true,
        actorZeroEnergyStrandFloatStoneRoot:true,
        actorSeekerGuzmaNominalKo:true,
        actorZeroEnergyStrandFloatStoneTargetTurn:null,
        actorZeroEnergyStrandFloatStoneOwnerSeat:null,
        actorSeekerGuzmaOwnerSeat:null,
        actorSeekerGuzmaGlobalTurn:null,
        actorTempleDdeDenialRoot:arm.templeDdeDenial
      }),{
        celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true
      });
      const batch=arm.id==='treatment'?
        withProtectedHoodUnderworld(()=>
          withHeldHoodToolPriority(invoke)): {result:invoke(),audit:null};
      assert.equal(batch.result.result.attempted,32);
      assert.equal(batch.result.result.rows.length,32);
      native.push({
        arm:arm.id,
        hoodAbilityAudit:batch.audit,
        paperProfileAudit:batch.result.audit,
        batch:batch.result.result
      });
    }
  }finally{
    undoDoor();
    flags.forEach(([key],i)=>{
      if(old[i]===undefined)delete process.env[key];
      else process.env[key]=old[i];
    });
  }
  const control=native[0].batch.rows.map(diagnosis);
  const treatment=native[1].batch.rows.map(diagnosis);
  const outcome=compare(control,treatment);
  const record={
    schema:VERSION,preregistration:registration.schema,
    registration,unmodifiedPrintedSixty:candidate,
    originalOpponentsExactSixties:true,
    sampleUnit:'independent 32 original physical seed groups; 64 correlated policy arms',
    enginePin:PINNED_TWINLEAF,
    sameEngineAndPaperHookProfileBothArms:true,
    sameOwnerPolicyExceptPaidHoodAndTempleCounterline:true,
    samePrintedCandidateAndSourcesBothArms:true,
    noOfficialPaperGameQualification:true,
    githubSha:process.env.GITHUB_SHA??null,
    outcome,native
  };
  save(record);
  process.stdout.write('AGENT31_LOCKBRIDGE_PAID_COUNTERPOLICY_NATIVE '+
    JSON.stringify({summary:outcome.summary,
      treatmentHoodAbilityAudit:native[1].hoodAbilityAudit,
      pairedWinnerReversals:outcome.groups.filter(g=>g.nativeWinReversal)
        .map(g=>({
          id:g.id,rank:g.rank,seat:g.seat,
          treatmentGain:g.treatmentGain,
          treatmentLoss:g.treatmentLoss,
          firstDifferentAcceptedRoot:g.firstDifferentAcceptedRoot,
          controlFirst:g.firstControlAcceptedRoot,
          treatmentFirst:g.firstTreatmentAcceptedRoot
        })),
      output:OUTPUT})+'\n');
  return record;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify(inspect())+'\n');
  else{
    const record=run();
    if(record.outcome.admission!=='DEVELOPMENT_ONLY')
      process.exitCode=1;
  }
}
module.exports={VERSION,inspect,diagnosis,compare,run};
