'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { deckPermutation, seededRandom } = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Experimental, intentionally incomplete information-set correction.
 *
 * For each speculative score, replace only the acting player's deck order
 * with a reproducible random permutation of the same known card multiset.
 * Each potential action receives the same sampled sequences. Always restore
 * the actual deck, even after an engine exception.
 *
 * A real policy must additionally preserve legitimately known top-card order,
 * track what was learned before the first deck search (K0 vs K1), and model
 * unknown opponent hand/deck/Prize information. None of that is solved here.
 * Therefore this hook is for controlled information-leakage diagnostics only.
 *
 * @param {{seed:number,samples:number,assumeNoKnownDeckOrder:boolean}} opts
 * @returns {() => void} Restore upstream scoring.
 */
function installOwnDeckDeterminizationHook(opts) {
  assert.equal(opts.assumeNoKnownDeckOrder, true,
    'Caller must verify there is no legitimately known top-deck order.');
  assert.ok(Number.isInteger(opts.samples) && opts.samples >= 1 && opts.samples <= 64);
  assert.ok(Number.isInteger(opts.seed));

  const { SimpleTactic } = require(path.join(
    output, 'simple-bot/simple-tactics/simple-tactics'));
  const original = SimpleTactic.prototype.evaluateAction;
  SimpleTactic.prototype.evaluateAction = function sampledEvaluateAction(
    state, playerId, action, passTurnScore
  ) {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return original.call(this, state, playerId, action, passTurnScore);
    const actualDeck = player.deck.cards;
    const originalOrder = actualDeck.slice();
    const canonical = actualDeck.slice()
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
    let total = 0;
    let accepted = 0;
    try {
      for (let sample = 0; sample < opts.samples; sample += 1) {
        const combinedSeed = (opts.seed ^ Math.imul(state.turn + 1, 0x9e3779b9) ^
          Math.imul(playerId, 0x85ebca6b) ^ Math.imul(sample + 1, 0xc2b2ae35)) >>> 0;
        const permutation = deckPermutation(canonical.length, seededRandom(combinedSeed));
        actualDeck.splice(0, actualDeck.length,
          ...permutation.map(index => canonical[index]));
        const score = original.call(this, state, playerId, action, passTurnScore);
        if (score !== undefined) {
          total += score;
          accepted += 1;
        }
      }
    } finally {
      actualDeck.splice(0, actualDeck.length, ...originalOrder);
    }
    return accepted ? total / accepted : undefined;
  };
  return function restore() {
    SimpleTactic.prototype.evaluateAction = original;
  };
}
module.exports = { installOwnDeckDeterminizationHook };
