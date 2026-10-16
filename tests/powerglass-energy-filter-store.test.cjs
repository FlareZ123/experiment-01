'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/powerglass-energy-filter-store.cjs');

test('pinned Store documents Powerglass attachment filter bypass',()=>{
 const normal=run('basic');
 assert.equal(normal.attachedSelected,true);
 assert.equal(normal.guardAccepted,true);
 const out=run('special');
 assert.equal(out.validates,true);
 assert.equal(out.guardAccepted,false);
 assert.equal(out.attachedSelected,true);
 console.log('Basic:',JSON.stringify(normal),'Special:',JSON.stringify(out));
});
