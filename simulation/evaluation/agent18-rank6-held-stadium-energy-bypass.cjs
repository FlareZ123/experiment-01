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

/**
 * In original rank6, three Guzma BUS are contained within the 47 residual
 * cards of the preceding source model. Count the disjoint direct-held E
 * event that additionally has at least one Guzma among its eight physical
 * hand cards, either with exactly one Basic (an unavoidable solo board) or
 * any number of Basics. A player can optionally refrain from benching
 * additional Basics; this function does not decide that board placement.
 *
 * The opponent must already have a Benched Pokémon for Guzma to gust.
 * Printed cards, Supporter quota, status, locks, target HP and real game
 * choice remain external to this physical opening calculation.
 *
 * @param {{exactlyOneBasic?:boolean}} [options]
 * @returns {{numerator:bigint,denominator:bigint,percentage:number,
 *   favorable:bigint,scope:string}}
 */
function heldStadiumEnergyWithGuzma(options={}) {
  const {exactlyOneBasic=false}=options;
  const total=(choose(60,7)-choose(56,7))*53n;
  let favorable;
  if(exactlyOneBasic){
    // All 51 E-eligible nonresource cards consist of 4 Basics,
    // 3 Guzma and 44 others. Exactly one Basic must remain among eight.
    // Subtract the zero-Guzma counterparts (44 ordinary residual cards).
    favorable=4n*(
      choose(47,4)*43n-choose(44,4)*40n+
      2n*(choose(47,5)-choose(44,5))
    );
  } else {
    const e=heldStadiumEnergyWithoutSupporterConnectors();
    const allE=e.firstSevenBoth+e.eighthCompletesPair;
    const noGuzma=
      (choose(48,5)-choose(44,5))*43n+
      2n*(choose(48,6)-choose(44,6));
    favorable=allE-noGuzma;
  }
  assert.ok(favorable>0n && favorable<=total);
  const div=gcd(favorable,total);
  return {
    numerator:favorable/div,denominator:total/div,
    percentage:100*Number(favorable)/Number(total),
    favorable,
    scope:'Exact physical opening; possible Guzma gust requires opponent Bench and a legal chosen action'
  };
}

module.exports={ORIGINAL_RANK6,choose,heldStadiumEnergyWithoutSupporterConnectors,heldStadiumEnergyWithGuzma};
