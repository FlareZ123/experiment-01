'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {audit, loadBasicIndex} = require('./aichi_opening_audit.cjs');
const {soloAfterBonus} = require('./aichi_solo_start.cjs');

/**
 * An equal-weight N-placement target T allows at most N(1-T) rank-specific
 * loss probability, even assuming every other placement is a guaranteed win.
 * The conditional game-loss probability q on a measured setup event with
 * probability p must obey p*q <= budget. This is only a necessary condition.
 *
 * @param {number} eventProbability Probability of the modeled setup event.
 * @param {number} targetWinRate Required equal-placement win fraction.
 * @param {number} fieldSize Number of equally weighted placements.
 */
function conditionalRankLossBudget(eventProbability, targetWinRate, fieldSize) {
  if (!(eventProbability > 0 && eventProbability <= 1) ||
      !(targetWinRate > 0 && targetWinRate <= 1) ||
      !Number.isInteger(fieldSize) || fieldSize < 1) {
    throw new RangeError('Invalid conditional budget inputs');
  }
  const rankLossBudget = fieldSize * (1 - targetWinRate);
  return {
    rankLossBudget,
    maximalConditionalEventLoss: Math.min(1, rankLossBudget / eventProbability),
    binding: rankLossBudget < eventProbability,
  };
}

/**
 * Compute the event-specific necessary condition from the same physical
 * bonus-draw model and exact candidate inventories used in prior opening
 * research. Wobbuffet PHF 36 is the sole intrinsic printed defender in these
 * three candidate lists; other defender types need separate classification.
 *
 * @param {object} candidate Printing-aware 60-card candidate.
 * @param {Map<string,boolean|null>} basicIndex Bundled card-stage index.
 * @param {number} opponentBasics Published rank-26 Basic count.
 * @returns {object}
 */
function candidateDonkBudget(candidate, basicIndex, opponentBasics) {
  const [row] = audit([candidate], basicIndex);
  const protectedBasics = candidate.cards
    .filter(card => card.category === 'Pokémon' &&
      card.name === 'Wobbuffet' &&
      card.printing?.set === 'PHF' &&
      String(card.printing?.number) === '36')
    .reduce((sum, card) => sum + card.count, 0);
  const solo = soloAfterBonus(row.basicCount, opponentBasics);
  const exposed = solo * (row.basicCount - protectedBasics) / row.basicCount;
  const condition = conditionalRankLossBudget(exposed, 0.995, 32);
  return {
    candidate: candidate.label || candidate.archetype,
    basicCount: row.basicCount,
    protectedWobbuffetCopies: protectedBasics,
    soloAfterAllBonuses: solo,
    modeledUnprotectedSoloExposure: exposed,
    ...condition
  };
}

function buildSourceDonkBudgets(root) {
  const filename = path.join(root, 'results/aichi-2026/full-decklists.json');
  const source = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const rank1 = source.decks.find(deck => deck.rank === 1);
  const rank26 = source.decks.find(deck => deck.rank === 26);
  if (!rank1 || !rank26 || source.decks.length !== 29) {
    throw new Error('Expected original 29 published Aichi source lists');
  }
  const basicIndex = loadBasicIndex(path.join(root, 'resources/cards/en'));
  const [opponent] = audit([rank26], basicIndex);
  const candidates = [
    {...rank1, label: 'champion-reference'},
    JSON.parse(fs.readFileSync(path.join(root, 'results/aichi-2026/candidate-hood-shadow-rider.json'), 'utf8')),
    JSON.parse(fs.readFileSync(path.join(root, 'results/aichi-2026/candidate-temple-shadow-rider.json'), 'utf8'))
  ];
  return {
    kind: 'source-locked-conditional-rank26-loss-budget-v1',
    targetFieldMean: 0.995,
    fieldSize: 32,
    opponentRank: 26,
    opponentBasicCount: opponent.basicCount,
    candidates: candidates.map(candidate => candidateDonkBudget(
      candidate, basicIndex, opponent.basicCount
    )),
    caveat: 'This is a necessary conditional bound on one exact setup event under an equal-rank scoring convention, not a measurement of any game win or combo-completion probability.'
  };
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  process.stdout.write(JSON.stringify(buildSourceDonkBudgets(root), null, 2) + '\n');
}

module.exports = {conditionalRankLossBudget, candidateDonkBudget, buildSourceDonkBudgets};
