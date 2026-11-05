'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {STEPS}=require('../simulation/twinleaf/agent2-multi-basic-retreat-pass-cascade.cjs');
const {countStages,compareSamePolicy}=
  require('../simulation/evaluation/agent6-recipient-paid-pass-cascade.cjs');

/** @param {0|1} seat @param {number} firstFailed Index or -1. */
function row(seat,firstFailed){
  const stages={},cumulative={};
  for(let i=0;i<STEPS.length;i++){
    stages[STEPS[i]]=i!==firstFailed;
    cumulative[STEPS[i]]=firstFailed<0||i<firstFailed;
  }
  return {actorSeat:seat,stages,cumulative,
    firstFailure:firstFailed<0?null:STEPS[firstFailed],
    wouldNominallyOffer:firstFailed<0};
}

/** @returns {object} A synthetic consistent Store-sidecar game. */
function arm(){
  return {
    status:'native-terminal',
    originalSource60Hash:'72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f',
    originalReference60Hash:'de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311',
    actualFirstSeat:0,nativeVerifiedStartByDraw:true,
    fullDealSha256:'same-full',rank3DealSha256:'same-rank3',
    rootLedgerSha256:'root',rootActionLedger:[{
      actionOrdinal:0,playerSlot:1,action:'PassTurnAction'
    }],
    finalPublicBoard:[{active:{name:'Test'},bench:[]}],
    winner:0,endReason:'test',actions:10,globalTurns:4,
    genericAudit:{
      version:'test',originalPassesBySeat:[1,0],
      nominalOffersBySeat:[0,0],proposedActions:[]
    },
    nativeAcceptedTargetSidecar:{sha256:'same-sidecar'}
  };
}

test('count all eligible Pass roots and first-failure rejection partition',()=>{
  const result=countStages([row(0,-1),row(1,2),row(0,0)]);
  assert.equal(result.originalPasses,3);
  assert.equal(result.nominallyEligible,1);
  assert.equal(result.firstFailures[STEPS[0]],1);
  assert.equal(result.firstFailures[STEPS[2]],1);
  assert.equal(result.independent[STEPS[2]],2);
  assert.equal(result.cumulative[STEPS[2]],1);
  assert.deepEqual(result.perSeat.map(x=>x.originalPasses),[2,1]);
  assert.deepEqual(result.perSeat.map(x=>x.nominallyEligible),[1,0]);
  assert.equal(result.firstFailurePartitionComplete,true);
});

test('only independent surviving stages count after an earlier veto',()=>{
  const result=countStages([row(1,3)]);
  assert.equal(result.independent[STEPS[4]],1);
  assert.equal(result.cumulative[STEPS[4]],0);
  assert.equal(result.firstFailures[STEPS[3]],1);
});

test('zero Pass roots have zero opportunities and complete partition',()=>{
  const result=countStages([]);
  assert.equal(result.originalPasses,0);
  assert.equal(result.nominallyEligible,0);
  assert.equal(result.firstFailurePartitionComplete,true);
  assert.deepEqual(result.perSeat.map(x=>x.originalPasses),[0,0]);
});

test('unknown seat or incomplete actor observation fails closed',()=>{
  assert.throws(()=>countStages([{...row(0,2),actorSeat:2}]));
  const broken=row(1,3);
  delete broken.cumulative[STEPS[4]];
  assert.throws(()=>countStages([broken]));
});

test('exact original same-policy replay can pass all custody gates',()=>{
  const a=arm();
  const b=structuredClone(a);
  assert.equal(compareSamePolicy(a,b).samePolicy,true);
  assert.equal(Object.values(compareSamePolicy(a,b).checks)
    .every(Boolean),true);
});

test('changed physical source deal vetoes matched-pair assertion',()=>{
  const a=arm(),b=structuredClone(a);
  b.rank3DealSha256='mismatched';
  const result=compareSamePolicy(a,b);
  assert.equal(result.samePolicy,false);
  assert.equal(result.checks.physicalDeal,false);
});

test('same root SHA with changed target or outcome still fails closed',()=>{
  const a=arm(),b=structuredClone(a);
  b.nativeAcceptedTargetSidecar.sha256='different-native-target';
  assert.equal(compareSamePolicy(a,b).checks.targetSidecar,false);
  b.nativeAcceptedTargetSidecar.sha256='same-sidecar';
  b.finalPublicBoard[0].bench=[{pokemon:'changed'}];
  assert.equal(compareSamePolicy(a,b).checks.publicBoard,false);
  b.finalPublicBoard=structuredClone(a.finalPublicBoard);
  b.winner=1;
  assert.equal(compareSamePolicy(a,b).checks.fullOutcome,false);
});

test('unverified native start and native error veto replay equivalence',()=>{
  const a=arm(),b=structuredClone(a);
  b.nativeVerifiedStartByDraw=false;
  assert.equal(compareSamePolicy(a,b).checks.nativeStart,false);
  b.nativeVerifiedStartByDraw=true;
  b.status='native-error';
  assert.equal(compareSamePolicy(a,b).checks.terminal,false);
});
