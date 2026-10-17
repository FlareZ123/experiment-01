'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { resolveManifestFile } = require('./resolve-field.cjs');
const { runMatch } = require('./headless.cjs');
const { checkDoubleDragonAttachment } = require('./dde-attachment-policy.cjs');

/**
 * @returns {object} Pinned-engine integration evidence for the opt-in tactic.
 */
function runDoubleDragonRuntimeRegression() {
  const field = resolveManifestFile(
    path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'),
    { allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true }
  );
  const rank = new Map(field.decks.map(deck => [deck.rank, deck]));
  const dragon = rank.get(10);
  const shadow = rank.get(1);
  assert.ok(dragon?.playableUnderEngine && shadow?.playableUnderEngine,
    'Published rank 10 and rank 1 must resolve as fixed 60-card decks');

  const fixture = checkDoubleDragonAttachment();
  assert.equal(fixture.passed, true);
  const request = {
    deckA: dragon.cardIds,
    deckB: shadow.cardIds,
    seed: 20261016,
    maxActions: 200,
    label: 'DDE experimental policy integration'
  };
  const control = runMatch(request);
  const corrected = runMatch({ ...request, doubleDragonRecovery: true });
  const repeated = runMatch({ ...request, doubleDragonRecovery: true });
  assert.equal(control.doubleDragonRecovery, false);
  assert.equal(corrected.doubleDragonRecovery, true);
  assert.match(corrected.policy, /DoubleDragonAttachTactic-v4/);
  assert.deepEqual(corrected.deckHashes, control.deckHashes);
  assert.deepEqual(corrected, repeated,
    'Experimental policy must reproduce full bounded engine traces for one seed');

  return {
    engine: corrected.engine,
    exactPublishedRanks: [10, 1],
    seed: request.seed,
    boundedActions: request.maxActions,
    fixture,
    control: {
      actions: control.actions, turns: control.turns, finished: control.finished,
      doubleDragonEnergyPlayed: control.cardsPlayedBySeat[0]['Double Dragon Energy'] || 0
    },
    experimental: {
      actions: corrected.actions, turns: corrected.turns, finished: corrected.finished,
      doubleDragonEnergyPlayed: corrected.cardsPlayedBySeat[0]['Double Dragon Energy'] || 0,
      policy: corrected.policy
    },
    caveat: 'Technical replayability and tactic availability only; no competitive win-rate evidence'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runDoubleDragonRuntimeRegression(), null, 2) + '\n');
}
module.exports = { runDoubleDragonRuntimeRegression };
