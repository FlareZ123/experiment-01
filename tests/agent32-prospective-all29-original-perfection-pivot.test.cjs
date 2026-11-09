'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {registered,matched}=
  require('../simulation/evaluation/agent32-prospective-all29-original-perfection-pivot.cjs');

/** @param {object} overrides */
function arm(overrides={}){
  return {
    id:'13:3026:A:new-moon-lockbreaker-v1',
    rank:13,seed:123,candidateSeat:0,
    fullPhysicalDealFingerprint:{id:'full'},
    sourceDealFingerprint:{id:'source'},
    status:'native-terminal',
    winner:1,rootActions:80,
    remainingPrizes:[6,0],
    acceptedPerfectionRootIntents:0,
    rootActionLedger:[{actionOrdinal:1,action:'PassTurnAction'}],
    ...overrides
  };
}

test('all 29 authenticated original source sixty ranks each have two precommitted fresh physical seats',()=>{
  const rows=registered();
  assert.equal(rows.length,58);
  assert.equal(new Set(rows.map(x=>x.seed)).size,58);
  assert.equal(new Set(rows.map(x=>x.id)).size,58);
  for(const rank of new Set(rows.map(x=>x.rank))){
    assert.equal(rows.filter(x=>x.rank===rank).length,2);
    assert.deepEqual(rows.filter(x=>x.rank===rank).map(x=>
      x.candidateSlot),['A','B']);
  }
});

test('exact physically paired native source loss to candidate win is recognized only after two terminals',()=>{
  const one=matched(arm(),arm({winner:0,
    rootActionLedger:[{actionOrdinal:1,action:'RetreatAction'}]}));
  assert.equal(one.matchedFull,true);
  assert.equal(one.matchedOriginalSource,true);
  assert.equal(one.nativeWinnerReversed,true);
  assert.equal(one.actualSourceLossToCandidateWin,true);
  assert.equal(one.actualCandidateWinToSourceLoss,false);
  assert.equal(one.firstRootDifference.ordinal,1);
});

test('root caps and native bot errors are censored and never wins',()=>{
  for(const status of ['root-cap','engine-error']){
    const one=matched(arm(),arm({status,winner:0}));
    assert.equal(one.nativeWinnerReversed,false);
    assert.equal(one.actualSourceLossToCandidateWin,false);
  }
});

test('physical deal mismatch causes separate explicit invalidity',()=>{
  const one=matched(arm(),arm({
    sourceDealFingerprint:{id:'a different source physical Prize set'}
  }));
  assert.equal(one.matchedFull,true);
  assert.equal(one.matchedOriginalSource,false);
});
