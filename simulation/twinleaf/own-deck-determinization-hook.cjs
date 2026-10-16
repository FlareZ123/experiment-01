'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { deckPermutation, seededRandom } = require('./headless.cjs');
const { canonicalUnseenCards } = require('./canonical-unseen-cards.cjs');
const {evaluateDetachedDeckSamples} = require('./detached-deck-sampling.cjs');
const {normalizeDeepClonePrototypes} = require('./normalize-deep-clone.cjs');

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
 * @param {{seed:number,samples:number,assumeNoKnownDeckOrder:boolean,assumeDeckContentsKnown:boolean,isolateGameState?:boolean,assumeIndexBasedAction?:boolean}} opts
 * @returns {() => void} Restore upstream scoring.
 */
function installOwnDeckDeterminizationHook(opts) {
  assert.equal(opts.assumeNoKnownDeckOrder, true,
    'Caller must verify there is no legitimately known top-deck order.');
  assert.equal(opts.assumeDeckContentsKnown, true,
    'Caller must verify deck membership is known from a prior search (K1).');
  assert.ok(Number.isInteger(opts.samples) && opts.samples >= 1 && opts.samples <= 64);
  assert.ok(Number.isInteger(opts.seed));
  if (opts.isolateGameState === true) {
    assert.equal(opts.assumeIndexBasedAction, true,
      'Detached scoring requires verified index-based action references.');
  }

  const { SimpleTactic } = require(path.join(
    output, 'simple-bot/simple-tactics/simple-tactics'));
  const original = SimpleTactic.prototype.evaluateAction;
  // Opt-in only: cloning must keep all mutable Card objects out of the live
  // speculative state. The legacy array-only sampler remains for reproducing
  // earlier diagnostics and is explicitly unsafe against Card alias leakage.
  const {deepClone} = opts.isolateGameState === true ?
    require(path.join(output,'utils')) : {deepClone:null};
  const {Card} = opts.isolateGameState === true ?
    require(path.join(output,'game/store/card/card')) : {Card:null};
  SimpleTactic.prototype.evaluateAction = function sampledEvaluateAction(
    state, playerId, action, passTurnScore
  ) {
    if (opts.isolateGameState === true) {
      return evaluateDetachedDeckSamples(
        state,playerId,action,passTurnScore,original,this,
        current=>normalizeDeepClonePrototypes(current,deepClone(current)),{
          samples:opts.samples,seed:opts.seed,permutation:deckPermutation,
          random:seededRandom,isCard:value=>value instanceof Card
        });
    }
    const player = state.players.find(p => p.id === playerId);
    if (!player) return original.call(this, state, playerId, action, passTurnScore);
    const actualDeck = player.deck.cards;
    const originalOrder = actualDeck.slice();
    const canonical = canonicalUnseenCards(actualDeck);
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
