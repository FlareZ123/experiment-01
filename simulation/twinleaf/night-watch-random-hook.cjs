'use strict';

const path = require('node:path');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const load = modulePath => require(path.join(root, modulePath));

let restoreActive = null;

/**
 * Uniformly sample distinct object references without changing the source array.
 * Math.random is already the game-event RNG in the headless runner.
 *
 * @template T
 * @param {T[]} cards Source cards in their original order.
 * @param {number} count Number of cards to select.
 * @param {() => number} random Uniform random source in [0,1).
 * @returns {T[]} Sampled card references.
 */
function randomSubset(cards, count, random = Math.random) {
  if (!Array.isArray(cards) || !Number.isInteger(count) ||
      count < 0 || count > cards.length) {
    throw new Error('Invalid Night Watch random-subset request.');
  }
  const pool = cards.slice();
  for (let i = 0; i < count; i += 1) {
    const j = i + Math.floor(random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/**
 * Correct pinned Night Watch's ChooseCardsPrompt over the entire opponent hand.
 * The upstream printed attack is random, but the ordinary prompt lets the
 * attacker choose the highest-scored hidden cards. This hook presents only
 * the randomly selected physical card objects to the existing prompt and
 * preserves its real Move/Reveal/Shuffle callback.
 *
 * Only prompts synchronously emitted by the concrete Night Watch card's
 * reducer are eligible, including its Perfection copied-attack route.
 * All upstream code and methods are restored after the surrounding trial.
 *
 * @returns {() => void} Restores the original pinned prototypes.
 */
function installNightWatchRandomHook() {
  if (restoreActive) return restoreActive;
  const { TrevenantDusknoirGX } =
    load('sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx');
  const { Store } = load('game/store/store');
  const { CardList } = load('game/store/state/card-list');
  const { ChooseCardsPrompt } = load('game/store/prompts/choose-cards-prompt');
  const { AttackEffect } = load('game/store/effects/game-effects');

  const originalReduce = TrevenantDusknoirGX.prototype.reduceEffect;
  const originalPrompt = Store.prototype.prompt;
  let nightWatchScope = 0;

  /** @param {any} store @param {any} state @param {any} effect */
  function scopedReduce(store, state, effect) {
    if (!(effect instanceof AttackEffect) || effect.attack?.name !== 'Night Watch') {
      return originalReduce.call(this, store, state, effect);
    }
    nightWatchScope += 1;
    try {
      return originalReduce.call(this, store, state, effect);
    } finally {
      nightWatchScope -= 1;
    }
  }

  /** @param {any} state @param {any} prompt @param {Function} then */
  function scopedPrompt(state, prompt, then) {
    if (nightWatchScope !== 0 && prompt instanceof ChooseCardsPrompt &&
        prompt.options.isSecret === true &&
        prompt.options.allowCancel === false &&
        prompt.options.min === prompt.options.max &&
        prompt.options.max === Math.min(2, prompt.cards.cards.length)) {
      const attacker = state.players.find(player => player.id === prompt.playerId);
      const opponent = state.players.find(player => player.id !== prompt.playerId);
      if (attacker && opponent && prompt.cards === opponent.hand) {
        const selected = randomSubset(opponent.hand.cards, prompt.options.max);
        const restricted = new CardList();
        restricted.cards = selected;
        prompt.cards = restricted;
      }
    }
    return originalPrompt.call(this, state, prompt, then);
  }

  TrevenantDusknoirGX.prototype.reduceEffect = scopedReduce;
  Store.prototype.prompt = scopedPrompt;

  restoreActive = () => {
    if (TrevenantDusknoirGX.prototype.reduceEffect === scopedReduce) {
      TrevenantDusknoirGX.prototype.reduceEffect = originalReduce;
    }
    if (Store.prototype.prompt === scopedPrompt) {
      Store.prototype.prompt = originalPrompt;
    }
    restoreActive = null;
  };
  return restoreActive;
}

/**
 * @template T
 * @param {() => T} run One synchronous source-locked diagnostic or staged test.
 * @returns {T}
 */
function withNightWatchRandomHook(run) {
  const restore = installNightWatchRandomHook();
  try {
    return run();
  } finally {
    restore();
  }
}

module.exports = { randomSubset, installNightWatchRandomHook, withNightWatchRandomHook };
