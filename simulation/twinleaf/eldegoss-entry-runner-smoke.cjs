'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards, runMatch } = require('./headless.cjs');

/**
 * Actual headless-runner hook lifetime and identity provenance check. Synthetic
 * 60-card decks exercise runner installation/cleanup, while the paired Store
 * action fixture covers Happy Match's live Supporter recovery under lock.
 * @returns {object}
 */
function runTest() {
  initializeCards();
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const { EldegossV } = require(path.join(root,
    'sets/09-sword-and-shield/set-rebel-clash/eldegoss-v'));
  const original = EldegossV.prototype.reduceEffect;
  const deckA = [
    ...Array(4).fill('Iron Thorns ex TWM'),
    ...Array(56).fill('Lightning Energy SVE')
  ];
  const deckB = [
    ...Array(4).fill('Eldegoss V RCL'),
    ...Array(56).fill('Psychic Energy SVE')
  ];
  const seed = 20261017;
  const base = runMatch({
    deckA, deckB, seed, maxActions: 80,
    label: 'synthetic-eldegoss-entry-raw'
  });
  assert.equal(EldegossV.prototype.reduceEffect, original);
  const guarded = runMatch({
    deckA, deckB, seed, maxActions: 80,
    eldegossEntryLockCorrection: true,
    label: 'synthetic-eldegoss-entry-guarded'
  });
  assert.equal(EldegossV.prototype.reduceEffect, original,
    'Opt-in Eldegoss hook must be restored by actual runMatch finally');
  assert.equal(base.eldegossEntryLockCorrection, false);
  assert.equal(guarded.eldegossEntryLockCorrection, true);
  assert.equal(base.policy.includes('+EldegossEntryLockGuard-v1'), false);
  assert.equal(guarded.policy.includes('+EldegossEntryLockGuard-v1'), true);
  return {
    kind: 'eldegoss-headless-hook-lifecycle-smoke',
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scope: 'synthetic 60-card/80-action bounded game only, no win estimate',
    raw: {actions: base.actions, finished: base.finished,
      policy: base.policy, flag: base.eldegossEntryLockCorrection},
    corrected: {actions: guarded.actions, finished: guarded.finished,
      policy: guarded.policy, flag: guarded.eldegossEntryLockCorrection},
    prototypeRestored: true
  };
}

if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = { runTest };
