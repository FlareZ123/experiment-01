'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/agent44-copycat-stadium-cost-native.cjs');

test('two-seat real Store: Dimension Valley reduces Copycat unless Stadium effect suppressed',()=>{
  const row=run();
  assert.equal(row.competitiveQualifiedGames,0);
  assert.deepEqual(row.rows.map(x=>x.seat),[0,1]);
});
