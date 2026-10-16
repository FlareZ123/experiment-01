'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards, runMatch } = require('./headless.cjs');

/**
 * Bounded lifecycle smoke for the opt-in Dedenne/Crobat guard through the
 * actual headless match API. Decks are synthetically legal 60-card lists and
 * are NOT deck candidates or estimates of source-field strength.
 * @returns {object}
 */
function runTest() {
  initializeCards();
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const { DedenneGX } = require(path.join(root,
    'sets/08-sun-and-moon/set-unbroken-bonds/dedenne-gx'));
  const { CrobatV } = require(path.join(root,
    'sets/09-sword-and-shield/set-darkness-ablaze/crobat-v'));
  const before = [DedenneGX.prototype.reduceEffect, CrobatV.prototype.reduceEffect];
  const lightning = 'Lightning Energy SVE';
  const deckA = [
    'Iron Thorns ex TWM', 'Iron Thorns ex TWM',
    'Iron Thorns ex TWM', 'Iron Thorns ex TWM',
    ...Array(56).fill(lightning)
  ];
  const deckB = [
    'Dedenne GX UNB', 'Dedenne GX UNB',
    'Crobat V DAA', 'Crobat V DAA',
    ...Array(56).fill(lightning)
  ];
  const seed = 20261016;
  const raw = runMatch({ deckA, deckB, seed, maxActions: 80,
    label: 'synthetic-entry-draw-baseline' });
  assert.equal(DedenneGX.prototype.reduceEffect, before[0],
    'Raw runner must not leave a modified Dedenne card');
  assert.equal(CrobatV.prototype.reduceEffect, before[1]);
  const corrected = runMatch({ deckA, deckB, seed, maxActions: 80,
    entryDrawLockCorrection: true,
    label: 'synthetic-entry-draw-guarded' });
  assert.equal(corrected.entryDrawLockCorrection, true);
  assert.equal(raw.entryDrawLockCorrection, false);
  assert.ok(corrected.policy.includes('+EntryDrawLockGuard-v1'));
  assert.ok(!raw.policy.includes('+EntryDrawLockGuard-v1'));
  assert.equal(DedenneGX.prototype.reduceEffect, before[0],
    'Opt-in Dedenne hook must be restored after full runner call');
  assert.equal(CrobatV.prototype.reduceEffect, before[1],
    'Opt-in Crobat hook must be restored after full runner call');
  return {
    kind: 'entry-draw-guard-headless-lifecycle-smoke',
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scope: 'two bounded 80-action synthetic-deck games, not tournament evidence',
    raw: { actions: raw.actions, finished: raw.finished,
      flag: raw.entryDrawLockCorrection, policy: raw.policy },
    guarded: { actions: corrected.actions, finished: corrected.finished,
      flag: corrected.entryDrawLockCorrection, policy: corrected.policy },
    prototypeRestored: true
  };
}

if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = { runTest };
