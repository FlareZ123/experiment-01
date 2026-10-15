'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  audit, loadBasicIndex, choose, mulliganProbability,
  opponentDrawOpportunities,
} = require('./aichi_opening_audit.cjs');

/**
 * Exact distribution of optional bonus draw opportunities received by player B
 * because player A mulligans. Simultaneous mulligans award neither player a
 * bonus draw. Once B has a valid opening, each further A mulligan counts.
 *
 * @param {number} pA Initial seven-card mulligan probability of player A.
 * @param {number} pB Initial seven-card mulligan probability of player B.
 * @param {number} k Nonnegative number of offered draws.
 * @returns {number} P(K = k).
 */
function bonusExactly(pA, pB, k) {
  validateParameters(pA, pB, k);
  const denominator = 1 - pA * pB;
  if (k === 0) return (1 - pA) / denominator;
  return (1 - pA) * (1 - pB) * (pA ** k) / denominator;
}

/**
 * @param {number} pA
 * @param {number} pB
 * @param {number} k Positive integer.
 * @returns {number} P(K >= k).
 */
function bonusAtLeast(pA, pB, k) {
  validateParameters(pA, pB, k);
  if (k < 1) throw new RangeError('Tail threshold must be positive.');
  return (1 - pB) * (pA ** k) / (1 - pA * pB);
}

/**
 * @param {number} pA
 * @param {number} pB
 * @param {number} k
 */
function validateParameters(pA, pB, k) {
  if (![pA, pB].every(p => Number.isFinite(p) && p >= 0 && p < 1) ||
      !Number.isInteger(k) || k < 0) {
    throw new RangeError('Invalid mulligan probabilities or count.');
  }
}

/**
 * Player B draws a valid opening of seven, sets six random Prize cards, then
 * voluntarily takes every offered extra card up to available deck size.
 * The target cards are a subset of B's Basic Pokemon.
 *
 * Sampling the extra cards after setting Prizes is equivalent, for the
 * marginal probability of finding the target, to drawing them uniformly
 * from the 53 cards outside B's opening hand. Six random Prize cards are
 * exchangeable with the rest, though still inaccessible in actual play.
 *
 * @param {number} opponentBasics Number of Basic Pokemon in A's 60 cards.
 * @param {number} ownBasics Number of Basic Pokemon in B's 60 cards.
 * @param {number} targetCopies Number of target Basic Pokemon in B's deck.
 * @returns {{opening:number,withAllBonuses:number,improvement:number,bonusOne:number,bonusThree:number,expectedOffers:number}}
 */
function targetAccess(opponentBasics, ownBasics, targetCopies) {
  if (![opponentBasics, ownBasics, targetCopies].every(Number.isInteger) ||
      opponentBasics < 1 || opponentBasics > 60 ||
      ownBasics < 1 || ownBasics > 60 ||
      targetCopies < 1 || targetCopies > ownBasics) {
    throw new RangeError('Invalid Basic Pokemon or target count.');
  }
  const pA = mulliganProbability(opponentBasics);
  const pB = mulliganProbability(ownBasics);
  const denominator = choose(60, 7) - choose(60 - ownBasics, 7);
  const missOpening = (choose(60 - targetCopies, 7) -
    choose(60 - ownBasics, 7)) / denominator;

  // After the opening and six Prizes, at most 47 cards remain to draw.
  // Aggregate all K >= 47 in one tail event rather than truncate probability.
  let missAfterBonuses = 0;
  for (let k = 0; k < 47; k += 1) {
    missAfterBonuses += bonusExactly(pA, pB, k) *
      choose(53 - targetCopies, k) / choose(53, k);
  }
  missAfterBonuses += bonusAtLeast(pA, pB, 47) *
    choose(53 - targetCopies, 47) / choose(53, 47);

  const opening = 1 - missOpening;
  const withAllBonuses = 1 - missOpening * missAfterBonuses;
  return {
    opening,
    withAllBonuses,
    improvement: withAllBonuses - opening,
    bonusOne: bonusAtLeast(pA, pB, 1),
    bonusThree: bonusAtLeast(pA, pB, 3),
    expectedOffers: opponentDrawOpportunities(pA, pB),
  };
}

/**
 * @param {object} manifest Complete imported list manifest.
 * @param {Map<string, boolean|null>} basicIndex Basic-stage dictionary.
 * @param {number} candidateRank
 * @param {string} targetName
 * @returns {Array<object>}
 */
function fieldAccess(manifest, basicIndex, candidateRank = 1,
  targetName = 'Shadow Rider Calyrex V') {
  const candidate = manifest.decks.find(d => d.rank === candidateRank);
  if (!candidate) throw new Error('No published candidate at rank ' + candidateRank);
  if (basicIndex.get(targetName) !== true) {
    throw new Error('Target must be a verified Basic Pokemon.');
  }
  const targetCopies = candidate.cards.filter(c => c.name === targetName)
    .reduce((total, c) => total + c.count, 0);
  const rows = audit(manifest.decks, basicIndex);
  const ownBasics = rows.find(row => row.rank === candidateRank).basicCount;
  return rows.map(row => ({
    rank: row.rank,
    archetype: row.archetype,
    opponentBasics: row.basicCount,
    ...targetAccess(row.basicCount, ownBasics, targetCopies),
  }));
}

/** @param {ReturnType<typeof fieldAccess>} rows @returns {string} */
function toMarkdown(rows) {
  const thorns = rows.find(row => row.opponentBasics === 4);
  const lines = [
    '# Aichi 2026: optional mulligan bonus cards and opening access',
    '',
    '**Source:** [29 published ranked 60-card lists](full-decklists.json);',
    'Basic counts come from the English card-stage snapshot via',
    '[aichi_opening_audit.cjs](../../scripts/aichi_opening_audit.cjs).',
    'Unpublished placements 23, 25, and 28 cannot be evaluated exactly.',
    '',
    '**Model:** Two players independently draw seven until each has a legal',
    'Basic starter. Simultaneous mulligans provide no optional bonus cards.',
    'Once the candidate has a valid hand, each opponent mulligan provides',
    'one optional extra card. Both players set six random Prize cards, and',
    'the candidate elects to draw **all** bonus cards offered, up to the',
    '47 remaining cards. The reported event is having at least one of the',
    'three Shadow Rider Calyrex V in the accepted starting hand or these',
    'additional draws. Card presence is not equivalent to playing it,',
    'successfully evolving, attacking, or winning.',
    '',
    '## Iron Thorns consequence',
    '',
    'Each published Iron Thorns deck has four Basics. Against that opening',
    'profile the rank-1 candidate receives at least one extra-draw offer',
    'with probability **' + (thorns.bonusOne * 100).toFixed(4) + '%**,',
    'and at least three with **' + (thorns.bonusThree * 100).toFixed(4) + '%**.',
    'The target-access chance rises from **' +
      (thorns.opening * 100).toFixed(4) + '%** to **' +
      (thorns.withAllBonuses * 100).toFixed(4) + '%**',
    '(+' + (thorns.improvement * 100).toFixed(4) + ' percentage points).',
    'This is an opening-card access measurement only.',
    '',
    '## By published placement',
    '',
    '| Rank | Archetype | Opponent Basics | P(at least one bonus offered) | Expected bonus offers | P(target initially) | P(target including all bonuses) |',
    '| ---: | --- | ---: | ---: | ---: | ---: | ---: |',
  ];
  for (const row of rows) {
    lines.push('| ' + row.rank + ' | ' + row.archetype + ' | ' +
      row.opponentBasics + ' | ' +
      (row.bonusOne * 100).toFixed(3) + '% | ' +
      row.expectedOffers.toFixed(3) + ' | ' +
      (row.opening * 100).toFixed(3) + '% | ' +
      (row.withAllBonuses * 100).toFixed(3) + '% |');
  }
  lines.push(
    '',
    '## Exact calculation',
    '',
    'Write pA and pB for the independent seven-card mulligan probabilities.',
    'If K is the number of bonus opportunities awarded to player B:',
    '',
    '- P(K = 0) = (1 - pA) / (1 - pA pB).',
    '- P(K = k) = (1 - pA)(1 - pB) pA^k / (1 - pA pB), for k >= 1.',
    '- P(K >= k) = (1 - pB) pA^k / (1 - pA pB), for k >= 1.',
    '',
    'If B contains b Basics, including t target Basics, the chance of',
    'missing all targets in a valid seven-card hand is',
    '[C(60-t,7)-C(60-b,7)]/[C(60,7)-C(60-b,7)].',
    'Conditional on that miss, after taking k bonus cards the probability',
    'of still missing is C(53-t,k)/C(53,k). Average over K, capping actual',
    'bonus draws at 47 and summing the remaining geometric tail exactly.',
    '',
    '## Limitations and reproducibility',
    '',
    'The optional bonuses may be declined strategically. The model ignores',
    'opponent deck choices beyond Basic count, opening hand selection,',
    'gameplay, mid-turn search, and engine policy. Prize cards are random',
    'and inaccessible when bonus draws occur; the sampling equation',
    'integrates over their random identities. Very large bonus draw counts',
    'can leave too few cards for later gameplay. No matchup win probability',
    'or 99.5% attainment is implied.',
    '',
    'Reproduce with [aichi_bonus_draws.cjs](../../scripts/aichi_bonus_draws.cjs)',
    'and validate with [aichi_bonus_draws.test.cjs](../../tests/aichi_bonus_draws.test.cjs).',
    ''
  );
  return lines.join('\n');
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const manifest = JSON.parse(fs.readFileSync(
    path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const basicIndex = loadBasicIndex(path.join(root, 'resources/cards/en'));
  process.stdout.write(toMarkdown(fieldAccess(manifest, basicIndex)) + '\n');
}

module.exports = {
  bonusExactly, bonusAtLeast, targetAccess, fieldAccess, toMarkdown,
};
