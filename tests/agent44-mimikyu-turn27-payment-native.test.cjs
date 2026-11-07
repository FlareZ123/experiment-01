'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/agent44-mimikyu-turn27-payment-native.cjs');

test('pinned Store accepts owner-Psychic payment and Skyliner retreat on both seats',()=>{
  const result=run();
  assert.equal(result.qualifiedCompetitiveGames,0);
  assert.equal(result.rows.length,2);
  assert.deepEqual(result.rows.map(r=>r.seat),[0,1]);
  assert.ok(result.rows.every(r=>r.nativeAcceptedAttachment&&
    r.nativeAcceptedRetreat&&r.actorOwnedBenchTarget));
});
