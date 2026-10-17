'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {fixedWindow}=require('../scripts/aichi-meloetta-stone-pad-bridge.cjs');
test('probability partition sums',()=>{
 const model=fixedWindow(12,0);
 assert.ok(Math.abs(model.totalMass-1)<1e-11);
 assert.ok(Math.abs(model.combined-0.280415284727606)<1e-12);
});
