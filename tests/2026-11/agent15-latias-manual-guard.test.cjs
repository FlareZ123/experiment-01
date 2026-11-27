'use strict';
const assert=require('node:assert/strict');
const {DEFAULT,choose,drawBranches,exactDoorFirst,manualFirst}=require('../../scripts/2026-11/agent15-latias-manual-guard.cjs');
assert.equal(choose(41,2),820);
assert.ok(Math.abs(drawBranches(8,4,29,2).reduce((sum,r)=>sum+r.prob,0)-1)<1e-12);
assert.equal(manualFirst(DEFAULT,false),1);
assert.equal(manualFirst(DEFAULT,true),1);
assert.equal(exactDoorFirst(DEFAULT,0,false),1);
const N=41,E=8;
const one=1-choose(N-E,2)/choose(N,2);
const two=choose(E,2)/choose(N,2)+E*(N-E)/choose(N,2)*(1-choose(N-E-1,2)/choose(N-2,2));
assert.ok(Math.abs(exactDoorFirst(DEFAULT,1,false)-one)<1e-12);
assert.ok(Math.abs(exactDoorFirst(DEFAULT,2,false)-two)<1e-12);
assert.ok(exactDoorFirst(DEFAULT,2,false)<exactDoorFirst(DEFAULT,1,false));
assert.ok(exactDoorFirst(DEFAULT,1,true)>exactDoorFirst(DEFAULT,1,false));
assert.ok(exactDoorFirst(DEFAULT,2,true)>exactDoorFirst(DEFAULT,2,false));
assert.ok(exactDoorFirst(DEFAULT,1,true)<1);
assert.ok(exactDoorFirst(DEFAULT,2,true)<1);
// No Psychic in hand, but Fog can fetch one if an eligible Energy is in deck.
const noP={...DEFAULT,handP:0,handFog:1};
assert.equal(manualFirst(noP,true),1);
assert.equal(manualFirst(noP,false),0);
assert.equal(exactDoorFirst(noP,0,true),1);
// No eligible deck Energy and no Psychic in hand makes manual impossible.
assert.equal(exactDoorFirst({...noP,deckP:0},2,true),0);
console.log('latias manual-payment guard exact-model assertions passed');
