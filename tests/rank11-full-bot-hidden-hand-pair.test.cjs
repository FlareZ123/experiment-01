'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {run}=require('../simulation/twinleaf/rank11-full-bot-hidden-hand-pair.cjs');

test('complete default bot conserves all source-60 hidden-hand comparisons and restores partial sampler',()=>{
  const result=run();
  assert.equal(result.sourceRank,11);
  assert.equal(result.ownerCards,60);
  assert.equal(result.opponentCards,60);
  assert.equal(result.pairedWorlds,6);
  assert.equal(result.raw.length,6);
  assert.equal(result.partlyBlinded.length,6);
  assert.ok(result.raw.every(r=>
    r.actionReversal===!isDeepStrictEqual(r.energyHand,r.trainerHand)));
  assert.ok(result.partlyBlinded.every(r=>
    r.actionReversal===!isDeepStrictEqual(r.energyHand,r.trainerHand)));
  assert.equal(result.restorationMatchesRaw,true);
  assert.equal(result.informationSetCertified,false);
  assert.equal(result.qualifiedCompetitiveGames,0);
});
