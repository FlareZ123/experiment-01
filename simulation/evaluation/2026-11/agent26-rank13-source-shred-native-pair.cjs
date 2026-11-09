'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const registration=require('../../../results/aichi-2026/registrations/agent19-dual-fixed60-four-source-papercore-prospective-20261109.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {classifyNativeAttempt}=
  require('../agent41-native-attempt-disposition.cjs');
const {EXPECTED_SOURCE_SHA}=require('./agent26-rank13-source-marnie-native-pair.cjs');

const VERSION='agent26-source-original-r13-t53-shred-after-marnie-pair-v1';
const OUTPUT=path.resolve(__dirname,'../../../agent26-rank13-shred-native-4arms.json');

/** @param {object} row @returns {object[]} */
function sourceAttacks(row){
  return (row.rootActionLedger??[]).filter(r=>
    r.playerSlot===row.sourceSeat && r.action==='AttackAction');
}

/** @param {object} control @param {object} treatment */
function compareShredAfterMarnie(control,treatment){
  assert.equal(control.trial.id,treatment.trial.id);
  assert.ok(control.trial.id.startsWith('13:1:A:'));
  assert.equal(control.sourceSeat,1);
  assert.equal(treatment.sourceSeat,1);
  const a=control.rootActionLedger??[],b=treatment.rootActionLedger??[];
  let first=0;
  while(first<Math.min(a.length,b.length)&&
      JSON.stringify(a[first])===JSON.stringify(b[first]))first++;
  if(first===a.length&&first===b.length)first=-1;
  const left=first>=0?a[first]:null,right=first>=0?b[first]:null;
  const samePhysical=Boolean(control.sourceDealFingerprint&&
    control.sourceDealFingerprint===treatment.sourceDealFingerprint);
  const sameOriginal=control.sourceDealFingerprint===EXPECTED_SOURCE_SHA&&
    treatment.sourceDealFingerprint===EXPECTED_SOURCE_SHA;
  const sameStarter=control.actualStarterSeat===1&&
    treatment.actualStarterSeat===1;
  const acceptedSourceShred=(treatment.rootActionLedger??[]).some(x=>
    x.playerSlot===1&&x.turnBefore===53&&x.action==='AttackAction'&&
    x.attack==='Shred');
  const exactFirstSourceShred=samePhysical&&sameOriginal&&sameStarter&&
    first>=0&&left?.playerSlot===1&&left.turnBefore===53&&
    left.action==='AttackAction'&&left.attack==='Overclock'&&
    right?.playerSlot===1&&right.turnBefore===53&&
    right.action==='AttackAction'&&right.attack==='Shred';
  return {trialId:control.trial.id,
    candidateId:control.trial.candidateId,
    sameSourcePhysicalOpening:samePhysical,
    sameFrozenOriginalSourceOpening:sameOriginal,
    sameActualFirstPlayer:sameStarter,
    firstDifferentRoot:first,
    firstControlRoot:left?{ordinal:left.actionOrdinal,turn:left.turnBefore,
      seat:left.playerSlot,action:left.action,attack:left.attack??null}:null,
    firstTreatmentRoot:right?{ordinal:right.actionOrdinal,turn:right.turnBefore,
      seat:right.playerSlot,action:right.action,attack:right.attack??null}:null,
    acceptedShredOnSourceT53:acceptedSourceShred,
    firstActionIsExactSourceOverclockToShred:exactFirstSourceShred,
    originalSourceSettledAttacks:
      control.sourceAttackSettlement?.settled??null,
    treatmentSourceSettledAttacks:
      treatment.sourceAttackSettlement?.settled??null,
    originalSourceAttackNames:sourceAttacks(control).map(x=>x.attack),
    treatmentSourceAttackNames:sourceAttacks(treatment).map(x=>x.attack),
    originalFinalPrizes:control.finalPrizes,
    treatmentFinalPrizes:treatment.finalPrizes,
    originalNativeDisposition:classifyNativeAttempt(control).kind,
    treatmentNativeDisposition:classifyNativeAttempt(treatment).kind,
    paperQualifiedGames:0};
}

/** @param {object} data Atomic locked persisted raw experiment. */
function save(data){
  const lock=OUTPUT+'.lock';
  const fd=fs.openSync(lock,'wx',0o600);
  const tmp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(tmp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const n=fs.openSync(tmp,'r');
    try{fs.fsyncSync(n);}finally{fs.closeSync(n);}
    fs.renameSync(tmp,OUTPUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

function run(){
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  const trials=registration.registeredTrials.filter(x=>
    x.id.startsWith('13:1:A:'));
  assert.equal(trials.length,2);
  const common={...frozen.policyOptions,...registration.commonActorOptions,
    registeredTrials:trials,registeredFrameName:VERSION,
    allowAdditionalOriginalSourceRanks:true,
    nativeRootActionLimit:registration.rootCap,
    isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:true,
    sourceScopedStrandedMarnieRoot:true
  };
  const old=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  assert.equal(old,undefined);
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  const batches={};
  try{
    for(const mode of ['marnie-control','marnie-shred']){
      batches[mode]=withPaperSemanticsProfileV1(()=>
        runDevelopment({...common,
          sourceScopedDialgaShredT53:mode==='marnie-shred'}),
        registration.profileEnabled);
    }
  }finally{
    delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  }
  const ctrl=batches['marnie-control'].result.rows;
  const test=batches['marnie-shred'].result.rows;
  assert.equal(ctrl.length,2);
  assert.equal(test.length,2);
  const pairs=ctrl.map((row,i)=>compareShredAfterMarnie(row,test[i]));
  const summary={
    sourcePhysicalMatched:pairs.filter(x=>x.sameSourcePhysicalOpening).length,
    frozenOriginalMatched:pairs.filter(x=>
      x.sameFrozenOriginalSourceOpening).length,
    exactFirstSourceOverclockToShred:pairs.filter(x=>
      x.firstActionIsExactSourceOverclockToShred).length,
    paperQualifiedGames:0,competitiveWinRate:null
  };
  const result={schema:VERSION,registration:{
    seed:1486727692,sourceSeat:1,sourceActuallyFirst:true,
    frozenOriginalSourceSha256:EXPECTED_SOURCE_SHA,
    candidateIds:trials.map(x=>x.candidateId),
    paperSemantics:registration.profileEnabled,
    nativeRootCap:registration.rootCap,
    pinnedTwinleaf:PINNED_TWINLEAF,
    retrospectiveFixture:true},
    summary,pairs,
    allNativeRows:{control:ctrl,treatment:test},
    nativeAudit:{control:batches['marnie-control'].audit,
      treatment:batches['marnie-shred'].audit},
    codeRevision:process.env.GITHUB_SHA??null,
    competitivePaperQualifiedGames:0};
  save(result);
  process.stdout.write('AGENT26_SOURCE_DIALGA_SHRED '+JSON.stringify({
    summary,pairs,output:path.basename(OUTPUT)})+'\n');
  return result;
}
if(require.main===module)run();
module.exports={VERSION,compareShredAfterMarnie,run};
