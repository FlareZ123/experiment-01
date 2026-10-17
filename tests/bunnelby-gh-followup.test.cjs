'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {followup}=require('../simulation/twinleaf/bunnelby-gh-followup.cjs');
test('conditioned full-source GH Bot followup includes search choice',()=>{
 const a=followup(false,50),b=followup(true,50);
 console.log('GH_FOLLOWUP='+JSON.stringify({a,b}));
 assert.ok(a.trace.length>0&&b.trace.length>0);
 const r=a.trace.find(x=>x.selected?.includes('Technical Machine: Evolution PAR'));
 assert.ok(r);
 assert.ok(r.selected.includes('Jet Energy PAL'));
});
