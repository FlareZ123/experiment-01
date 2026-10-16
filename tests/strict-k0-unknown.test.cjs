'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {strictK0Unknown}=require('../simulation/twinleaf/strict-k0-unknown.cjs');
test('K0 unseen does not depend on hidden assignment',()=>{
 const result=strictK0Unknown(['A','B','X','X'],['X']);
 assert.deepEqual(result,['A','B','X']);
});

test('K0 belief enforces hidden deck plus face-down Prize cardinality',()=>{
 const {strictK0Belief}=require('../simulation/twinleaf/strict-k0-unknown.cjs');
 const r=strictK0Belief({registered:['X','X','A','B','C'],
  known:['X'],deckCount:2,unseenPrizeCount:2});
 assert.deepEqual(r.pool,['A','B','C','X']);
 assert.equal(r.prizeCount,2);
 assert.throws(()=>strictK0Belief({registered:['A'],known:[],
  deckCount:1,unseenPrizeCount:1}),/reconcile/);
});
