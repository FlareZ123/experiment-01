'use strict';

const {choose} = require('./hood-t2-joint.cjs');
const {openingLocations} = require('./agent6-copycat-opening-locations.cjs');

/**
 * Probability the original Mimikyu/Dialga/Heavy Ball Prize-capacity cut
 * survives after k uniformly selected, initially face-down Prize awards.
 * Models card location only; assumes no Prize exchange, peeking, alternate
 * retrieval or differential selection by the player.
 *
 * @param {{basicCount?: number}} [options]
 * @returns {object} Seven-entry profile for 0 through 6 Prizes taken.
 */
function prizeRecoveryProfile(options = {}) {
  const loc = openingLocations(options);
  const initialCut = loc.immediatePrizeOnlyCut;
  const allThree = loc.states.find(s => s.mimikyu === 'prizes' &&
    s.dialga === 'prizes' && s.heavyBall === 'prizes').probability;
  const profile = [];
  for (let k = 0; k <= 6; k += 1) {
    const denominator = choose(6, k);
    // Two initial marked Prizes both have to remain face-down.
    const pairCutSurvival = choose(4, k) / denominator;
    // Three initially marked Prizes: either 0 or 1 has been taken.
    const tripleCutSurvival = (choose(3, k) + 3 * choose(3, k - 1)) / denominator;
    const cutSurvival = (initialCut - allThree) * pairCutSurvival +
      allThree * tripleCutSurvival;
    profile.push({prizesTaken: k, prizesRemaining: 6 - k,
      cutSurvivalProbability: cutSurvival,
      survivalGivenInitialCut: cutSurvival / initialCut,
      clearedGivenInitialCut: 1 - cutSurvival / initialCut});
  }
  return {basicCount: loc.basicCount, initialCut, allThreePrized: allThree, profile};
}

module.exports = {prizeRecoveryProfile};
