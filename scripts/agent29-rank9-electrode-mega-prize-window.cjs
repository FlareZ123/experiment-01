'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { choose, fraction, basicCountFromPrintedDeck } =
  require('./aichi-rank15-dual-lock-prize-ceiling.cjs');

const ROLES = Object.freeze({
  voltorb: 1, megaAbsol: 1, electrode: 2, energy: 7,
  otherBasics: 9, otherNonBasics: 40
});

/**
 * Exactly count physical rank-9 CES48 -> MEG86 line prerequisites outside
 * the six face-down Prizes, conditional on a Basic-valid initial seven.
 * Five of seven Energy cards must remain accessible without Prize recovery.
 * This gives a necessary-resource ceiling, never a probability of executing
 * the line, completing its native attack or winning a game.
 *
 * @param {{voltorb:number,megaAbsol:number,electrode:number,energy:number,otherBasics:number,otherNonBasics:number}} [roleCounts]
 */
function prizeWindow(roleCounts = ROLES) {
  const counts = [
    roleCounts.voltorb, roleCounts.megaAbsol, roleCounts.electrode,
    roleCounts.energy, roleCounts.otherBasics, roleCounts.otherNonBasics
  ];
  assert.equal(counts.reduce((sum, value) => sum + value, 0), 60);
  assert.ok(counts.every(value => Number.isInteger(value) && value >= 0));
  const totalBasics = counts[0] + counts[1] + counts[4];
  assert.equal(totalBasics, 11);
  const sevenWays = choose(54, 7);
  let allPrizeStates = 0n;
  let basicValidWeight = 0n;
  let resourceValidWeight = 0n;

  /**
   * @param {number} i
   * @param {number[]} picked
   * @param {number} totalPicked
   * @param {bigint} combinations
   */
  function enumerate(i, picked, totalPicked, combinations) {
    if (i === counts.length) {
      if (totalPicked !== 6) return;
      allPrizeStates += combinations;
      const remainingBasics = totalBasics - picked[0] - picked[1] - picked[4];
      const legalSevens = sevenWays - choose(54 - remainingBasics, 7);
      const weight = combinations * legalSevens;
      basicValidWeight += weight;
      if (picked[0] < counts[0] && picked[1] < counts[1] &&
          picked[2] < counts[2] && counts[3] - picked[3] >= 5) {
        resourceValidWeight += weight;
      }
      return;
    }
    for (let q = 0; q <= Math.min(counts[i], 6 - totalPicked); q++) {
      enumerate(i + 1, [...picked, q], totalPicked + q,
        combinations * choose(counts[i], q));
    }
  }

  enumerate(0, [], 0, 1n);
  assert.equal(allPrizeStates, choose(60, 6));
  assert.ok(basicValidWeight > 0n);
  return {
    model: 'rank9-CES48-MEG86-necessary-unprized-resources-v1',
    printedBasicCount: totalBasics,
    printedRoleCounts: { ...roleCounts },
    legalFirstSeven: fraction(basicValidWeight,
      choose(60, 6) * sevenWays),
    prerequisiteAvailabilityGivenLegalFirstSeven:
      fraction(resourceValidWeight, basicValidWeight),
    prerequisiteAvailabilityUnconditionalFirstSeven:
      fraction(resourceValidWeight, choose(60, 6) * sevenWays),
    requiresFiveEnergyActuallyInDiscard: true,
    countsPrizeRecovery: false,
    countsEvolutionOrTiming: false,
    countsAnyNativeOrCompetitiveGame: false
  };
}

/** Source-bind every necessary role to the printed Aichi rank-9 60. */
function rank9FromSource(root = path.resolve(__dirname, '..')) {
  const file = path.join(root, 'results/aichi-2026/full-decklists.json');
  const field = JSON.parse(fs.readFileSync(file, 'utf8'));
  const deck = field.decks.find(item => item.rank === 9);
  assert.ok(deck && deck.cards.reduce((sum, row) => sum + row.count, 0) === 60);
  const count = (name, set) => deck.cards
    .filter(row => row.name === name && row.printing.set === set)
    .reduce((sum, row) => sum + row.count, 0);
  assert.equal(count('Voltorb', 'ROS'), 1);
  assert.equal(count('Mega Absol ex', 'MEG'), 1);
  assert.equal(count('Electrode-GX', 'CES'), 2);
  const energy = deck.cards.filter(row => row.category === 'Energy')
    .reduce((sum, row) => sum + row.count, 0);
  assert.equal(energy, 7);
  assert.equal(count('Prism Energy', 'ASC'), 4);
  const basics = basicCountFromPrintedDeck(deck, root);
  assert.equal(basics, 11);
  return {sourceRank: 9, sourcePlayer: deck.player,
    sourceArchetype: deck.archetype, ...prizeWindow()};
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(rank9FromSource(), null, 2) + '\n');
}

module.exports = {ROLES, prizeWindow, rank9FromSource};
