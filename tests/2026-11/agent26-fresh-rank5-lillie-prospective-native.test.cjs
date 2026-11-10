'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const registered=require('../../results/aichi-2026/registrations/2026-11/agent26-fresh-rank5-bilateral-lillie-four-20261110.json');
const {preflight,VERSION}=require(
  '../../simulation/evaluation/2026-11/agent26-fresh-rank5-lillie-prospective-native.cjs');

test('unseen physical rank5 seeds were frozen with both physical seats',()=>{
  const actual=preflight();
  assert.strictEqual(actual,registered);
  assert.equal(actual.groups.length,4);
  assert.deepEqual(actual.groups.map(x=>x.candidateSlot),['A','B','A','B']);
  assert.equal(new Set(actual.groups.map(x=>x.seed)).size,4);
  assert.deepEqual(actual.arms,['control','lillie']);
  assert.equal(actual.status,'FROZEN BEFORE ANY NATIVE ARMS');
  assert.equal(actual.pinnedTwinleaf,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.match(VERSION,/fresh-four-deal/);
});
test('native registration never pretends to certify paper tournament games',()=>{
  assert.match(registered.outcomeAdmissibility,/native.*only/);
  assert.equal(registered.rootActionLimit,350);
  assert.equal(registered.fixedSixtiesUnchanged,true);
});
