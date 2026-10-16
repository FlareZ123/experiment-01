'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {splitKnownTop}=require('../simulation/twinleaf/known-top-redeal.cjs');
test('old top prefix tracks known new Prize membership',()=>{
 const r=splitKnownTop(['A','B'],['C','D'],3);
 assert.deepEqual(r.newPrizePrefix,['A','B']);
 assert.equal(r.unknownNewPrizeCount,1);
});
