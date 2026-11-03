'use strict';

const assert = require('node:assert/strict');
const { choose, exactOpportunity } =
  require('./agent25-dhelmise-t1-physical-opportunity.cjs');
const printed = require('../results/als/agent25-dhelmise-mixed-lock-answers-v2.json');

const VERSION = 'agent25-dhelmise-dual-lock-donor-window-v1';
const LOCKS = Object.freeze([
  'none', 'wobbuffet', 'silent-lab', 'both', 'garbotoxin'
]);

/**
 * The three exact ME5 donor printings: Psychic Stage 1 Banette,
 * Psychic Basic Shuppet, and Grass Stage 1 Sinistcha.
 * @returns {{banette:number,shuppet:number,sinistcha:number}}
 */
function printedMix() {
  assert.equal(printed.cards.reduce((n, card) => n + card.count, 0), 60);
  const count = (id) => {
    const matches = printed.cards.filter((card) => card.id === id);
    assert.equal(matches.length, 1, 'missing or duplicated printing ' + id);
    return matches[0].count;
  };
  return { banette: count('me5-34'), shuppet: count('me5-33'),
    sinistcha: count('me5-6') };
}

/**
 * Counts donor cards whose Hide 'n' Sneak Ability remains present in
 * the discard pile under named hypothetical *active* global locks.
 * Garbotoxin requires an attached Tool and an effective Garbotoxin.
 * @param {{banette:number,shuppet:number,sinistcha:number}} mix
 * @param {string} lock
 * @returns {number}
 */
function eligibleDonors(mix, lock) {
  for (const value of Object.values(mix)) {
    assert.ok(Number.isSafeInteger(value) && value >= 0 && value <= 4);
  }
  assert.ok(LOCKS.includes(lock), 'unknown lock');
  switch (lock) {
    case 'none': return mix.banette + mix.shuppet + mix.sinistcha;
    case 'wobbuffet': return mix.banette + mix.shuppet;
    case 'silent-lab': return mix.banette + mix.sinistcha;
    case 'both': return mix.banette;
    case 'garbotoxin': return 0;
  }
}

/**
 * Necessary probability that >=4 effective donors avoid six unknown Prizes.
 * Ignores hands, Lost Zone, retrieval and the cost of discarding donors.
 * @param {number} eligible
 * @returns {number}
 */
function prizeOnlyRetention(eligible) {
  assert.ok(Number.isSafeInteger(eligible) && eligible >= 0 && eligible <= 60);
  if (eligible < 4) return 0;
  let good = 0n;
  for (let prized = 0; prized <= Math.min(eligible - 4, 6); prized++) {
    good += choose(eligible, prized) * choose(60 - eligible, 6 - prized);
  }
  return Number(good) / Number(choose(60, 6));
}

/**
 * Strict first-seven + one ordinary draw + six unknown Prize card-location
 * event from the preexisting independently tested exact BigInt calculator.
 * Ineligible donor printings are merged into the inert "other" category.
 *
 * Hypothetical expanded donor mixes consume ordinary non-Basic Trainer slots.
 * Therefore 12 fixed Basics plus Shuppet copies determine Basic count.
 * The event excludes live discard payment, opponent Item lock, actual attack
 * feasibility and all opponent continuations. It is not a win-rate estimate.
 *
 * @param {{banette:number,shuppet:number,sinistcha:number}} mix
 * @param {string} lock
 */
function screenMix(mix, lock) {
  const effective = eligibleDonors(mix, lock);
  const totalDonors = mix.banette + mix.shuppet + mix.sinistcha;
  assert.ok(totalDonors >= 4 && totalDonors <= 12);
  const basicCount = 12 + mix.shuppet;
  let strictFraction = '0';
  let strictUnconditional = 0;
  let strictGivenBasicOpening = 0;
  if (effective >= 4) {
    const counts = [4, effective, 4, 4, 1, 2, 4, 60 - 19 - effective];
    const event = exactOpportunity({ counts, basicCount });
    strictFraction = event.fraction;
    strictUnconditional = event.unconditionalProbability;
    strictGivenBasicOpening = event.conditionalBasicValidProbability;
  }
  return {
    version: VERSION, lock, mix: {...mix}, totalDonors, effective,
    basicCount, strictFraction, strictUnconditional,
    strictGivenBasicOpening, prizeOnlyRetention: prizeOnlyRetention(effective),
    isPhysicalLocationEventOnly: true,
    assumesHypotheticalExtraDonorsReplaceNonBasicTrainers: totalDonors !== 8,
    actualGameResults: 0,
    competitivelyQualifiedGames: 0
  };
}

/**
 * Exhaustively find the largest worst-case retained-donor count across
 * Wobbuffet and Silent Lab, given a 4-copy limit for each printing.
 * @param {number} total
 */
function maximinMixes(total) {
  assert.ok(Number.isSafeInteger(total) && total >= 4 && total <= 12);
  let score = -1;
  const mixes = [];
  for (let banette = 0; banette <= 4; banette++) {
    for (let shuppet = 0; shuppet <= 4; shuppet++) {
      const sinistcha = total - banette - shuppet;
      if (sinistcha < 0 || sinistcha > 4) continue;
      const mix = {banette, shuppet, sinistcha};
      const worst = Math.min(eligibleDonors(mix, 'wobbuffet'),
        eligibleDonors(mix, 'silent-lab'));
      if (worst > score) {score = worst; mixes.length = 0;}
      if (worst === score) mixes.push(mix);
    }
  }
  return {total, maximumMinimumEligibleDonors: score, mixes};
}

module.exports = { VERSION, LOCKS, printedMix, eligibleDonors,
  prizeOnlyRetention, screenMix, maximinMixes };

if (require.main === module) {
  const mix = printedMix();
  const proposed = {banette:4, shuppet:3, sinistcha:3};
  process.stdout.write(JSON.stringify({
    current: LOCKS.map(lock => screenMix(mix, lock)),
    possibleTenDonorSlotReallocation: LOCKS.map(lock =>
      screenMix(proposed, lock)),
    eightDonorMaximin: maximinMixes(8),
    tenDonorMaximin: maximinMixes(10)
  }, null, 2) + '\n');
}
