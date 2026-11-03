'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { deriveSlotSeeds } = require('./aichi-decorrelated-seeds.cjs');

const SCHEMA = 'aichi-registered-seed-plan-v1';

/** @param {unknown} value @param {string} label */
function positiveInteger(value, label) {
  assert.ok(Number.isSafeInteger(value) && value > 0, `${label} must be a positive safe integer`);
}

/**
 * Validate a prospectively registered physical-slot plan using the actual
 * v3 seed function, without importing Twinleaf or constructing any game.
 *
 * This only certifies plan executability and seed uniqueness. Actual initial
 * decks, mulligans, compensation draws and paper legality remain unverified.
 *
 * @param {object} plan Immutable external campaign manifest.
 * @param {{deriveSeeds?:typeof deriveSlotSeeds}} [options] Pure test seam.
 * @returns {{schema:string,campaignId:string,manifestSha256:string,physicalPairs:Array<object>,nativeAttempts:Array<object>,summary:object}}
 */
function preflightRegisteredSeedPlan(plan, options={}) {
  assert.ok(plan && typeof plan === 'object' && !Array.isArray(plan), 'plan must be an object');
  assert.equal(plan.schema, SCHEMA, 'unknown seed-plan schema');
  assert.ok(typeof plan.campaignId === 'string' && /^[a-z0-9][a-z0-9-]{2,127}$/.test(plan.campaignId),
    'campaignId must be a stable lowercase identifier');
  assert.ok(typeof plan.registrationPath === 'string' &&
    /^results\/aichi-2026\/registrations\/[A-Za-z0-9._-]+\.md$/.test(plan.registrationPath),
    'registrationPath must identify a versioned Markdown registration');
  assert.equal(plan.derivation, 'aichi-decorrelated-slots-v3');
  assert.ok(Number.isSafeInteger(plan.seedBase) && plan.seedBase >= 0 && plan.seedBase <= 0xffffffff,
    'seedBase must be unsigned 32-bit integer');
  assert.ok(plan.phase === 'pilot' || plan.phase === 'published-field', 'invalid phase');
  assert.ok(Number.isInteger(plan.rank) && plan.rank >= 1 && plan.rank <= 32, 'invalid rank');
  assert.ok(Array.isArray(plan.repeats) && plan.repeats.length > 0 && plan.repeats.length <= 100,
    'repeats must be a nonempty bounded explicit array');
  assert.deepEqual(plan.slots, ['A', 'B'], 'both real physical seats must be planned');
  assert.ok(Array.isArray(plan.arms) && plan.arms.length >= 1 && plan.arms.length <= 8,
    'arms must be an explicit nonempty bounded array');
  assert.ok(plan.arms.every(a => typeof a === 'string' && /^[a-z][a-z0-9-]*$/.test(a)),
    'each arm must have an unambiguous stable label');
  assert.equal(new Set(plan.arms).size, plan.arms.length, 'duplicate arm label');
  positiveInteger(plan.expectedPhysicalPairs, 'expectedPhysicalPairs');
  positiveInteger(plan.expectedNativeAttempts, 'expectedNativeAttempts');
  assert.equal(plan.requirePhysicalDealParity, true,
    'manifest must require independent actual physical-deal parity checks');

  const derive = options.deriveSeeds ?? deriveSlotSeeds;
  assert.equal(typeof derive, 'function');
  const physicalPairs = [];
  const nativeAttempts = [];
  const usedRepeat = new Set();
  const usedSeed = new Set();
  for (const repeat of plan.repeats) {
    assert.ok(Number.isInteger(repeat) && repeat >= 0 && repeat <= 99,
      `repeat outside v3 hash domain: ${String(repeat)}`);
    assert.ok(!usedRepeat.has(repeat), `duplicate repeat: ${repeat}`);
    usedRepeat.add(repeat);
    // Invoke the actual registered derivation rather than validating only
    // a superficially plausible range or synthesizing substitute seeds.
    const slotSeeds = derive(plan.seedBase, plan.phase, plan.rank, repeat);
    assert.ok(slotSeeds && typeof slotSeeds === 'object', `invalid seeds at repeat ${repeat}`);
    for (const [sourceSeat, slot] of plan.slots.entries()) {
      const seed = slotSeeds[slot];
      assert.ok(Number.isSafeInteger(seed) && seed >= 1 && seed <= 0xffffffff,
        `invalid physical ${slot} seed at repeat ${repeat}`);
      assert.ok(!usedSeed.has(seed), `repeated physical seed ${seed} at ${repeat}:${slot}`);
      usedSeed.add(seed);
      const physical = Object.freeze({ repeat, slot, sourceSeat, seed });
      physicalPairs.push(physical);
      for (const arm of plan.arms) nativeAttempts.push(Object.freeze({ ...physical, arm }));
    }
  }
  assert.equal(physicalPairs.length, plan.expectedPhysicalPairs,
    'registered physical-pair denominator differs from executable plan');
  assert.equal(nativeAttempts.length, plan.expectedNativeAttempts,
    'registered native-attempt denominator differs from executable plan');
  const manifestSha256 = createHash('sha256').update(JSON.stringify(plan)).digest('hex');
  return Object.freeze({
    schema: SCHEMA,
    campaignId: plan.campaignId,
    manifestSha256,
    physicalPairs,
    nativeAttempts,
    summary: Object.freeze({
      physicalPairs: physicalPairs.length,
      nativeAttempts: nativeAttempts.length,
      uniquePhysicalSeeds: usedSeed.size,
      sourceSeat0: physicalPairs.filter(x => x.sourceSeat === 0).length,
      sourceSeat1: physicalPairs.filter(x => x.sourceSeat === 1).length,
      actualPhysicalParityVerified: false,
      compiledEngineNeededForPreflight: false,
      competitiveGamesQualified: 0
    })
  });
}

/** @param {string} filePath */
function preflightManifestFile(filePath) {
  return preflightRegisteredSeedPlan(JSON.parse(readFileSync(resolve(filePath), 'utf8')));
}

if (require.main === module) {
  assert.equal(process.argv.length, 3, 'usage: node scripts/aichi-registered-seed-preflight.cjs MANIFEST.json');
  const receipt = preflightManifestFile(process.argv[2]);
  process.stdout.write(`SEED_PREFLIGHT_OK ${JSON.stringify({
    campaignId: receipt.campaignId,
    manifestSha256: receipt.manifestSha256,
    ...receipt.summary
  })}\n`);
}

module.exports = { SCHEMA, preflightRegisteredSeedPlan, preflightManifestFile };
