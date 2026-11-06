'use strict';

const assert = require('node:assert/strict');

const ORIGINAL_RANK6 = Object.freeze({
  total: 60,
  basics: 4,
  guzmaHala: 2,
  tagCall: 2,
  trainersMail: 3,
  thunderMountain: 1,
  doubleColorless: 1,
  other: 47
});

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && Number.isSafeInteger(k));
  if (k < 0 || n < 0 || k > n) return 0n;
  let r = 1n;
  for (let i = 1; i <= Math.min(k, n-k); i++) {
    r = (r * BigInt(n-i+1)) / BigInt(i);
  }
  return r;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) {
  while (b !== 0n) [a,b] = [b,a%b];
  return a;
}

/**
 * Exact source opening event: original rank6 has both singleton Thunder Mountain
 * and DCE in the first legal seven plus first-turn going-second draw, but holds
 * no Guzma & Hala, Tag Call, or Trainers' Mail. This is provably disjoint from
 * the previously modeled direct/Mail G&H routes.
 *
 * Six random Prize cards are dealt between the opening seven and the draw.
 * Marginalizing over their order makes that draw uniform among the remaining
 * 53 physical cards. The event is only about the eight observed hand cards;
 * it does not infer hidden Prize composition or successful native actions.
 *
 * @param {{requireSecondBasic?: boolean}} [options]
 * @returns {{numerator:bigint,denominator:bigint,percentage:number,
 *   firstSevenBoth:bigint,eighthCompletesPair:bigint}}
 */
function heldStadiumEnergyWithoutSupporterConnectors(options={}) {
  const {requireSecondBasic=false}=options;
  const n=ORIGINAL_RANK6;
  assert.equal(n.total,n.basics+n.guzmaHala+n.tagCall+
    n.trainersMail+n.thunderMountain+n.doubleColorless+n.other);
  const population=n.basics+n.other;
  const availableEighth=population-5;
  let firstSevenBoth=0n;
  let eighthCompletesPair=0n;
  for(let b=1;b<=n.basics;b++) {
    const waysInitial5=choose(n.basics,b)*choose(n.other,5-b);
    const allowedEighth=(requireSecondBasic && b===1) ?
      n.basics-b : availableEighth;
    firstSevenBoth+=waysInitial5*BigInt(allowedEighth);
    if(!requireSecondBasic || b>=2)
      eighthCompletesPair+=2n*choose(n.basics,b)*choose(n.other,6-b);
  }
  const denominator=(choose(n.total,7)-choose(n.total-n.basics,7))*53n;
  const numerator=firstSevenBoth+eighthCompletesPair;
  const d=gcd(numerator,denominator);
  return {
    numerator:numerator/d,denominator:denominator/d,
    percentage:100*Number(numerator)/Number(denominator),
    firstSevenBoth,eighthCompletesPair
  };
}

module.exports={ORIGINAL_RANK6,choose,heldStadiumEnergyWithoutSupporterConnectors};
