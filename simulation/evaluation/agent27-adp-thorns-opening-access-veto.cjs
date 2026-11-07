'use strict';

const assert = require('node:assert/strict');
const {FULL60, PROFILES} =
  require('./agent27-adp-original29-four-bonus-bounds.cjs');
const {exactBonusMultiplicity} =
  require('./agent1-original-field-mulligan-bonus.cjs');
const originals = require('../../results/aichi-2026/full-decklists.json');

const CANDIDATE_BASIC_COUNT = 7;
const MAX_EXACT_BONUS = 4;

/**
 * Identify exact source compositions that necessarily start with Active
 * Iron Thorns ex TWM 77 after a Basic-valid setup. Do not infer a complete
 * opponent game strategy or an ability-lock state after later interactions.
 * @param {object} deck Authenticated original Aichi card-name/count list.
 * @returns {boolean}
 */
function forcedOpeningIronThorns(deck) {
  const pokemon = deck.cards.filter(card => card.category === 'Pokémon');
  return pokemon.length === 1 &&
    pokemon[0].name === 'Iron Thorns ex' &&
    pokemon[0].count === 4 &&
    pokemon[0].printing?.set === 'TWM' &&
    String(pokemon[0].printing?.number) === '77';
}

/**
 * Source-independent mathematical first-own-turn bound under an additional
 * matchup stipulation: no effect has removed the opponent's Initialization.
 * With Active Iron Thorns, the candidate's Tapu Lele-GX Wonder Tag route is
 * unavailable. Uses previously independently verified 0..4 bonus BigInts.
 * All optional bonus draws are assumed accepted and all six Prizes remain
 * inaccessible; no game win rate or native Store acceptance is inferred.
 *
 * @param {number} opponentBasics Verified opponent starting Basic count.
 * @returns {object}
 */
function noWonderTagOpeningBounds(opponentBasics) {
  const exposure = exactBonusMultiplicity(
    CANDIDATE_BASIC_COUNT, opponentBasics, MAX_EXACT_BONUS);
  const mass = exposure.candidateOffered.map(row => row.probability);
  const tail = exposure.candidateOfferTail;
  const weights = [1 - tail - mass.reduce((s, x) => s + x, 0), ...mass];
  assert.equal(weights.length, FULL60.length);
  assert.ok(weights.every(x => x >= 0 && x <= 1));
  assert.ok(Math.abs(weights.reduce((s, x) => s + x, tail) - 1) < 1e-12);

  const axes = Object.fromEntries(PROFILES.map(profile => {
    const rates = FULL60.map(row =>
      Number(row[profile]) / Number(row.denominator));
    for (let i = 1; i < rates.length; i++) {
      assert.ok(rates[i] >= rates[i-1], 'More bonus cards cannot remove an opening line');
    }
    const known = weights.reduce((sum, probability, index) =>
      sum + probability * rates[index], 0);
    return [profile, {
      lower: known + tail * rates[MAX_EXACT_BONUS],
      upper: known + tail,
      exactZeroThroughFour: known,
      fivePlusRateLower: rates[MAX_EXACT_BONUS]
    }];
  }));
  return {candidateBasics: CANDIDATE_BASIC_COUNT, opponentBasics,
    exactBonusMasses: weights, tailFivePlus: tail, axes,
    qualifyingEvidence: 'mathematical first-own-turn resource screen only',
    competitiveGamesQualified: 0};
}

/**
 * @returns {object} Exactly source-authenticated, necessarily Active Thorns.
 */
function main() {
  assert.equal(originals.decks.length, 29);
  const matching = originals.decks.filter(forcedOpeningIronThorns);
  assert.deepEqual(matching.map(row => row.rank), [6, 24, 29]);
  const bounds = noWonderTagOpeningBounds(4);
  return {sourceRanks: matching.map(row => row.rank),
    noWonderTagAtOpeningWhileInitializationActive: true,
    opponentSourceEvidence: '4 Iron Thorns ex TWM77, no other Pokemon',
    excludedException: 'Any later effect actually removing Initialization must be separately checked',
    candidateDeck: 'ADP-Thorton-Regidrago v2 fixed 60',
    ...bounds};
}

module.exports = {CANDIDATE_BASIC_COUNT, MAX_EXACT_BONUS,
  forcedOpeningIronThorns, noWonderTagOpeningBounds, main};
if (require.main === module) console.log(JSON.stringify(main(), null, 2));
