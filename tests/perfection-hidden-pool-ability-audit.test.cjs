'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/perfection-hidden-pool-ability-audit.cjs');
test('delegated Perfection evaluation needs its own opt-in hidden-pool sampling',()=>{
  const x=run();
  assert.equal(x.sourceCards,60);
  assert.equal(x.ownerDeckCards,60);
  assert.equal(x.originalLeak,true);
  assert.deepEqual(x.nativeOnly,x.original);
  assert.equal(x.sampled[0],x.sampled[1]);
  assert.equal(x.certifiedGames,0);
});
