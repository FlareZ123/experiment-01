'use strict';

/**
 * Exact source- and candidate-local first-turn card-location screens only.
 * Both source rank4 and rank17 originals each have 1 Klefki SVI among 13
 * Basic Pokémon. Sentinel v1 has 14 Basics including 1 Fan Rotom SCR,
 * and 3 Stealthy Hood. All 60s fixed. No games or decisions are modeled.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isInteger(n) || n < 0 || !Number.isInteger(k)) {
    throw new RangeError('Expected integer n>=0 and integer k');
  }
  if (k < 0 || k > n) return 0n;
  let r = 1n;
  for (let i = 1, m = Math.min(k, n - k); i <= m; i++) {
    r = r * BigInt(n - m + i) / BigInt(i);
  }
  return r;
}

/**
 * @param {{cards:number,basics:number,keyBasic:number,hand:number}} p
 * @returns {{valid:bigint,available:bigint,forced:bigint}}
 */
function sourceOpener(p) {
  const { cards:n, basics:b, keyBasic:k, hand:h } = p;
  if (![n,b,k,h].every(Number.isInteger) || b < k ||
      k < 1 || n < b || h < 1 || h > n) {
    throw new RangeError('Invalid exact source partition');
  }
  const valid = choose(n,h)-choose(n-b,h);
  const available = choose(n,h)-choose(n-k,h);
  const forced = choose(n-b+k,h)-choose(n-b,h);
  return { valid, available, forced };
}

/**
 * Physical candidate first 7 (Basic-valid) plus 1 natural draw, with one
 * target Basic (Fan Rotom) and three Hood Tools. Pre-search sighting only.
 * @param {{cards:number,basics:number,targetBasics:number,hood:number,
 *          hand:number,draws:number}} p
 * @returns {{denominator:bigint,targetSeen:bigint,targetSeenNoHood:bigint}}
 */
function candidateNatural(p) {
  const { cards:n, basics:b, targetBasics:t, hood:g, hand:h, draws:d }=p;
  if (![n,b,t,g,h,d].every(Number.isInteger) || t!==1 ||
      n<0 || b<1 || b>n || g<0 || b+g>n || h<1 ||
      d<0 || h+d>n) {
    throw new RangeError('This exact source screen requires one target Basic');
  }
  const denominator=(choose(n,h)-choose(n-b,h))*choose(n-h,d);
  // In the opening seven the target Basic is present. Any subsequent draw
  // may occur, or target first appears among post-opening natural cards.
  const targetInOpener=choose(n-1,h-1)*choose(n-h,d);
  const targetAfterOpener=(choose(n-1,h)-choose(n-b,h))*
    choose(n-h-1,d-1);
  const targetSeen=targetInOpener+targetAfterOpener;
  // Also require that none of the g Hood cards are in the first h+d:
  // if target in opener, the remaining opener avoids Hood and all draws
  // avoid remaining Hood; else the opener has another Basic and avoids
  // target/Hood, and the draw set includes the target but no Hood.
  const targetInOpenerNoHood=choose(n-1-g,h-1)*choose(n-h-g,d);
  const targetAfterOpenerNoHood=
    (choose(n-1-g,h)-choose(n-b-g,h))*
    choose(n-h-g-1,d-1);
  return {
    denominator, targetSeen,
    targetSeenNoHood:targetInOpenerNoHood+targetAfterOpenerNoHood
  };
}

const RANK4=Object.freeze({cards:60,basics:13,keyBasic:1,hand:7});
const RANK17=Object.freeze({...RANK4});
const SENTINEL=Object.freeze({
  cards:60,basics:14,targetBasics:1,hood:3,hand:7,draws:1
});

/** @returns {object} */
function run() {
  return {
    schema:'agent40-authentic-r4-r17-klefki-vs-sentinel-first8-v1',
    source4:sourceOpener(RANK4),
    source17:sourceOpener(RANK17),
    candidate:candidateNatural(SENTINEL),
    sourceIndependentPhysicalRandomization:true,
    observedGames:0,qualifiedGames:0
  };
}

module.exports = {
  choose,sourceOpener,candidateNatural,RANK4,RANK17,SENTINEL,run
};
