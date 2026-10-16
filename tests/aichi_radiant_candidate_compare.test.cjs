'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {compare}=require('../scripts/aichi_radiant_candidate_compare.cjs');

test('direct Radiant opening model derives both exact deck groups',()=>{
  const result=compare();
  assert.deepEqual(result.championGroups,[1,5,1,4,13,36]);
  assert.deepEqual(result.candidateGroups,[1,5,1,3,14,36]);
  assert.ok(Math.abs(result.baseline.twoVmax-0.5065943762)<1e-9);
  assert.ok(Math.abs(result.baseline.access-0.5220484477)<1e-9);
  assert.ok(result.candidate.access>=0 && result.candidate.access<=1);
  assert.ok(result.candidate.twoVmax>=0 && result.candidate.twoVmax<=result.candidate.access);
});

require('./aichi_hood_radiant_invariance.test.cjs');
