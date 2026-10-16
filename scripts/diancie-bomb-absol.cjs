'use strict';

/** @param {{garbotoxin: boolean, muscleBand: boolean, giantBomb: boolean}} state */
function diancieVsAbsol(state) {
  const reduction = state.garbotoxin ? 0 : 30;
  const incoming = 200 + (state.muscleBand ? 20 : 0) - reduction;
  const bombCounters = state.giantBomb && incoming >= 180 ? 100 : 0;
  const garlandRay = 240;
  return {
    incoming,
    diamondCoatActive: !state.garbotoxin,
    diancieSurvivesAttack: incoming < 270,
    bombCounters,
    combinedDamage: bombCounters + garlandRay,
    megaAbsolKnockedOut: bombCounters + garlandRay >= 280
  };
}

module.exports = { diancieVsAbsol };
