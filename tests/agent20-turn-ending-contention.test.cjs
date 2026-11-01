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
  assert.ok(Math.abs(r.probabilityStevenOnlyGivenLegalBasic -
    0.27943463223279985)<1e-12);
  assert.ok(Math.abs(r.probabilityPalaceOnlyGivenLegalBasic -
    0.19814485382214292)<1e-12);
  assert.ok(Math.abs(r.probabilityNeitherGivenLegalBasic -
    0.42121071868151055)<1e-12);
  assert.ok(Math.abs(
    r.probabilityStevenOnlyGivenLegalBasic +
    r.probabilityPalaceOnlyGivenLegalBasic +
    r.probabilityBothGivenLegalBasic +
    r.probabilityNeitherGivenLegalBasic - 1)<1e-12);
  assert.ok(Math.abs(r.rank6Comparison.probabilityLegalBasicOpening -
    0.3994996257446656)<1e-12);
  assert.ok(Math.abs(r.rank6Comparison.probabilityBothGivenLegalBasic -
    0.017739552239192914)<1e-12);
  assert.ok(Math.abs(
    r.rank6Comparison.probabilityCampingOnlyGivenLegalBasic -
    0.18134067044864746)<1e-12);
  assert.ok(Math.abs(
    r.rank6Comparison.probabilityPalaceOnlyGivenLegalBasic -
    0.0864010206266764)<1e-12);
  assert.ok(Math.abs(
    r.rank6Comparison.probabilityNeitherGivenLegalBasic -
    0.7145187566854833)<1e-12);
  assert.equal(r.rank6Comparison.tropicalBeachCopies,1);
  assert.ok(Math.abs(
    r.rank6Comparison.probabilityCampingAndBeachGivenLegalBasic -
    0.017739552239192914)<1e-12);
  assert.ok(Math.abs(
    r.rank6Comparison.probabilityPalaceAndBeachGivenLegalBasic -
    0.009200923043898251)<1e-12);
  assert.ok(Math.abs(
    r.rank6Comparison.probabilityAllThreeGivenLegalBasic -
    0.001288162669765257)<1e-12);
  assert.equal(r.rank29Comparison.rank,29);
  assert.equal(r.rank29Comparison.basicCards,4);
  assert.equal(r.rank29Comparison.campingGearCopies,2);
  assert.equal(r.rank29Comparison.tropicalBeachCopies,2);
  assert.ok(Math.abs(
    r.rank29Comparison.probabilityCampingAndBeachGivenLegalBasic -
    0.03419094180862057)<1e-12);
  assert.equal(r.rank29Comparison.stadiumRequiresUseAction,true);
  assert.equal(r.rank6Comparison.basicCards,4);
  assert.equal(r.rank6Comparison.campingGearCopies,2);
  assert.equal(r.rank6Comparison.palaceBookCopies,1);
  assert.ok(Math.abs(r.expectedMulligansBeforeLegalBasic -
    0.23555435060772448)<1e-12);
  assert.ok(Math.abs(r.probabilityAtLeastTwoMulligans -
    0.036346161441542)<1e-12);
  assert.ok(Math.abs(
    r.rank6Comparison.expectedMulligansBeforeLegalBasic -
    1.503131256095683)<1e-12);
  assert.ok(Math.abs(
    r.rank29Comparison.expectedMulligansBeforeLegalBasic -
    1.503131256095683)<1e-12);
  assert.ok(Math.abs(
    r.rank6Comparison.probabilityAtLeastTwoMulligans -
    0.3606006994807967)<1e-12);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('inclusion-exclusion obeys elementary smaller-deck identities',()=>{
  assert.equal(allGroupsPresent(10,2,[1,1]),1/45);
  assert.equal(allGroupsPresent(10,1,[1,1]),0);
  assert.equal(allGroupsPresent(10,10,[1,1]),1);
});
