'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards, runMatch} = require('./headless.cjs');

/**
 * Verify opt-in runner provenance and restoration for two previously isolated
 * pinned-Store fidelity corrections. The bounded synthetic match measures
 * lifecycle only; individual source action tests establish actual semantics.
 * @returns {object}
 */
function runTest() {
  initializeCards();
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const {ArticunoGX} = require(path.join(output,
    'sets/08-sun-and-moon/set-celestial-storm/articuno-gx'));
  const {AttachEnergyPromptResolver} = require(path.join(output,
    'simple-bot/prompt-resolver/attach-energy-prompt-resolver'));
  const before = {
    articuno: ArticunoGX.prototype.reduceEffect,
    get: AttachEnergyPromptResolver.prototype.getPromptResult,
    assign: AttachEnergyPromptResolver.prototype.assignToBestTarget
  };
  const assertClean = () => {
    assert.equal(ArticunoGX.prototype.reduceEffect, before.articuno);
    assert.equal(AttachEnergyPromptResolver.prototype.getPromptResult, before.get);
    assert.equal(AttachEnergyPromptResolver.prototype.assignToBestTarget, before.assign);
  };
  const deckA = [...Array(4).fill('Iron Thorns ex TWM'),
    ...Array(56).fill('Lightning Energy SVE')];
  const deckB = [...Array(4).fill('Eldegoss V RCL'),
    ...Array(56).fill('Psychic Energy SVE')];
  const common = {deckA, deckB, seed: 20261018, maxActions: 30};
  const raw = runMatch(common);
  assertClean();
  const guarded = runMatch({
    ...common,
    articunoEntryLockCorrection: true,
    distinctAttachTargetsCorrection: true
  });
  assertClean();
  assert.equal(raw.articunoEntryLockCorrection, false);
  assert.equal(raw.distinctAttachTargetsCorrection, false);
  assert.equal(guarded.articunoEntryLockCorrection, true);
  assert.equal(guarded.distinctAttachTargetsCorrection, true);
  assert.equal(raw.policy.includes('+ArticunoEntryLockGuard-v1'), false);
  assert.equal(raw.policy.includes('+DistinctAttachTargetsGuard-v1'), false);
  assert.ok(guarded.policy.includes('+ArticunoEntryLockGuard-v1'));
  assert.ok(guarded.policy.includes('+DistinctAttachTargetsGuard-v1'));
  assert.throws(() => runMatch({...common, maxActions: 0,
    articunoEntryLockCorrection: true,
    distinctAttachTargetsCorrection: true
  }), /maxActions must be a positive integer/);
  assertClean();
  return {
    kind: 'combined-opt-in-fidelity-hook-lifecycle-v1',
    engine: guarded.engine,
    scope: 'synthetic 60-card bound; lifecycle only, no competitive result',
    rawPolicy: raw.policy, guardedPolicy: guarded.policy,
    runnerActions: {raw:raw.actions,guarded:guarded.actions},
    prototypesRestored: true
  };
}

if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = {runTest};
