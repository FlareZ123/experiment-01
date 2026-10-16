'use strict';

/**
 * Isolated fully-powered duel using printed Max Cure and Claw of Darkness.
 * Both Pokemon start at full HP. No switches, status or hand disruption.
 * @param {{guard: boolean, muscleBand: boolean, absolFirst: boolean}} input
 */
function duel(input) {
  let gardevoirDamage = 0;
  let absolDamage = 0;
  const order = input.absolFirst ? ['Absol', 'Gardevoir'] : ['Gardevoir', 'Absol'];
  const trace = [];
  for (let turn = 0; turn < 10; turn++) {
    const attacker = order[turn % 2];
    if (attacker === 'Absol') {
      const damage = 200 + (input.muscleBand ? 20 : 0) - (input.guard ? 20 : 0);
      gardevoirDamage += damage;
      trace.push({ attacker, gardevoirDamage, absolDamage });
      if (gardevoirDamage >= 320) return { winner: attacker, trace };
    } else {
      absolDamage += 180;
      gardevoirDamage = Math.max(0, gardevoirDamage - 50);
      trace.push({ attacker, gardevoirDamage, absolDamage });
      if (absolDamage >= 280) return { winner: attacker, trace };
    }
  }
  throw Error('Duel did not terminate');
}

module.exports = { duel };
