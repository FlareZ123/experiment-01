'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {allWinSampleThreshold}=require('../simulation/evaluation/evidence-threshold.cjs');
test('zero-loss evidence gate',()=>{
 assert.equal(allWinSampleThreshold(.995,.95),598);
 assert.equal(allWinSampleThreshold(.995,.95,32),1290);
});
