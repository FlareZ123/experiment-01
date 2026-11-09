'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {TARGET,sourcePolicyDifferences}=
  require('../../simulation/evaluation/agent5/rank13-source-policy-factorial.cjs');

const {selectedTrialReplayMode}=
  require('../../simulation/evaluation/agent32-fresh-perfection-field.cjs');

const pass={actionOrdinal:20,turnBefore:2,turnAfter:2,
  playerSlot:1,action:'PassTurnAction'};
const search={...pass,action:'PlayCardAction',card:'Quick Ball'};
const attack={actionOrdinal:30,turnBefore:3,turnAfter:3,
  playerSlot:0,action:'AttackAction',attack:'Joust'};
const perfection={...attack,action:'UseAbilityAction',ability:'Perfection'};

function fourCells(searchSource=true,candidateLeak=false){
  const rows=[];
  for(const pivot of [false,true])
    for(const source of [false,true]){
      const first=source&&searchSource?
        candidateLeak?{...attack,actionOrdinal:20}:search:pass;
      const later=pivot?perfection:attack;
      rows.push({
        sourceChallenger:source,candidatePaidPivot:pivot,
        acceptedNativeRoots:[first,later]
      });
    }
  return rows;
}

test('original source Quick Ball is an accepted source-policy action change',()=>{
  const differences=sourcePolicyDifferences(fourCells());
  assert.deepEqual(differences.map(d=>d.sourceOwnedFirstDifference),
    [true,true]);
  assert.deepEqual(differences.map(d=>d.firstNativeRootDifference.ordinal),
    [0,0]);
});

test('inactive policy is not counted as an adversarial native response',()=>{
  assert.deepEqual(
    sourcePolicyDifferences(fourCells(false))
      .map(d=>d.sourceOwnedFirstDifference),[false,false]);
});

test('candidate-side action leakage cannot masquerade as source challenge',()=>{
  assert.deepEqual(
    sourcePolicyDifferences(fourCells(true,true))
      .map(d=>d.sourceOwnedFirstDifference),[false,false]);
});

test('runner target is the single historical rank13 original-source deal',()=>{
  assert.equal(TARGET,'13:2026:A:new-moon-lockbreaker-v1');
});

test('single historical replay keeps explicit original-frame and 1-deal safeguards',()=>{
  assert.deepEqual(selectedTrialReplayMode({
    singleHistoricalReplay:true,registeredFrameName:'original-rank13-frame'
  },[{id:TARGET}]),{
    allowSingleRegisteredTrial:true,retrospectiveSingleTrial:true
  });
  assert.deepEqual(selectedTrialReplayMode({},[{id:TARGET}]),{
    allowSingleRegisteredTrial:false,retrospectiveSingleTrial:false
  });
  assert.throws(()=>selectedTrialReplayMode({singleHistoricalReplay:true},
    [{id:TARGET}]),/original frame/);
  assert.throws(()=>selectedTrialReplayMode({
    singleHistoricalReplay:true,registeredFrameName:'original-rank13-frame'
  },[{id:TARGET},{id:'another'}]),/exactly one/);
});
