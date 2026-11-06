'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,preflight,phaseOptions,firstRootDifference,compare,phaseSummary
}=require('../simulation/evaluation/agent36-issue25-common-v9-paid-retreat-aba.cjs');

test('v9 preregistration is an eight-context retrospective A/B/A before any v9 attempt',()=>{
  const m=preflight();
  assert.equal(m.schema,'agent36-issue25-common-v9-paid-retreat-aba-128root-v1');
  assert.equal(m.registeredBeforeFirstNativeAttempt,true);
  assert.equal(m.observedV9AttemptsBeforeRegistration,0);
  assert.equal(m.expectedCandidateContexts,8);
  assert.equal(m.expectedNativeAttempts,24);
  assert.deepEqual(m.sourceOriginalRanks,[6,11,1,3]);
  assert.equal(m.maxNativeRootActionsPerArm,128);
  assert.equal(m.trials.length,8);
  assert.equal(VERSION,'agent36-issue25-common-v9-paid-retreat-aba-128root');
});

test('only the middle B phase enables the source-independent paid-retreat root',()=>{
  const m=preflight();
  assert.deepEqual(m.modes.map(phaseOptions),[
    {actorTwoUnitPaidRetreatRoot:false,actorTwoUnitPaidRetreatTargetTurn:null},
    {actorTwoUnitPaidRetreatRoot:true,actorTwoUnitPaidRetreatTargetTurn:null},
    {actorTwoUnitPaidRetreatRoot:false,actorTwoUnitPaidRetreatTargetTurn:null}
  ]);
});

test('first root divergence reports the exact accepted treatment action ordinal',()=>{
  const a={rootActionLedger:[
    {actionOrdinal:0,playerSlot:0,action:'PassTurnAction'},
    {actionOrdinal:1,playerSlot:1,action:'PlayCardAction'}
  ]};
  const b={rootActionLedger:[
    {actionOrdinal:0,playerSlot:0,action:'PassTurnAction'},
    {actionOrdinal:1,playerSlot:1,action:'RetreatAction'},
    {actionOrdinal:2,playerSlot:1,action:'AttackAction'}
  ]};
  assert.deepEqual(firstRootDifference(a,b),{
    index:1,ordinalA:1,ordinalB:1,actionA:'PlayCardAction',
    actionB:'RetreatAction',playerSlotB:1
  });
});

test('A/B/A comparison requires exact repeated controls and matched physical openings',()=>{
  const trial={id:'1:212:B:champion-reference',rank:1,candidateId:'champion-reference'};
  const make=(action,hash)=>({
    trial,rootActionLedger:[{actionOrdinal:0,playerSlot:0,action}],
    rootActionLedgerSha256:hash,status:'native-capped-128',finished:false,
    finalPrizes:[2,2]
  });
  const summary=(hash,sourceAction)=>({
    id:trial.id,sourceDealFingerprint:'source-deal',
    fullPhysicalDealFingerprint:'full-deal',actualStarterSeat:0,
    sourceSeat:0,candidateSeat:1,rootActionLedgerSha256:hash,
    sourceRetreatActionRoots:sourceAction==='RetreatAction'?1:0,
    candidateRetreatActionRoots:0,
    sourcePaidRetreatAudit:{evidence:[]},
    candidatePaidRetreatAudit:{evidence:[]}
  });
  const phases=[
    {rows:[summary('a','PassTurnAction')],rawDevelopment:{rows:[make('PassTurnAction','a')]}},
    {rows:[summary('b','RetreatAction')],rawDevelopment:{rows:[make('RetreatAction','b')]}},
    {rows:[summary('a','PassTurnAction')],rawDevelopment:{rows:[make('PassTurnAction','a')]}}
  ];
  const [row]=compare(phases,{trials:[trial]});
  assert.equal(row.physicalOpeningMatchedAcrossABA,true);
  assert.equal(row.controlsRepeatedExactly,true);
  assert.equal(row.firstTreatmentDifferenceIsRetreat,true);
  assert.equal(row.treatmentRootDifference.actionB,'RetreatAction');
  assert.equal(row.sourceRetreatActionRootsB,1);
  assert.equal(phaseSummary({id:'B',actorTwoUnitPaidRetreatRoot:true,rows:[
    {sourcePaidRetreatAudit:{evidence:[]},candidatePaidRetreatAudit:{evidence:[]},
      sourceRetreatActionRoots:1,candidateRetreatActionRoots:0,
      nativeFinished:false,nativeError:null,acceptedRootCount:128}
  ]}).root128Caps,1);
});

test('a treatment divergence at a non-retreat root is explicitly rejected',()=>{
  const a={rootActionLedger:[{actionOrdinal:0,action:'PassTurnAction'}]};
  const b={rootActionLedger:[{actionOrdinal:0,action:'PlayCardAction'}]};
  const diff=firstRootDifference(a,b);
  assert.equal(diff.actionB,'PlayCardAction');
  assert.notEqual(diff.actionB,'RetreatAction');
});
