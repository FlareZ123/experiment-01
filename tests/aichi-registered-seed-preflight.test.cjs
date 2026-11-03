'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { preflightRegisteredSeedPlan, preflightManifestFile } =
  require('../scripts/aichi-registered-seed-preflight.cjs');
const manifestPath = join(__dirname, '..', 'results/aichi-2026/registrations/agent47-rank26-natural-owner-seed-plan-v2.json');
const sourcePlan = JSON.parse(readFileSync(manifestPath, 'utf8'));
/** @param {object} changes */
const edited = changes => ({ ...sourcePlan, ...changes });

test('corrected registered 20–31 gives 24 unique physical pairs and 48 attempted arms', () => {
  const actual = preflightManifestFile(manifestPath);
  assert.equal(actual.summary.physicalPairs, 24);
  assert.equal(actual.summary.nativeAttempts, 48);
  assert.equal(actual.summary.uniquePhysicalSeeds, 24);
  assert.equal(actual.summary.sourceSeat0, 12);
  assert.equal(actual.summary.sourceSeat1, 12);
  assert.equal(actual.summary.actualPhysicalParityVerified, false);
  assert.equal(actual.summary.competitiveGamesQualified, 0);
  assert.deepEqual(actual.nativeAttempts.filter(x => x.repeat === 20 && x.slot === 'A')
    .map(x => x.arm), ['control','selected']);
});

test('original prospective 122–133 fails before engine startup', () => {
  assert.throws(() => preflightRegisteredSeedPlan(edited({
    repeats: Array.from({length:12}, (_,i) => i+122)
  })), /outside v3 hash domain/);
});

test('duplicate repeat fails before game construction', () => {
  assert.throws(() => preflightRegisteredSeedPlan(edited({
    repeats: [20,20,...sourcePlan.repeats.slice(2)]
  })), /duplicate repeat/);
});

test('wrong expected arm denominator is not silently corrected', () => {
  assert.throws(() => preflightRegisteredSeedPlan(edited({
    expectedNativeAttempts: 24
  })), /native-attempt denominator/);
});

test('wrong physical-pair denominator fails closed', () => {
  assert.throws(() => preflightRegisteredSeedPlan(edited({
    expectedPhysicalPairs: 23
  })), /physical-pair denominator/);
});

test('missing seat is rejected', () => {
  assert.throws(() => preflightRegisteredSeedPlan(edited({
    slots: ['A']
  })), /both real physical seats/);
});

test('duplicated arm label is rejected', () => {
  assert.throws(() => preflightRegisteredSeedPlan(edited({
    arms: ['control','control']
  })), /duplicate arm label/);
});

test('physical seed collisions across independent repeats are rejected', () => {
  assert.throws(() => preflightRegisteredSeedPlan(sourcePlan, {
    deriveSeeds: () => ({ A: 1, B: 2 })
  }), /repeated physical seed/);
});

test('physical parity check cannot be declared unnecessary', () => {
  assert.throws(() => preflightRegisteredSeedPlan(edited({
    requirePhysicalDealParity: false
  })), /independent actual physical-deal parity/);
});

test('valid-seeming repeat values cannot evade exact underlying seed function', () => {
  assert.throws(() => preflightRegisteredSeedPlan(sourcePlan, {
    deriveSeeds: () => { throw new RangeError('actual seed function refused identity'); }
  }), /actual seed function refused/);
});
