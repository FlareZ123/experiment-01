'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  futureOwnerStarts,compareFilchPass,literalOwnStarts
}=require('../simulation/evaluation/agent2-owner-deck-attrition-horizon.cjs');

test('closed-form mandatory-draw horizon matches direct legal-turn recurrence',()=>{
  for(let deck=0;deck<=60;deck++)
    for(let voluntary=0;voluntary<=8;voluntary++)
      for(let mill=0;mill<=8;mill++)
        assert.equal(futureOwnerStarts(deck,voluntary,mill),
          literalOwnStarts(deck,voluntary,mill),
          'Mismatch at '+JSON.stringify({deck,voluntary,mill}));
});

test('Agent1 original rank11 two first-divergence deck counts quantify repeated draw risk',()=>{
  assert.deepEqual(compareFilchPass(23,0),{
    ownDeckCount:23,opponentHypotheticalMillEachTurn:0,
    repeatPassFutureOwnTurns:23,
    filchNowThenPassFutureOwnTurns:21,
    repeatFilchFutureOwnTurns:7,
    singleFilchTurnBudgetLost:2,
    repeatedFilchTurnBudgetLost:16,
    passCanBeginNextOwnTurn:true,
    filchCanBeginNextOwnTurn:true,
    nextTurnSurvivalStrictlyImprovedByPassing:false,
    paperGameQualified:false
  });
  const other=compareFilchPass(22,0);
  assert.equal(other.repeatPassFutureOwnTurns,22);
  assert.equal(other.repeatFilchFutureOwnTurns,7);
  assert.equal(other.repeatedFilchTurnBudgetLost,15);
});

test('at hypothetical double Burrow pace, two-card draw can consume a future owner turn',()=>{
  const s=compareFilchPass(24,2);
  assert.equal(s.repeatPassFutureOwnTurns,8);
  assert.equal(s.filchNowThenPassFutureOwnTurns,7);
  assert.equal(s.repeatFilchFutureOwnTurns,4);
  assert.equal(s.repeatedFilchTurnBudgetLost,4);
  for(const deck of [3,4]){
    const critical=compareFilchPass(deck,2);
    assert.equal(critical.passCanBeginNextOwnTurn,true);
    assert.equal(critical.filchCanBeginNextOwnTurn,false);
    assert.equal(critical.nextTurnSurvivalStrictlyImprovedByPassing,true);
  }
  assert.equal(compareFilchPass(2,2)
    .nextTurnSurvivalStrictlyImprovedByPassing,false);
});

test('no hidden deck or opponent-zone identities enter scenario arithmetic',()=>{
  const p=compareFilchPass(24,0);
  assert.deepEqual(Object.keys(p).sort(),[
    'ownDeckCount','opponentHypotheticalMillEachTurn',
    'repeatPassFutureOwnTurns','filchNowThenPassFutureOwnTurns',
    'repeatFilchFutureOwnTurns','singleFilchTurnBudgetLost',
    'repeatedFilchTurnBudgetLost','passCanBeginNextOwnTurn',
    'filchCanBeginNextOwnTurn',
    'nextTurnSurvivalStrictlyImprovedByPassing','paperGameQualified'
  ].sort());
  assert.equal(p.paperGameQualified,false);
  assert.throws(()=>futureOwnerStarts(-1,2,0),/feasible/);
  assert.throws(()=>futureOwnerStarts(12,0,61),/feasible/);
});
