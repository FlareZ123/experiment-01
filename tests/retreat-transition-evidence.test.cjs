'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {retreatTransitionEvidence} = require('../simulation/twinleaf/retreat-transition-evidence.cjs');

test('matches nominated retreat destination to accepted public board', () => {
  const before = [{active:{name:'Shadow Rider Calyrex V',energyCards:['Psychic Energy']},bench:[{name:'Dialga-GX'},{name:'Latias ex'}]}, {active:{name:'Regidrago V'},bench:[]}];
  const after = [{active:{name:'Latias ex',energyCards:[]},bench:[{name:'Dialga-GX'},{name:'Shadow Rider Calyrex V'}]}, {active:{name:'Regidrago V'},bench:[]}];
  const out = retreatTransitionEvidence(before, after, 0, 1);
  assert.equal(out.fromActive.name,'Shadow Rider Calyrex V');
  assert.equal(out.intendedActive.name,'Latias ex');
  assert.equal(out.actualActiveAfter.name,'Latias ex');
  assert.equal(out.destinationBenchIndex,1);
});

test('rejects ungrounded source indices',()=>{
  assert.throws(()=>retreatTransitionEvidence(null,[],0,0),/snapshots/);
  assert.throws(()=>retreatTransitionEvidence([],[],3,0),/indexed seat/);
});
