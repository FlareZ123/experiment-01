'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {run}=require('../simulation/twinleaf/rank11-blind-poltergeist-forecast.cjs');

test('detached opponent hidden-pool sampling removes source-rank11 clairvoyant score differential',()=>{
  const result=run();
  assert.equal(result.engine,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(result.sourceInventoryCards,60);
  assert.deepEqual(result.speculativeRawScores,[83,407]);
  assert.equal(result.speculativeBlindedScores.length,2);
  assert.equal(result.speculativeBlindedScores[0],result.speculativeBlindedScores[1]);
  assert.equal(result.unchangedObserverState,true);
  assert.equal(result.unchangedSourceMultiset,true);
});
