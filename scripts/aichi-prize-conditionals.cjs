'use strict';

/**
 * Exact binomial coefficient for small and moderate nonnegative integers.
 * @param {number} n Population size.
 * @param {number} k Selected count.
 * @returns {bigint}
 */
function choose(n, k) {
  if (!Number.isSafeInteger(n) || n < 0 || !Number.isSafeInteger(k)) {
    throw new RangeError('Population and sample size must be safe integers');
  }
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    result = result * BigInt(n - i + 1) / BigInt(i);
  }
  return result;
}

/**
 * Hypergeometric distribution for named cards among uniformly random Prizes,
 * conditional on cards already known in the hand or in play.
 * @param {number} unseen Cards not known to the acting player.
 * @param {number} copies Copies of the named card within those unseen cards.
 * @param {number} prizes Face-down Prize cards within the unseen population.
 * @returns {Array<{prized:number,ways:bigint,total:bigint,p:number}>}
 */
function prizeDistribution(unseen, copies, prizes) {
  if (!Number.isSafeInteger(copies) || copies < 0 || copies > unseen ||
      !Number.isSafeInteger(prizes) || prizes < 0 || prizes > unseen) {
    throw new RangeError('Invalid unseen-card, target-copy, or Prize counts');
  }
  const total = choose(unseen, prizes);
  const result = [];
  for (let k = Math.max(0, prizes - (unseen - copies));
       k <= Math.min(copies, prizes); k++) {
    const ways = choose(copies, k) * choose(unseen - copies, prizes - k);
    result.push({prized:k, ways, total, p:Number(ways) / Number(total)});
  }
  return result;
}

/**
 * Probability that a blind look at the next cards hits at least one target.
 * The deck is presumed uniformly shuffled and the target count known.
 * @param {number} deckSize Cards remaining.
 * @param {number} targets Target cards in the deck.
 * @param {number} seen Number of cards looked at.
 * @returns {{ways:bigint,total:bigint,p:number}}
 */
function nextCardsHit(deckSize, targets, seen) {
  if (!Number.isSafeInteger(targets) || targets < 0 || targets > deckSize ||
      !Number.isSafeInteger(seen) || seen < 0 || seen > deckSize) {
    throw new RangeError('Invalid target or look count');
  }
  const total = choose(deckSize, seen);
  const ways = total - choose(deckSize - targets, seen);
  return {ways,total,p:Number(ways) / Number(total)};
}

module.exports = {choose, prizeDistribution, nextCardsHit};
