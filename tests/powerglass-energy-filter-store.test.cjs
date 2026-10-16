'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/powerglass-energy-filter-store.cjs');

test('pinned Store documents Powerglass attachment filter bypass',()=>{
 const out=run();
 assert.equal(out.validates,true);
 assert.equal(out.attachedSpecial,true);
});
