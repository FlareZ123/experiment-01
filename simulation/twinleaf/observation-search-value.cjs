'use strict';

const { choose } = require('./redeal-posterior.cjs');

/**
 * Exact expected best-card value from a top-of-deck reveal/search.
 *
 * The unseen pool is the multiset of cards whose location and order the player
 * has not yet learned. With zero unrevealed Prizes, it is the unknown-order
 * suffix of the real deck (K1). With unrevealed Prizes, it is the union of
 * the unknown deck suffix and unknown Prize cards (K0). Known-top cards are
 * supplied separately and in their remembered order.
 *
 * This model assumes a uniform unknown ordered deck and uniform allocation
 * of the unseen pool between deck and Prizes, conditioned on the observations.
 * Only the maximum reward obtainable among cards revealed is evaluated.
 * It does not evaluate arbitrary game-state transitions, missed search costs,
 * decision contention, or opponent uncertainty.
 *
 * @param {{knownTop?:string[], unseenPool:string[], deckCount:number,
 *   unrevealedPrizes:number, window:number, rewardByName:Record<string,number>,
 *   missValue:number, uniformUnknownOrder:true}} observation
 * @returns {{expectedValue:number,knownBest:number,unknownRevealed:number,
 *   unseenCount:number,thresholds:Array<{reward:number,numerator:string,
 *   denominator:string,probability:number}>}}
 */
function expectedTopWindowValue(observation) {
  if (observation?.uniformUnknownOrder !== true) {
    throw new Error('Uniform conditional unknown order must be established');
  }
  const { unseenPool, deckCount, unrevealedPrizes, window,
    rewardByName, missValue } = observation;
  const knownTop = observation.knownTop ?? [];
  if (!Array.isArray(knownTop) || !Array.isArray(unseenPool) ||
    ![...knownTop, ...unseenPool].every(name => typeof name === 'string' && name.length > 0)) {
    throw new TypeError('Expected resolved known-top and unseen card-name multisets');
  }
  if (![deckCount, unrevealedPrizes, window].every(n => Number.isSafeInteger(n) && n >= 0) ||
    deckCount < knownTop.length ||
    unseenPool.length !== deckCount - knownTop.length + unrevealedPrizes) {
    throw new RangeError('Deck, known-top, and unseen Prize counts must reconcile');
  }
  if (rewardByName === null || typeof rewardByName !== 'object' ||
    Array.isArray(rewardByName) || !Number.isFinite(missValue) ||
    !Object.values(rewardByName).every(Number.isFinite)) {
    throw new TypeError('Rewards and miss value must be finite numbers');
  }
  const getReward = name => Object.hasOwn(rewardByName, name) ?
    rewardByName[name] : missValue;
  const actualWindow = Math.min(window, deckCount);
  const knownBest = knownTop.slice(0, actualWindow)
    .reduce((best, name) => Math.max(best, getReward(name)), missValue);
  const unknownRevealed = Math.max(0, actualWindow - knownTop.length);
  const total = unseenPool.length;
  const denominator = choose(total, unknownRevealed);
  const tiers = [...new Set(unseenPool.map(getReward)
    .filter(value => value > knownBest))].sort((a, b) => a - b);
  let lastValue = knownBest;
  let expectedValue = knownBest;
  const thresholds = [];
  for (const reward of tiers) {
    const hits = unseenPool.filter(name => getReward(name) >= reward).length;
    const numerator = denominator - choose(total - hits, unknownRevealed);
    const probability = Number(numerator) / Number(denominator);
    expectedValue += (reward - lastValue) * probability;
    thresholds.push({reward, numerator: numerator.toString(),
      denominator: denominator.toString(), probability});
    lastValue = reward;
  }
  return {expectedValue, knownBest, unknownRevealed,
    unseenCount: total, thresholds};
}

module.exports = { expectedTopWindowValue };
