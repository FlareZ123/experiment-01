'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {runMatch} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');

/**
 * Check opt-in policy lifecycle on the two exact 60-card published source
 * lists. Forty actions are insufficient to measure attack or win strength.
 * @returns {object}
 */
function verifySightHeadlessFlag() {
  const resolved = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const a = resolved.decks.find(deck => deck.rank === 4);
  const b = resolved.decks.find(deck => deck.rank === 17);
  assert.ok(a?.playableUnderEngine && b?.playableUnderEngine);
  const common = {
    deckA: a.cardIds,
    deckB: b.cardIds,
    maxActions: 40,
    seed: 46172026,
    strictPromptValidation: true,
    isolatePolicyRandomness: true,
    label: 'rank4-rank17-sight-policy-flag-smoke'
  };
  const control = runMatch({...common, raichuSightToolPolicy: false});
  const variant = runMatch({...common, raichuSightToolPolicy: true});
  assert.equal(control.raichuSightToolPolicy, false);
  assert.equal(variant.raichuSightToolPolicy, true);
  assert.equal(control.policy.includes('RaichuSightReservation'), false);
  assert.equal(variant.policy.includes('RaichuSightReservation-v1'), true);
  assert.deepEqual(control.deckHashes, variant.deckHashes);
  assert.deepEqual(control.rules, variant.rules);
  assert.equal(control.firstTurnSlot, variant.firstTurnSlot);
  return {
    sourceRanks: [4, 17],
    maxActions: common.maxActions,
    engine: variant.engine,
    controlPolicy: control.policy,
    variantPolicy: variant.policy,
    firstTurnSlot: variant.firstTurnSlot,
    controlActions: control.actions,
    variantActions: variant.actions,
    warning: 'Lifecycle/provenance validation only; no matchup win-rate inference'
  };
}
if (require.main === module) {
  console.log(JSON.stringify(verifySightHeadlessFlag(), null, 2));
}
module.exports = {verifySightHeadlessFlag};
