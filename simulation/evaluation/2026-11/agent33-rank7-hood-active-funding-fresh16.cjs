'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {gitBlobHash}=require('../agent42-strict-profile-preflight.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const REG_PATH='results/aichi-2026/registrations/2026-11/agent33-rank7-hood-active-funding-fresh16-20261109.json';
const REG_BLOB='d79d197c3e9459220efa5e1b6d3cc4367bd3a2e1';
const VERSION='agent33-original-rank7-hood-manual-active-funding-fresh16-native-v1';
const OUT=path.join(ROOT,'agent33-rank7-hood-active-funding-fresh16-native.json');

/**
 * The registration is immutable after creation and predates outcomes. This
 * runner uses the exact fixed original source rank7 and Hood v1 sixties.
 * @returns {object}
 */
function preflight(){
  const file=fs.readFileSync(path.join(ROOT,REG_PATH));
  assert.equal(gitBlobHash(file),REG_BLOB);
  const registration=JSON.parse(file.toString('utf8'));
  const hood=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
  assert.equal(hood.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(registration.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(registration.sourceRank,7);
  assert.equal(registration.trials.length,16);
  assert.equal(registration.totalNativeAttempts,32);
  assert.equal(registration.registeredBeforeNativeResultsForTheseSeeds,true);
  const seeds=Object.values(registration.seeds).flat();
  assert.equal(new Set(seeds).size,16);
  assert.ok(seeds.every(x=>Number.isSafeInteger(x)&&x>=0&&x<2**32));
  for(const row of registration.trials){
    assert.equal(row.candidateId,'hood-shield-v1');
    assert.equal(row.rank,7);
    assert.equal(row.id,
      [row.rank,row.repeat,row.candidateSlot,row.candidateId].join(':'));
    assert.equal(registration.seeds[row.candidateSlot][row.repeat],row.seed);
  }
  return {registration,hood};
}

/** @param {object} row @returns {object} */
function ledger(row){
  const candidateSeat=row.trial.candidateSlot==='A'?0:1;
  const nativeStatus=row.error?'engine-error':
    row.finished!==true?'censored':
    row.winner===candidateSeat?'candidate-native-terminal':
    row.winner===1-candidateSeat?'original-native-terminal':
    'other-native-terminal';
  const source=row.nativeAcceptedTargetSidecar?.events??[];
  const activeManual=source.filter(event=>
    event.playerSlot===candidateSeat&&
    event.action==='PlayCardAction'&&
    event.declared?.ownerHandPrinting?.startsWith('Psychic Energy ')&&
    event.declared?.target?.slot===1).length;
  const underworld=(row.nativeAcceptedEnergyPromptSidecar?.events??[])
    .filter(event=>event.playerSlot===candidateSeat).length;
  return {
    id:row.trial.id,sourceDealFingerprint:row.sourceDealFingerprint??null,
    entireDealFingerprint:row.fullPhysicalDealFingerprint??null,
    firstPlayerSeat:row.actualStarterSeat??null,
    nativeStatus,
    paidActivePsychicRoots:activeManual,
    acceptedUnderworldPrompts:underworld,
    candidateAttackDeclarations:row.attackDeclarations?.candidate??0,
    candidateSettledAttacks:row.candidateAttackSettlement?.settled??0,
    actionCount:row.actionCount??null,
    error:row.error?String(row.error).slice(0,300):null
  };
}

/**
 * Two paired native arms; baseline and control differ by exactly the
 * existing Agent34 Active Psychic owner-root priority flag.
 * A paired group is censored whenever either outcome is unresolved.
 */
function run(){
  const {registration,hood}=preflight();
  const common={
    ...frozen.policyOptions,
    registeredTrials:registration.trials,
    registeredCandidateDecks:{
      'hood-shield-v1':{label:'hood-shield-v1',cards:hood.cards}
    },
    registeredFrameName:registration.schema,
    allowSingleCandidatePerGroup:true,
    allowAdditionalOriginalSourceRanks:true,
    nativeRootActionLimit:260,
    isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:true,
    actorOnlyComposition:true,
    actorMewMaxMiracleOverSelfCopy:true,
    actorMewGenesectTechnoBlast:true,
    actorDceMewMobilityRoot:true,
    actorGenesectFusionDrawRoot:true,
    actorNaturalEvolutionRoot:true,
    bilateralBasicEnergyRecipientFrontier:true,
    actorUnderworldDoorPromptOwner:true,
    actorUnderworldDoorRoot:true,
    nativeAllOwnerPassFrontier:true,
    actorGuzmaPromptContinuation:true,
    actorZeroEnergyStrandFloatStoneRoot:true,
    actorSeekerGuzmaNominalKo:true
  };
  const profile={
    celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true
  };
  const prior=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let control,treatment,corrections=[];
  try{
    for(const flag of [false,true]){
      const joined=withPaperSemanticsProfileV1(()=>
        runDevelopment({...common,
          actorUnderworldActiveFundingPriority:flag}),profile);
      assert.equal(joined.result.rows.length,16);
      corrections.push(joined.audit);
      if(flag)treatment=joined.result;else control=joined.result;
    }
  }finally{
    if(prior===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=prior;
  }
  const pairs=registration.trials.map((trial,i)=>{
    const a=ledger(control.rows[i]);
    const b=ledger(treatment.rows[i]);
    assert.equal(a.id,trial.id);assert.equal(b.id,trial.id);
    const physicallyMatched=Boolean(a.sourceDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint&&
      a.entireDealFingerprint&&
      a.entireDealFingerprint===b.entireDealFingerprint&&
      a.firstPlayerSeat!==null&&
      a.firstPlayerSeat===b.firstPlayerSeat);
    return {
      trialId:trial.id,seed:trial.seed,seat:trial.candidateSlot,
      physicallyMatched,control:a,treatment:b,
      competitivePaperQualified:false
    };
  });
  const sum=(key,arm)=>pairs.reduce((n,p)=>
    n+(p[arm][key]??0),0);
  const eligible=pairs.filter(p=>p.physicallyMatched);
  const summary={
    sourceRank:7,registeredPairs:pairs.length,
    originalSourceAndHoodDealsMatched:eligible.length,
    candidateManualActivePsychicControl:sum('paidActivePsychicRoots','control'),
    candidateManualActivePsychicTreatment:
      sum('paidActivePsychicRoots','treatment'),
    candidateSettledAttackControl:sum('candidateSettledAttacks','control'),
    candidateSettledAttackTreatment:sum('candidateSettledAttacks','treatment'),
    candidateNativeTerminalsControl:pairs.filter(p=>
      p.control.nativeStatus==='candidate-native-terminal').length,
    candidateNativeTerminalsTreatment:pairs.filter(p=>
      p.treatment.nativeStatus==='candidate-native-terminal').length,
    controlCensoredOrErrored:pairs.filter(p=>
      ['censored','engine-error'].includes(p.control.nativeStatus)).length,
    treatmentCensoredOrErrored:pairs.filter(p=>
      ['censored','engine-error'].includes(p.treatment.nativeStatus)).length,
    fullIndependentPaperQualifiedGames:0
  };
  return {schema:VERSION,enginePin:PINNED_TWINLEAF,
    registrationPath:REG_PATH,registrationBlob:REG_BLOB,
    policyDifference:'actorUnderworldActiveFundingPriority false versus true',
    control,treatment,pairs,summary,corrections,developmentOnly:true};
}

/** Persist as one locked atomic archive; never overwrite an existing run. */
function save(report){
  const lock=OUT+'.lock';
  const fd=fs.openSync(lock,'wx');
  const temp=OUT+'.tmp.'+process.pid;
  try{
    assert.equal(fs.existsSync(OUT),false,
      'Do not overwrite a previous native trial archive');
    fs.writeFileSync(temp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    const tempFd=fs.openSync(temp,'r');
    try{fs.fsyncSync(tempFd);}finally{fs.closeSync(tempFd);}
    fs.renameSync(temp,OUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
if(require.main===module){
  if(process.argv.includes('--preflight')){
    const p=preflight();
    process.stdout.write('AGENT33_RANK7_FRESH16_PREFLIGHT '+
      JSON.stringify({registered:p.registration.trials.length,
        blob:REG_BLOB,qualified:0})+'\n');
  }else{
    const result=run();
    save(result);
    process.stdout.write('AGENT33_RANK7_FRESH16 '+
      JSON.stringify(result.summary)+'\n');
  }
}

module.exports={VERSION,REG_BLOB,REG_PATH,preflight,ledger,run,save};
