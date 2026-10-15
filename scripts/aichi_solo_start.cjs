'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  choose, mulliganProbability, loadBasicIndex, audit,
} = require('./aichi_opening_audit.cjs');

/** @param {number} basicCount @returns {number} */
function loneBasicProbability(basicCount) {
  const invalid = mulliganProbability(basicCount);
  return basicCount * choose(60 - basicCount, 6) / choose(60, 7) / (1 - invalid);
}

/** Reuse the shared, already tested simultaneous-mulligan distribution. */
const { bonusAtLeast: offeredAtLeast } = require('./aichi_bonus_draws.cjs');

/**
 * Chance that k extra cards contain no other Basic, conditioned on exactly
 * one Basic in the initial seven. Randomized prizes have been marginalized.
 * @param {number} basicCount
 * @param {number} k
 * @returns {number}
 */
function noExtraBasic(basicCount, k) {
  if (!Number.isInteger(k) || k < 0 || k > 47) throw new RangeError('k outside draw capacity');
  if (basicCount === 1) return 1;
  if (k > 54 - basicCount) return 0;
  let result = 1;
  for (let i = 0; i < k; i++) result *= (54 - basicCount - i) / (53 - i);
  return result;
}

/**
 * Solo-Active exposure after a valid opening when accepting all offered
 * mulligan-bonus cards and Benching any additional Basics. Maximal bonus
 * drawing capacity is 47 cards after six Prize cards have been set.
 * @param {number} basicCount
 * @param {number} opponentBasicCount
 * @returns {number}
 */
function soloAfterBonus(basicCount, opponentBasicCount) {
  const pA = mulliganProbability(opponentBasicCount);
  const pB = mulliganProbability(basicCount);
  let probabilityZeroExtraBasics = 1;
  let previous = 1;
  for (let k = 1; k <= 47; k++) {
    const current = noExtraBasic(basicCount, k);
    probabilityZeroExtraBasics -= offeredAtLeast(pA, pB, k) * (previous - current);
    previous = current;
  }
  return loneBasicProbability(basicCount) * probabilityZeroExtraBasics;
}

/**
 * @param {Array<{rank:number,archetype:string,basicCount:number}>} rows
 * @param {number} opponentRank
 * @returns {Array<{rank:number,archetype:string,basics:number,soloOpening:number,soloPostBonus:number}>}
 */
function assess(rows, opponentRank) {
  const opponent = rows.find((row) => row.rank === opponentRank);
  if (!opponent) throw new Error('Missing opponent rank: ' + opponentRank);
  return rows.filter((row) => row.rank !== opponentRank).map((row) => ({
    rank: row.rank,
    archetype: row.archetype,
    basics: row.basicCount,
    soloOpening: loneBasicProbability(row.basicCount),
    soloPostBonus: soloAfterBonus(row.basicCount, opponent.basicCount),
  }));
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const data = JSON.parse(fs.readFileSync(path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const rows = audit(data.decks, loadBasicIndex(path.join(root, 'resources/cards/en')));
  const assessed = assess(rows, 26);
  const output = [
    '# Lone-Active setup exposure against rank-26 Meloetta Donk',
    '',
    'Conditional on a valid seven-card opening, separately before and after taking all offered',
    'opponent mulligan bonus cards. All Basics drawn are assumed to be Benched. A model of',
    'setup-card exposure only: actual first-turn donk depends on coin/turn selection, card access,',
    'energy, five Exeggcute Knock Outs and an attack that KOs the final Active Pokémon.',
    '',
    '| Rank | Opponent archetype | Basics | Solo after 7 | Solo after bonus |',
    '| ---: | --- | ---: | ---: | ---: |',
  ];
  for (const row of assessed) {
    output.push('| ' + row.rank + ' | ' + row.archetype + ' | ' + row.basics + ' | '
      + (row.soloOpening * 100).toFixed(3) + '% | '
      + (row.soloPostBonus * 100).toFixed(3) + '% |');
  }
  process.stdout.write(output.join('\n') + '\n');
}

module.exports = {
  loneBasicProbability, offeredAtLeast, noExtraBasic, soloAfterBonus, assess,
};
