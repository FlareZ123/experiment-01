'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {byOriginalRole}=
  require('../simulation/evaluation/agent31-rank1-underworld-preconditions-replay.cjs');

const trials=[
  {id:'1:0:A:champion-reference',candidateSlot:'A'},
  {id:'1:0:B:new-moon-lockbreaker-v1',candidateSlot:'B'}
];
const event=(gameId,seat,structural)=>({
  gameId,seat,turn:5,acceptedRoots:3,
  anyVMAX:structural,anyUnspent:structural,
  anyPsychicHand:structural,anyPsychicBench:structural,
  anyStructural:structural,maxVmax:Number(structural),
  maxUnspent:Number(structural),
  maxPsychicHand:Number(structural),
  maxPrintedPsychicBench:Number(structural),
  firstOpportunity:structural?{
    sourcePrintings:[],recipients:[],handPsychicEnergyCount:1
  }:null
});

test('independent original source seat is chosen from frozen physical candidate slots',()=>{
  const x=byOriginalRole({games:2,gameSeatRows:[
    event(1,1,true),event(1,0,false),
    event(2,0,true),event(2,1,false)
  ]},trials);
  assert.equal(x.source.nativeOwnerTurns,2);
  assert.equal(x.source.ownerTurnsWithCompleteStructuralOpportunity,2);
  assert.equal(x.candidate.ownerTurnsWithCompleteStructuralOpportunity,0);
  assert.deepEqual(x.source.firstActualStructuralOpportunities.map(y=>
    y.trialId),[trials[0].id,trials[1].id]);
});

test('unregistered Store game ordinal cannot be assigned a source role',()=>{
  assert.throws(()=>byOriginalRole({
    games:1,gameSeatRows:[event(1,0,true)]
  },trials));
  assert.throws(()=>byOriginalRole({
    games:2,gameSeatRows:[event(3,0,true)]
  },trials));
});
