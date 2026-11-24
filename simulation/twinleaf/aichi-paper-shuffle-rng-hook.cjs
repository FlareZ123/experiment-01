'use strict';

const assert = require('node:assert/strict');
const {shuffleInPlace, shufflePrizePositions} =
  require('./paper-shuffle-rng-utils.cjs');

let activeRestore = null;

/**
 * Route the Aichi-field card implementations that directly randomize physical
 * hand/Prize order through the owning player's unbiased physical-shuffle stream.
 * Only the live root Store is intercepted; speculative bot Stores retain the
 * policy RNG installed around decodeNextAction().
 *
 * @param {{
 *   engine:(relativePath:string)=>any,
 *   rootStore:any,
 *   randomBySeat:Array<(()=>number & {randomInt:(bound:number)=>number})>
 * }} options
 * @returns {()=>void}
 */
function installAichiPaperShuffleRngHook({engine, rootStore, randomBySeat}) {
  if (activeRestore !== null) throw new Error('Aichi paper-shuffle RNG hook already installed');
  if (typeof engine !== 'function') throw new TypeError('Pinned engine loader is required');
  if (!rootStore || !rootStore.state || !Array.isArray(rootStore.state.players)) {
    throw new TypeError('Live root Store with players is required');
  }
  if (!Array.isArray(randomBySeat) || randomBySeat.length !== 2 ||
      randomBySeat.some(stream => !stream || typeof stream.randomInt !== 'function')) {
    throw new TypeError('Two owner-local unbiased physical shuffle streams are required');
  }

  const restores = [];

  function patchPrizeShuffle(relativePath, className) {
    const CardClass = engine(relativePath)[className];
    if (!CardClass || !CardClass.prototype) {
      throw new Error('Pinned card class unavailable: ' + className);
    }
    const prototype = CardClass.prototype;
    const originalReduce = prototype.reduceEffect;
    const originalShuffle = prototype.shuffleFaceDownPrizeCards;
    if (typeof originalReduce !== 'function' || typeof originalShuffle !== 'function') {
      throw new Error('Pinned Prize shuffle methods unavailable: ' + className);
    }
    let activeSeat = null;

    const patchedReduce = function ownerLocalPrizeReduce(store, state, effect) {
      if (store !== rootStore || effect?.trainerCard !== this || !effect?.player) {
        return originalReduce.call(this, store, state, effect);
      }
      const seat = state.players.indexOf(effect.player);
      if (seat !== 0 && seat !== 1) {
        throw new Error(className + ' physical Prize owner is not a player seat');
      }
      const existingPrompt = Object.getOwnPropertyDescriptor(store, 'prompt');
      if (existingPrompt && existingPrompt.configurable === false) {
        throw new Error('Cannot safely scope Prize-shuffle owner context');
      }
      const originalPrompt = store.prompt;
      const wrappedPrompt = function ownerLocalPrizePrompt(promptState, prompt, callback) {
        if (typeof callback !== 'function') {
          return originalPrompt.call(this, promptState, prompt, callback);
        }
        const wrappedCallback = (...args) => {
          const previousSeat = activeSeat;
          activeSeat = seat;
          try {
            return callback(...args);
          } finally {
            activeSeat = previousSeat;
          }
        };
        return originalPrompt.call(this, promptState, prompt, wrappedCallback);
      };
      Object.defineProperty(store, 'prompt', {
        configurable: true,
        writable: true,
        value: wrappedPrompt
      });
      try {
        return originalReduce.call(this, store, state, effect);
      } finally {
        assert.strictEqual(store.prompt, wrappedPrompt,
          className + ' lost ownership of the scoped Store.prompt hook');
        if (existingPrompt) Object.defineProperty(store, 'prompt', existingPrompt);
        else delete store.prompt;
      }
    };

    const patchedShuffle = function ownerLocalPrizeShuffle(positions) {
      if (activeSeat === null) return originalShuffle.call(this, positions);
      return shufflePrizePositions(positions, randomBySeat[activeSeat]);
    };

    prototype.reduceEffect = patchedReduce;
    prototype.shuffleFaceDownPrizeCards = patchedShuffle;
    restores.push(() => {
      assert.strictEqual(prototype.reduceEffect, patchedReduce,
        className + ' reduceEffect hook restoration order changed');
      assert.strictEqual(prototype.shuffleFaceDownPrizeCards, patchedShuffle,
        className + ' Prize shuffle hook restoration order changed');
      prototype.shuffleFaceDownPrizeCards = originalShuffle;
      prototype.reduceEffect = originalReduce;
    });
  }

  function patchHandShuffle(relativePath, className) {
    const CardClass = engine(relativePath)[className];
    if (!CardClass || !CardClass.prototype) {
      throw new Error('Pinned card class unavailable: ' + className);
    }
    const prototype = CardClass.prototype;
    const originalReduce = prototype.reduceEffect;
    const originalShuffle = prototype.shuffleCards;
    if (typeof originalReduce !== 'function' || typeof originalShuffle !== 'function') {
      throw new Error('Pinned hand shuffle methods unavailable: ' + className);
    }
    let activeState = null;

    const patchedReduce = function ownerLocalHandReduce(store, state, effect) {
      if (store !== rootStore || effect?.trainerCard !== this || !effect?.player) {
        return originalReduce.call(this, store, state, effect);
      }
      const previousState = activeState;
      activeState = state;
      try {
        return originalReduce.call(this, store, state, effect);
      } finally {
        activeState = previousState;
      }
    };

    const patchedShuffle = function ownerLocalHandShuffle(cards) {
      if (activeState === null || !Array.isArray(cards) || cards.length < 2) {
        return originalShuffle.call(this, cards);
      }
      const owners = activeState.players
        .map((player, seat) => ({seat, ownsCard: cards.some(card => player.hand.cards.includes(card))}))
        .filter(owner => owner.ownsCard);
      if (owners.length !== 1) {
        throw new Error(className + ' could not identify exactly one physical hand owner');
      }
      shuffleInPlace(cards, randomBySeat[owners[0].seat]);
    };

    prototype.reduceEffect = patchedReduce;
    prototype.shuffleCards = patchedShuffle;
    restores.push(() => {
      assert.strictEqual(prototype.reduceEffect, patchedReduce,
        className + ' reduceEffect hook restoration order changed');
      assert.strictEqual(prototype.shuffleCards, patchedShuffle,
        className + ' hand shuffle hook restoration order changed');
      prototype.shuffleCards = originalShuffle;
      prototype.reduceEffect = originalReduce;
    });
  }

  try {
    patchPrizeShuffle(
      'sets/08-sun-and-moon/set-crimson-invasion/gladion',
      'Gladion'
    );
    patchHandShuffle(
      'sets/09-sword-and-shield/set-sword-and-shield/marnie',
      'Marnie'
    );
    patchHandShuffle(
      'sets/10-scarlet-and-violet/set-paldea-evolved/iono',
      'Iono'
    );
  } catch (error) {
    for (const restore of restores.reverse()) restore();
    throw error;
  }

  const restore = () => {
    if (activeRestore !== restore) {
      throw new Error('Aichi paper-shuffle RNG hook restoration order changed');
    }
    for (const undo of restores.reverse()) undo();
    activeRestore = null;
  };
  activeRestore = restore;
  return restore;
}

module.exports = {installAichiPaperShuffleRngHook};
