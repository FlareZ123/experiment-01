'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {registeredPairs}=
  require('../simulation/evaluation/agent7-rank30-psychic-prospective.cjs');

test('protocol file is precommitted before native study and has eight unique source seeds',()=>{
 const {registration,groups}=registeredPairs();
 assert.equal(registration.sourceGroups,8);
 assert.equal(groups.length,8);
 assert.equal(new Set(groups.map(g=>g.seed)).size,8);
 assert.equal(groups.reduce((n,g)=>n+g.trials.length,0),16);
 assert.deepEqual(groups.map(g=>g.sourceSeat),[1,0,1,0,1,0,1,0]);
 assert.deepEqual(groups.map(g=>g.candidateSlot),['A','B','A','B','A','B','A','B']);
 assert.ok(groups.every(g=>g.trials.every(t=>t.rank===30)));
});
