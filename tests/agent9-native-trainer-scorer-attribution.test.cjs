'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {correlateAcceptedTrainers}=
  require('../simulation/twinleaf/agent9-native-trainer-realroot-score-census.cjs');

const accepted=(seat,globalTurn,printing,handIndex)=>({
  seat,globalTurn,printing,handIndex,nativeDispatch:'native-accepted'
});
const root=(seat,globalTurn,printing,handIndex,evaluateActionCalls,
  getStateScoreCalls)=>({
  seat,globalTurn,proposedPrinting:printing,handIndex,
  class:'PlayCardAction',evaluateActionCalls,getStateScoreCalls
});

test('unique owner-turn-printing-index linkage supports strict scorer receipt',()=>{
  const audit={roots:[
    root(0,6,'Quick Ball FST',0,3,7),
    root(1,2,'Temple of Sinnoh ASR',1,0,0),
    root(1,2,'Quick Ball FST',0,45,12),
    {...root(0,6,'Quick Ball FST',0,30,100),class:'PassTurnAction'}
  ]};
  const receipts=[
    accepted(0,6,'Quick Ball FST',0),
    accepted(1,2,'Temple of Sinnoh ASR',1),
    {...accepted(0,6,'Quick Ball FST',2),nativeDispatch:'native-rejected'}
  ];
  const r=correlateAcceptedTrainers(audit,receipts);
  assert.equal(r.acceptedTrainerRoots,2);
  assert.equal(r.exactOneToOneRows,2);
  assert.equal(r.acceptedTrainersWithScoringConfirmed,1);
  assert.equal(r.acceptedTrainersWithoutScoringConfirmed,1);
  assert.equal(r.ambiguousOrUnmatchedRows,0);
  assert.deepStrictEqual(r.rows.map(x=>x.scorerCallsConfirmed),[true,false]);
  assert.equal(r.hiddenOrderCausalityAtAcceptedRootEstablished,false);
});

test('multiple same-turn proposals or absent root remain explicitly ambiguous',()=>{
  const audit={roots:[
    root(1,4,"Trainers' Mail ROS",0,1,2),
    root(1,4,"Trainers' Mail ROS",0,0,0)
  ]};
  const r=correlateAcceptedTrainers(audit,[
    accepted(1,4,"Trainers' Mail ROS",0),
    accepted(0,5,'Ultra Ball MEG',2)
  ]);
  assert.equal(r.ambiguousOrUnmatchedRows,2);
  assert.equal(r.acceptedTrainersWithScoringConfirmed,0);
  assert.equal(r.acceptedTrainersWithoutScoringConfirmed,0);
  assert.deepStrictEqual(r.rows.map(x=>x.matchingNativeDelegations),[2,0]);
  assert.deepStrictEqual(r.rows.map(x=>x.scorerCallsConfirmed),[null,null]);
  assert.equal(r.rows[0].scorerCallsPossible,true);
  assert.equal(r.rows[1].scorerCallsPossible,false);
});
