'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const registration=require('../results/aichi-2026/registrations/agent16-eight-missing-original-archetypes-20261101.json');
const {VERSION,scheduledArms,preflight}=
  require('../simulation/evaluation/agent10-original-rank9-absol-electrode-development.cjs');

test('pre-existing Agent16 registration commits two unselected rank9 physical seed groups',()=>{
  assert.equal(registration.registeredUtc,'2026-11-01T18:26:59.006335Z');
  assert.equal(registration.nativeAttempts,32);
  const selected=registration.seeds.filter(x=>x.rank===9);
  assert.deepEqual(selected.map(x=>x.seed),[3060075246,690229661]);
  assert.deepEqual(selected.map(x=>x.candidateSlot),['A','B']);
});

test('native rank9 groups pair exactly the same fixed candidate 60 options',()=>{
  const arms=scheduledArms();
  assert.equal(arms.length,4);
  assert.deepEqual(arms.map(x=>x.id),[
    '9:0:A:champion-reference','9:0:A:new-moon-lockbreaker-v1',
    '9:0:B:champion-reference','9:0:B:new-moon-lockbreaker-v1'
  ]);
  assert.equal(new Set(arms.map(x=>x.seed)).size,2);
  for(const seat of ['A','B']){
    const pair=arms.filter(x=>x.candidateSlot===seat);
    assert.equal(pair[0].seed,pair[1].seed);
    assert.equal(pair[0].repeat,0);
  }
});

test('source, paper policy and key card printings fail closed before actual native games',()=>{
  const info=preflight();
  assert.equal(info.version,VERSION);
  assert.equal(info.originalRank,9);
  assert.equal(info.originalArchetype,'Absol Electrode');
  assert.equal(info.sourcePrintingCount,60);
  assert.equal(info.nativeAttemptCount,4);
  assert.equal(info.preregisteredSourceSeedBlobSha,
    'e15578d7863422c6f4bd9df751d45b1b7044f904');
  assert.equal(info.sourcePolicyQualified,false);
  assert.equal(info.paperPromptQualified,false);
  assert.equal(info.competitiveQualified,false);
});
