'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {retreatTransitionEvidence} = require('../simulation/twinleaf/retreat-transition-evidence.cjs');

test('matches nominated retreat destination to accepted public board', () => {
  const before = [{active:{name:'Shadow Rider Calyrex V',printing:'Shadow Rider Calyrex V CRE',energyCards:['Psychic Energy']},bench:[{name:'Dialga-GX',printing:'Dialga-GX UPR'},{name:'Latias ex',printing:'Latias ex SSP'}]}, {active:{name:'Regidrago V',printing:'Regidrago V SIT'},bench:[]}];
  const after = [{active:{name:'Latias ex',printing:'Latias ex SSP',energyCards:[]},bench:[{name:'Dialga-GX',printing:'Dialga-GX UPR'},{name:'Shadow Rider Calyrex V',printing:'Shadow Rider Calyrex V CRE'}]}, {active:{name:'Regidrago V',printing:'Regidrago V SIT'},bench:[]}];
  const out = retreatTransitionEvidence(before, after, 0, 1);
  assert.equal(out.fromActive.name,'Shadow Rider Calyrex V');
  assert.equal(out.intendedActive.name,'Latias ex');
  assert.equal(out.actualActiveAfter.name,'Latias ex');
  assert.equal(out.destinationBenchIndex,1);
  assert.equal(out.intendedActivePrinting,'Latias ex SSP');
  assert.equal(out.actualActivePrinting,'Latias ex SSP');
  assert.equal(out.intendedPrintingMatchesActual,true);
});

test('rejects ungrounded source indices',()=>{
  assert.throws(()=>retreatTransitionEvidence(null,[],0,0),/snapshots/);
  assert.throws(()=>retreatTransitionEvidence([],[],3,0),/indexed seat/);
});
