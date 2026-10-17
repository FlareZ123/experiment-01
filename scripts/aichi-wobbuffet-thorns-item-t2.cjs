'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { choose, sourceTempleProfile, wobbuffetNaturalTurnTwo } =
  require('./aichi-temple-wobbuffet-thorns-t2.cjs');
const { mulliganProbability } = require('./aichi_opening_audit.cjs');
const { bonusExactly, bonusAtLeast } = require('./aichi_bonus_draws.cjs');

const INDEX = Object.freeze({
  v: 0, vmax: 1, energy: 2, fog: 3, treasure: 4, quick: 5, other: 6,
});

/** @returns {number[]} Source-verified groups excluding Wobbuffet. */
function sourceGroups() {
  const manifest = require(path.resolve(__dirname,
    '../results/aichi-2026/candidate-temple-shadow-rider.json'));
  /** @param {string} name */
  const copies = name => manifest.cards.filter(c => c.name === name)
    .reduce((total, c) => total + c.count, 0);
  const groups = [
    copies('Shadow Rider Calyrex V'),
    copies('Shadow Rider Calyrex VMAX'),
    copies('Psychic Energy'),
    copies('Fog Crystal'),
    copies('Mysterious Treasure'),
    copies('Quick Ball'),
  ];
  const total = manifest.cards.reduce((acc, c) => acc + c.count, 0);
  assert.equal(total, 60);
  assert.equal(copies('Wobbuffet'), 1);
  groups.push(total - 1 - groups.reduce((a, b) => a + b, 0));
  assert.deepEqual(groups, [4, 3, 11, 4, 4, 1, 32]);
  return groups;
}

/**
 * Yield each unordered category allocation and its exact multiplicity.
 * @param {number[]} available
 * @param {number} amount
 * @param {(counts:number[],multiplicity:bigint)=>void} emit
 */
function allocations(available, amount, emit) {
  const counts = Array(available.length).fill(0);
  /** @param {number} at @param {number} left @param {bigint} weight */
  function visit(at, left, weight) {
    if (at === available.length) {
      if (left === 0) emit(counts.slice(), weight);
      return;
    }
    for (let n = 0; n <= Math.min(available[at], left); n++) {
      counts[at] = n;
      visit(at + 1, left - n, weight * choose(available[at], n));
    }
  }
  visit(0, amount, 1n);
}

/**
 * Exact numerator over six-Prize choices and the subsequent one-card draw.
 * Sum available copies of drawCategory across Prize subsets satisfying any
 * required unprized V (T1 search) and VMAX (T2 search) conditions. A T1 V
 * search additionally removes one V from the deck before the T2 draw.
 *
 * @param {number[]} unseen Seven groups after the first-turn observations.
 * @param {number} drawCategory
 * @param {boolean} needsV
 * @param {boolean} needsVMAX
 * @param {number} [prizes]
 * @returns {bigint}
 */
function prizeWeightedDrawMass(unseen, drawCategory, needsV, needsVMAX, prizes = 6) {
  const total = unseen.reduce((a, b) => a + b, 0);
  const copies = BigInt(unseen[drawCategory]);
  let mass = copies * choose(total - 1, prizes);
  const failed = [];
  if (needsV) failed.push(INDEX.v);
  if (needsVMAX) failed.push(INDEX.vmax);

  for (const missingType of failed) {
    if (drawCategory !== missingType) {
      mass -= copies * choose(total - unseen[missingType] - 1,
        prizes - unseen[missingType]);
    }
  }
  if (failed.length === 2 && !failed.includes(drawCategory)) {
    mass += copies * choose(total - unseen[failed[0]] - unseen[failed[1]] - 1,
      prizes - unseen[failed[0]] - unseen[failed[1]]);
  }

  if (needsV && drawCategory === INDEX.v) {
    let validPrizeWays = choose(total, prizes);
    for (const missingType of failed) {
      validPrizeWays -= choose(total - unseen[missingType],
        prizes - unseen[missingType]);
    }
    if (failed.length === 2) {
      validPrizeWays += choose(total - unseen[failed[0]] - unseen[failed[1]],
        prizes - unseen[failed[0]] - unseen[failed[1]]);
    }
    mass -= validPrizeWays;
  }
  assert.ok(mass >= 0n);
  return mass;
}

/**
 * Source-restricted T1 search choice; all target searches check unprized cards,
 * while discard costs and all other game actions are deliberately excluded.
 * @param {number[]} groups Source inventory excluding Wobbuffet.
 * @param {number[]} hand Cards visible after original opening + bonus + T1 draw.
 * @param {number|null} choice T1 item used to search V, or null if V in hand.
 * @param {number} [prizes]
 * @returns {bigint} Successful Prize-by-T2-draw multiplicity.
 */
function searchChoiceScore(groups, hand, choice, prizes = 6) {
  assert.equal(groups.length, 7);
  assert.equal(hand.length, 7);
  const requiresVSearch = hand[INDEX.v] === 0;
  if (requiresVSearch && (choice === null || hand[choice] < 1)) return 0n;
  if (!requiresVSearch && choice !== null) return 0n;
  const unseen = groups.map((n, i) => n - hand[i]);
  let successful = 0n;
  for (let drawCategory = 0; drawCategory < groups.length; drawCategory++) {
    const hasVMAX = hand[INDEX.vmax] > 0 || drawCategory === INDEX.vmax;
    const hasEnergy = hand[INDEX.energy] > 0 || drawCategory === INDEX.energy;
    const treasureAvailable = hand[INDEX.treasure]
      - Number(choice === INDEX.treasure) + Number(drawCategory === INDEX.treasure);
    const fogAvailable = hand[INDEX.fog]
      - Number(choice === INDEX.fog) + Number(drawCategory === INDEX.fog);
    if (!hasVMAX && treasureAvailable < 1) continue;
    if (!hasEnergy && fogAvailable < 1) continue;
    if (!hasEnergy) assert.ok(unseen[INDEX.energy] > prizes);
    successful += prizeWeightedDrawMass(unseen, drawCategory,
      requiresVSearch, !hasVMAX, prizes);
  }
  return successful;
}

/** @param {bigint} n @param {bigint} d @returns {bigint} */
function gcd(n, d) {
  while (d) [n, d] = [d, n % d];
  return n;
}

/**
 * Exact optimal K0 source-restricted one-Item V search policy. First-turn
 * choice maximizes average success over hidden random Prizes and T2 draws,
 * using only visible first-turn card identities. On T2, Mysterious Treasure
 * can fetch missing VMAX and Fog Crystal can fetch missing Psychic Energy.
 * All such target choices consume separate Item copies. First-turn V search
 * removes a V from the deck before reshuffling for the second-turn draw.
 *
 * @param {number[]} groups From sourceGroups().
 * @param {number} [bonusDraws] Opponent mulligan bonuses voluntarily accepted.
 */
function optimalSourceRestrictedTurnTwo(groups, bonusDraws = 0) {
  assert.deepEqual(groups, [4, 3, 11, 4, 4, 1, 32]);
  assert.ok(Number.isInteger(bonusDraws) && bonusDraws >= 0 && bonusDraws <= 45);
  if (bonusDraws === 45) {
    const natural = wobbuffetNaturalTurnTwo(sourceTempleProfile(), 45);
    return {
      bonusDraws, fraction: natural.fraction, percent: natural.percent,
      lastCardNoSearchOnly: true,
    };
  }

  const observedOther = 7 + bonusDraws;
  const noSearchDeckSize = 46 - bonusDraws;
  const withVSearchDeckSize = noSearchDeckSize - 1;
  const categories = [INDEX.quick, INDEX.fog, INDEX.treasure];
  let favorable = 0n;
  /** @type {Record<string,bigint>} */
  const choices = {direct:0n, quick:0n, fog:0n, treasure:0n};

  allocations(groups, observedOther, (hand, weight) => {
    const available = hand[INDEX.v] > 0
      ? [null]
      : categories.filter(i => hand[i] > 0);
    if (available.length === 0) return;
    let best = available[0];
    let bestScore = searchChoiceScore(groups, hand, best);
    for (let i = 1; i < available.length; i++) {
      const candidate = available[i];
      const candidateScore = searchChoiceScore(groups, hand, candidate);
      if (candidateScore > bestScore) {
        best = candidate;
        bestScore = candidateScore;
      }
    }
    const normalized = weight * bestScore *
      BigInt(best === null ? withVSearchDeckSize : noSearchDeckSize);
    favorable += normalized;
    const key = best === null ? 'direct'
      : best === INDEX.quick ? 'quick'
      : best === INDEX.fog ? 'fog' : 'treasure';
    choices[key] += normalized;
  });

  const validOpenings = choose(60, 7) - choose(45, 7);
  const numerator = favorable * choose(59, 6);
  const denominator = validOpenings * choose(59, observedOther)
    * choose(52 - bonusDraws, 6)
    * BigInt(noSearchDeckSize) * BigInt(withVSearchDeckSize);
  const common = gcd(numerator, denominator);
  return {
    bonusDraws,
    fraction: String(numerator / common) + '/' + String(denominator / common),
    percent: 100 * Number(numerator) / Number(denominator),
    contributionPercent: Object.fromEntries(
      Object.entries(choices).map(([name, value]) => [
        name, 100 * Number(value * choose(59, 6)) / Number(denominator),
      ])),
  };
}

/**
 * The exact bilateral mulligan distribution, full 0..44 sum and 45+ tail.
 * @param {number} opponentBasics
 * @param {number[]} groups
 */
function weightedAgainstOpponent(opponentBasics, groups) {
  assert.ok(Number.isInteger(opponentBasics) && opponentBasics >= 1 && opponentBasics <= 60);
  const pA = mulliganProbability(opponentBasics);
  const pB = mulliganProbability(sourceTempleProfile().basics);
  let percent = 0;
  for (let d = 0; d < 45; d++) {
    percent += bonusExactly(pA, pB, d)
      * optimalSourceRestrictedTurnTwo(groups, d).percent;
  }
  percent += bonusAtLeast(pA, pB, 45)
    * optimalSourceRestrictedTurnTwo(groups, 45).percent;
  return {
    opponentBasics,
    percent,
    noBonusPercent: optimalSourceRestrictedTurnTwo(groups).percent,
    atLeastOneBonusOffer: bonusAtLeast(pA, pB, 1),
    tailCap: 45,
    prizeCards: 6,
  };
}

if (require.main === module) {
  const groups = sourceGroups();
  console.log(JSON.stringify({
    source: 'Temple v1',
    groupOrder: Object.keys(INDEX),
    groups,
    bonusScenarios: [0, 1, 2, 3, 4, 5]
      .map(d => optimalSourceRestrictedTurnTwo(groups, d)),
    ironThornsFourBasics: weightedAgainstOpponent(4, groups),
  }, null, 2));
}

module.exports = {
  INDEX, sourceGroups, allocations, prizeWeightedDrawMass, searchChoiceScore,
  optimalSourceRestrictedTurnTwo, weightedAgainstOpponent,
};
