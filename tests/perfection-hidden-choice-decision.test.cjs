'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/perfection-hidden-choice-decision.cjs');
test('Perfection chosen ability respects owner observation with blind scoring',()=>{
  const result=run();
  assert.deepEqual(result.sampled,[result.sampled[0],result.sampled[0]]);
  assert.equal(result.ownerCards,60);
  assert.equal(result.opponentCards,60);
  assert.equal(result.qualifiedGames,0);
});
