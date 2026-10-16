'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { resolveManifestFile } = require('./resolve-field.cjs');
const { runMatch } = require('./headless.cjs');
const { initializeCards } = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const { ForestSealStone } = require(path.join(output,
  'sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone'));

/**
 * One actual seeded source-list execution with both optional integrity gates.
 * Verifies that the patched class is always restored after the match returns.
 * @returns {object} Bounded technical feasibility trace.
 */
function testOptInForestSeal() {
  const source = resolveManifestFile(
    path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'),
    {allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true}
  );
  const decks = new Map(source.decks.map(deck => [deck.rank, deck]));
  assert.ok(decks.get(1)?.playableUnderEngine && decks.get(10)?.playableUnderEngine);
  initializeCards();
  const original = ForestSealStone.prototype.reduceEffect;
  let game;
  try {
    game = runMatch({
      deckA: decks.get(1).cardIds,
      deckB: decks.get(10).cardIds,
      seed: 20261016,
      maxActions: 600,
      strictPromptValidation: true,
      forestSealSearchCorrection: true,
      label: 'opt-in Stone and prompt integrity combined smoke'
    });
  } finally {
    assert.equal(ForestSealStone.prototype.reduceEffect, original,
      'Forest Seal Stone research hook must always be uninstalled');
  }
  assert.equal(game.forestSealSearchCorrection, true);
  assert.equal(game.promptValidationMode, 'predispatch-prompt-validate');
  return {
    ranks: [1, 10], seed: game.seed, actions: game.actions,
    finished: game.finished, firstTurnPlayerId: game.firstTurnPlayerId,
    verifiedByDrawLog: game.verifiedByDrawLog,
    forestSealSearchCorrection: game.forestSealSearchCorrection,
    promptValidationMode: game.promptValidationMode,
    engine: game.engine, policy: game.policy,
    caveat: 'Hook installation and engine completion only; not actual Star Alchemy use frequency or player skill'
  };
}
if (require.main === module) console.log(JSON.stringify(testOptInForestSeal(), null, 2));
module.exports = { testOptInForestSeal };
