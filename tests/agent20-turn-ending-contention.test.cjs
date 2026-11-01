'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,allGroupsPresent,run}=
  require('../simulation/evaluation/agent20-turn-ending-contention.cjs');

test('hypergeometric overlap is exact for seven original source cards',()=>{
  assert.equal(choose(60,7),386206920);
  assert.equal(allGroupsPresent(60,7,[60]),1);
  assert.equal(allGroupsPresent(60,7,[0]),0);
  const r=run();
  assert.deepEqual(
    [r.total,r.draws,r.basicCards,r.stevenCopies,r.palaceCopies],
    [60,7,12,4,3]);
  assert.ok(Math.abs(r.probabilityLegalBasicOpening-
    0.8093533072892635)<1e-12);
  assert.ok(Math.abs(r.probabilityStevenGivenLegalBasic-
    0.38064442749634647)<1e-12);
  assert.ok(Math.abs(r.probabilityPalaceGivenLegalBasic-
    0.29935464908568954)<1e-12);
  assert.ok(Math.abs(r.probabilityBothGivenLegalBasic-
    0.10120979526354663)<1e-12);
  assert.ok(Math.abs(r.probabilityAtLeastOneGivenLegalBasic-
    0.5787892813184894)<1e-12);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('inclusion-exclusion obeys elementary smaller-deck identities',()=>{
  assert.equal(allGroupsPresent(10,2,[1,1]),1/45);
  assert.equal(allGroupsPresent(10,1,[1,1]),0);
  assert.equal(allGroupsPresent(10,10,[1,1]),1);
});
