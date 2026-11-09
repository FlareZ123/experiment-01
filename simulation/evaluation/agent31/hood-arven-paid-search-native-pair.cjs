'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const registration=require('../../../results/aichi-2026/registrations/2026-11/agent31-hood-arven-paid-owner-search-native-ab-20261109.json');
const candidate=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {classifyNativeAttempt}=
  require('../agent41-native-attempt-disposition.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {withProtectedHoodUnderworld,withHeldHoodToolPriority}=
  require('../../twinleaf/2026-11/agent4-hood-protected-underworld-owner-exception.cjs');

const VERSION='agent31-hood-shield-first-native-arven-hood-search-policy-ab-v1';
const OUTPUT=process.env.AGENT31_HOOD_ARVEN_OUTPUT??
  path.resolve(__dirname,'../../../artifacts/agent31-hood-arven-native-pair.json');

/** Verify every 60, original and sealed independent source trial. */
function inspect(){
  assert.equal(registration.schema,
    'agent31-hood-shield-arven-first-native-paid-search-ab-v1');
  assert.equal(registration.status,'FROZEN BEFORE FIRST NATIVE STORE GAME');
  assert.equal(registration.enginePin,PINNED_TWINLEAF);
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  assert.equal(registration.sourceGroups,48);
  assert.equal(registration.nativeArms,96);
  assert.equal(registration.rootCap,260);
  assert.deepEqual(registration.originalSourceRanks,[6,11,24,29]);
  assert.equal(registration.groups.length,48);
  assert.equal(candidate.cards.reduce((n,c)=>n+c.count,0),60);
  assert.deepEqual(registration.policyArms.map(x=>x.id),
    ['control','treatment']);
  assert.deepEqual(registration.policyArms.map(x=>x.arvenHoodSearch),
    [false,true]);
  assert.ok(registration.policyArms.every(x=>
    x.heldHoodPriority&&x.protectedHoodUnderworld));
  const admitted=require('../agent25-authenticated-source-admission.cjs')
    .authenticatedSourceRanks(
      require('../../../results/aichi-2026/full-decklists.json'),true);
  validateRegisteredTrialGroups(registration.groups,admitted,false,true);
  assert.equal(new Set(registration.groups.map(x=>x.seed)).size,48);
  for(const rank of registration.originalSourceRanks)
    for(const slot of ['A','B']){
      const actual=registration.groups.filter(g=>
        g.rank===rank&&g.candidateSlot===slot);
      assert.equal(actual.length,6);
      assert.deepEqual(actual.map(x=>x.repeat),
        [20261109,20261110,20261111,20261112,20261113,20261114]);
    }
  return registration.groups.map(x=>({...x}));
}

/** Native game-level physical actions and outcome, preserving all censors. */
function decode(row){
  const seat=row.trial.candidateSlot==='A'?0:1;
  const status=classifyNativeAttempt(row);
  const roots=row.rootActionLedger??
    row.nativeAbortEvidence?.rootActionLedger??[];
  const own=roots.filter(x=>x.playerSlot===seat);
  const plays=name=>own.filter(root=>root.action==='PlayCardAction'&&
    (root.card===name||root.card?.startsWith(name+' '))).length;
  const finished=status.kind==='ENGINE_TERMINAL';
  return {
    id:row.trial.id,rank:row.trial.rank,
    seat,seed:row.trial.seed,
    finished,
    nativeDisposition:status.kind,
    nativeWinner:finished?status.winner:null,
    candidateWon:finished&&status.winner===seat,
    sourceFingerprint:row.sourceDealFingerprint??null,
    fullFingerprint:row.fullPhysicalDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    acceptedNativeRoots:roots.length,
    playedArven:plays('Arven'),
    playedStealthyHood:plays('Stealthy Hood'),
    playedGuzma:plays('Guzma'),
    playedPokemonRanger:plays('Pokémon Ranger'),
    actualArvenSearchPromptChoices:own.filter(x=>
      x.action==='ResolvePromptAction').length,
    error:row.error?String(row.error).slice(0,1600):null,
    rootActionLedger:roots,paperQualified:false
  };
}

/** Compare only the same exact two-player physical setup and starter. */
function compare(left,right){
  assert.equal(left.length,48);assert.equal(right.length,48);
  const groups=registration.groups.map((trial,i)=>{
    const a=left[i],b=right[i];
    assert.equal(a.id,trial.id);assert.equal(b.id,trial.id);
    const sameSource=Boolean(a.sourceFingerprint&&
      a.sourceFingerprint===b.sourceFingerprint);
    const sameFull=Boolean(a.fullFingerprint&&
      a.fullFingerprint===b.fullFingerprint);
    const sameStarter=a.actualStarterSeat!==null&&
      a.actualStarterSeat===b.actualStarterSeat;
    const matched=sameSource&&sameFull&&sameStarter;
    const bothTerminal=a.finished&&b.finished;
    let firstDifferentRoot=null;
    for(let j=0;j<Math.max(a.rootActionLedger.length,
      b.rootActionLedger.length);j++){
      const ga=a.rootActionLedger[j]??null;
      const gb=b.rootActionLedger[j]??null;
      const shape=x=>x?[
        x.actionOrdinal,x.playerSlot,x.action,x.card??null,
        x.attack??null,x.turnBefore??null
      ]:null;
      if(JSON.stringify(shape(ga))!==JSON.stringify(shape(gb))){
        firstDifferentRoot=j;break;
      }
    }
    return {
      id:trial.id,rank:trial.rank,slot:trial.candidateSlot,
      seed:trial.seed,sameSource,sameFull,sameStarter,
      matched,bothTerminal,
      winnerDiffers:matched&&bothTerminal&&
        a.candidateWon!==b.candidateWon,
      treatmentGain:matched&&bothTerminal&&
        b.candidateWon&&!a.candidateWon,
      treatmentLoss:matched&&bothTerminal&&
        a.candidateWon&&!b.candidateWon,
      firstDifferentRoot,
      firstControlRoot:firstDifferentRoot===null?null:
        a.rootActionLedger[firstDifferentRoot]??null,
      firstTreatmentRoot:firstDifferentRoot===null?null:
        b.rootActionLedger[firstDifferentRoot]??null,
      control:a,treatment:b,paperQualified:false
    };
  });
  const byArm={};
  for(const [id,key] of [['control','control'],
    ['treatment','treatment']]){
    const rows=groups.map(g=>g[key]);
    byArm[id]={
      nativeWins:rows.filter(x=>x.candidateWon).length,
      naturallyTerminal:rows.filter(x=>x.finished).length,
      rootCaps:rows.filter(x=>x.nativeDisposition==='ACTION_CAP').length,
      errors:rows.filter(x=>x.nativeDisposition==='NATIVE_ABORT').length,
      otherCensored:rows.filter(x=>!x.finished&&
        x.nativeDisposition!=='ACTION_CAP'&&
        x.nativeDisposition!=='NATIVE_ABORT').length,
      actualArvenPlays:rows.reduce((n,x)=>n+x.playedArven,0),
      actualHoodPlays:rows.reduce((n,x)=>n+x.playedStealthyHood,0)
    };
  }
  return {
    summary:{
      independentSourceDealGroups:groups.length,
      realNativeGames:96,
      sourcePhysicalMatched:groups.filter(x=>x.sameSource).length,
      fullPhysicalMatched:groups.filter(x=>x.sameFull).length,
      sameActualStarter:groups.filter(x=>x.sameStarter).length,
      fullyComparable:groups.filter(x=>x.matched).length,
      bothNaturallyTerminal:groups.filter(x=>
        x.matched&&x.bothTerminal).length,
      nativeWinnerGains:groups.filter(x=>x.treatmentGain).length,
      nativeWinnerLosses:groups.filter(x=>x.treatmentLoss).length,
      byArm,
      paperQualifiedGames:0,
      verified99Point5:false
    },
    groups,
    admission:groups.every(g=>g.control.acceptedNativeRoots===0&&
      g.treatment.acceptedNativeRoots===0)?
      'INVALID_ZERO_NATIVE_ROOTS':'DEVELOPMENT_ONLY'
  };
}
function save(record){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',temp=OUTPUT+'.tmp.'+process.pid;
  const fd=fs.openSync(lock,'wx',0o600);
  try{
    fs.writeFileSync(temp,JSON.stringify(record)+'\n',{flag:'wx'});
    const f=fs.openSync(temp,'r');
    try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function run(){
  const groups=inspect();
  const keys=[
    ['AGENT2_HELD_GUZMA_MOBILITY_DEV','true'],
    ['AGENT4_NATIVE_PAYMENT_RECEIPT_DEV','true']
  ];
  const before=keys.map(([key])=>process.env[key]);
  keys.forEach(([key,value])=>{process.env[key]=value;});
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  const native=[];
  try{
    for(const arm of registration.policyArms){
      const invoke=()=>withPaperSemanticsProfileV1(()=>
        runDevelopment({
          ...frozen.policyOptions,
          registeredTrials:groups,
          registeredFrameName:VERSION+'-'+arm.id,
          registeredCandidateDecks:{[registration.candidateId]:candidate},
          allowSingleCandidatePerGroup:true,
          allowAdditionalOriginalSourceRanks:true,
          nativeRootActionLimit:registration.rootCap,
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
          actorArvenHoodSearchRoot:arm.arvenHoodSearch
        }),{celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true});
      const wrapping=withProtectedHoodUnderworld(
        ()=>withHeldHoodToolPriority(invoke));
      assert.equal(wrapping.result.result.attempted,48);
      native.push({
        arm:arm.id,
        hoodAbilityAudit:wrapping.audit,
        paperProfileAudit:wrapping.result.audit,
        batch:wrapping.result.result
      });
    }
  }finally{
    restoreDoor();
    keys.forEach(([key],i)=>{
      if(before[i]===undefined)delete process.env[key];
      else process.env[key]=before[i];
    });
  }
  const results=compare(
    native[0].batch.rows.map(decode),
    native[1].batch.rows.map(decode));
  const record={
    schema:VERSION,registration,candidatePrintedSixty:candidate,
    fixedBothPoliciesSamePhysicalSixty:true,
    symmetricSourceAndCandidatePlayerRoots:true,
    nativePin:PINNED_TWINLEAF,
    gameResultQualification:'development-only',
    codeCommit:process.env.GITHUB_SHA??null,
    results,native
  };
  save(record);
  process.stdout.write('AGENT31_HOOD_ARVEN_NATIVE '+
    JSON.stringify({
      summary:results.summary,
      hoodAbilityAudit: native.map(x=>x.hoodAbilityAudit),
      differences:results.groups.filter(g=>g.firstDifferentRoot!==null)
        .slice(0,14).map(g=>({
          id:g.id,rank:g.rank,
          firstDifferentRoot:g.firstDifferentRoot,
          controlRoot:g.firstControlRoot,
          treatmentRoot:g.firstTreatmentRoot,
          winnerDiffers:g.winnerDiffers
        })),
      output:OUTPUT})+'\n');
  return record;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify(inspect())+'\n');
  else{
    const result=run();
    if(result.results.admission!=='DEVELOPMENT_ONLY')
      process.exitCode=1;
  }
}
module.exports={VERSION,inspect,decode,compare,run};
