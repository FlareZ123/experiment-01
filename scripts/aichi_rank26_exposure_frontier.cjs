'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {audit, loadBasicIndex} = require('./aichi_opening_audit.cjs');
const {soloAfterBonus} = require('./aichi_solo_start.cjs');
const {conditionalRankLossBudget} = require('./aichi_rank26_loss_budget.cjs');

/**
 * All protected slots are hypothetical guaranteed shields against exactly
 * the named first-turn Meloetta attack. Real Ability defenses may be turned
 * off by Canceling Cologne and cannot automatically count as guarantees.
 * @param {number} basicCopies
 * @param {number} protectionCopies
 * @param {number} attackerBasics
 * @param {number} fieldRankLossBudget
 */
function exposureForComposition(basicCopies, protectionCopies, attackerBasics,
  fieldRankLossBudget) {
  if (!Number.isInteger(basicCopies) || basicCopies < 1 || basicCopies > 53 ||
      !Number.isInteger(protectionCopies) || protectionCopies < 0 ||
      protectionCopies > basicCopies ||
      !Number.isInteger(attackerBasics) || attackerBasics < 1 ||
      attackerBasics > 53 ||
      !(fieldRankLossBudget > 0 && fieldRankLossBudget < 1)) {
    throw new RangeError('Composition must specify valid Basic and protection counts');
  }
  const lone = soloAfterBonus(basicCopies, attackerBasics);
  const event = lone * (basicCopies - protectionCopies) / basicCopies;
  return {
    basicCopies, hypotheticalGuaranteedProtectedBasics: protectionCopies,
    soloAfterBonuses: lone, modeledUnprotectedSoloEvent: event,
    extremeConditionalDonkLossScenarioWithinRankBudget:
      event <= fieldRankLossBudget
  };
}

/**
 * Minimal b in [minimumBasics,maxBasics] such that q=1 losses in modeled E
 * cannot independently exceed the entire equal-weight one-rank loss budget.
 * This does not assess any actual attacker conditional q or other losses.
 * @param {object} options
 */
function minimalBasicCountForOneEvent(options) {
  const {protectedCopies, attackerBasics, fieldRankLossBudget,
    minimumBasics = 1, maxBasics = 53} = options;
  if (!Number.isInteger(protectedCopies) || protectedCopies < 0 ||
      !Number.isInteger(minimumBasics) || minimumBasics < 1 ||
      !Number.isInteger(maxBasics) || maxBasics < minimumBasics ||
      maxBasics > 53) {
    throw new RangeError('Invalid Basic-count search bounds');
  }
  for (let basics = Math.max(protectedCopies, minimumBasics); basics <= maxBasics;
    basics++) {
    const point = exposureForComposition(
      basics, protectedCopies, attackerBasics, fieldRankLossBudget
    );
    if (point.extremeConditionalDonkLossScenarioWithinRankBudget) return point;
  }
  return null;
}

function buildRank26Frontier(root) {
  const published = JSON.parse(fs.readFileSync(path.join(
    root, 'results/aichi-2026/full-decklists.json'), 'utf8'
  ));
  const rank26 = published.decks.find(row => row.rank === 26);
  if (!rank26 || published.decks.length !== 29) {
    throw new Error('Expected all 29 source 60-card lists including Meloetta rank26');
  }
  const basicIndex = loadBasicIndex(path.join(root, 'resources/cards/en'));
  const [opponent] = audit([rank26], basicIndex);
  const budget = conditionalRankLossBudget(0.5, 0.995, 32).rankLossBudget;
  const byProtectionCopies = [0, 1, 2, 3, 4].map(protectedCopies => {
    const crossing = minimalBasicCountForOneEvent({
      protectedCopies, attackerBasics: opponent.basicCount,
      fieldRankLossBudget: budget,
      minimumBasics: 14, maxBasics: 30
    });
    return {hypotheticalGuaranteedProtectedBasics: protectedCopies,
      threshold: crossing};
  });
  return {
    kind: 'aichi-rank26-hypothetical-structural-exposure-frontier-v1',
    sourceOpponentRank: 26, sourceOpponentBasics: opponent.basicCount,
    equalRankTarget: 0.995, totalRanks: 32,
    allowedSingleRankLoss: budget,
    noProtected14To22: Array.from({length: 9}, (_, i) =>
      exposureForComposition(14 + i, 0, opponent.basicCount, budget)),
    byProtectionCopies,
    warning: 'This is a mathematical count threshold under the scenario all E openings lose, and protection copies are hypothetically guaranteed. Actual Meloetta combo q and counters remain unmeasured; no deck swap or win estimate is justified.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(
    buildRank26Frontier(path.resolve(__dirname, '..')), null, 2
  ) + '\n');
}
module.exports = {
  exposureForComposition, minimalBasicCountForOneEvent, buildRank26Frontier
};
