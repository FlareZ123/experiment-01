'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,REG_BLOB,SCORER_BLOB,preflight}=
  require('../simulation/twinleaf/agent22-rank7-stateful-steven-release.cjs');

test('external new source-seed registration and exact scoring source are frozen',()=>{
  const registration=preflight();
  assert.equal(VERSION,
    'agent22-rank7-stateful-steven-original-newseed-development-v1');
  assert.equal(REG_BLOB,'9d5cfc7942e1121ae288bbf32b6068cd19348043');
  assert.equal(SCORER_BLOB,'a697d664ca2cd657de5e12114d0732fc22e47353');
  assert.equal(registration.sourceRank,7);
  assert.equal(registration.opponentRank,1);
  assert.equal(registration.totalNativeAttempts,18);
  assert.equal(registration.maxRootActions,120);
  assert.equal(registration.registeredBeforeNativeOutcomes,true);
  assert.equal(new Set(registration.registeredSeeds).size,3);
  assert.deepEqual(registration.policyModes,
    ['lexical','static-hypothetical','state-contingent']);
});

test('six physical source deal groups and every policy are registered',()=>{
  const registration=preflight();
  const groups=registration.registeredSeeds.flatMap(seed=>
    registration.originalSourcePhysicalSeats.map(sourceSeat=>({
      seed,sourceSeat,
      modes:registration.policyModes
    })));
  assert.equal(groups.length,6);
  const ids=groups.flatMap(g=>g.modes.map(mode=>
    [g.seed,g.sourceSeat,mode].join(':')));
  assert.equal(ids.length,18);
  assert.equal(new Set(ids).size,18);
  assert.deepEqual(registration.originalSourcePhysicalSeats,[0,1]);
  assert.equal(registration.model.defaultWeight,0.6);
});
