'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards,runMatch} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p */
const load = p => require(path.join(output, p));

/**
 * Source-rank 4/17 headless opt-in and exact-restoration integration smoke.
 * Forty actions are for hook-lifecycle compatibility, not a match outcome.
 */
function verifyHeadlessHook() {
  initializeCards();
  const {Store} = load('game/store/store');
  const reduceBefore = Store.prototype.reduceEffect;
  const promptBefore = Store.prototype.prompt;
  const source = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
      allowEquivalentBasicEnergies:true,
      allowJapanesePromoHooks:true
    });
  const rank4 = source.decks.find(d => d.rank === 4);
  const rank17 = source.decks.find(d => d.rank === 17);
  assert.ok(rank4?.playableUnderEngine && rank17?.playableUnderEngine,
    'Both published Raichu full lists must resolve to concrete legal pinned-engine inventories');
  const input = {
    deckA:rank4.cardIds,
    deckB:rank17.cardIds,
    seed:20261016,
    maxActions:40,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    label:'rank4-rank17-ElectroRainHook-lifecycle-only'
  };

  const control=runMatch({...input,electroRainDamageCorrection:false});
  assert.equal(Store.prototype.reduceEffect, reduceBefore);
  assert.equal(Store.prototype.prompt, promptBefore);
  const corrected=runMatch({...input,electroRainDamageCorrection:true});
  assert.equal(Store.prototype.reduceEffect, reduceBefore);
  assert.equal(Store.prototype.prompt, promptBefore);
  assert.equal(control.electroRainDamageCorrection,false);
  assert.equal(corrected.electroRainDamageCorrection,true);
  assert.ok(!control.policy.includes('ElectroRainDamage-v1'));
  assert.ok(corrected.policy.includes('ElectroRainDamage-v1'));
  assert.deepEqual(control.deckHashes,corrected.deckHashes);
  assert.deepEqual(control.rules,corrected.rules);
  assert.deepEqual(control.prizesRemaining,corrected.prizesRemaining);
  return {
    kind:'fixed-source Raichu ranks 4/17 bounded headless compatibility, not game performance',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    seed:input.seed,
    sourceRanks:[4,17],
    actionCap:input.maxActions,
    control:{actions:control.actions,turns:control.turns,finished:control.finished,
      hook:control.electroRainDamageCorrection,policy:control.policy},
    corrected:{actions:corrected.actions,turns:corrected.turns,finished:corrected.finished,
      hook:corrected.electroRainDamageCorrection,policy:corrected.policy},
    exactlyRestored:true,
    note:'No claim about policy competence or qualified matchup outcomes'
  };
}
if(require.main===module)console.log(JSON.stringify(verifyHeadlessHook(),null,2));
module.exports={verifyHeadlessHook};
