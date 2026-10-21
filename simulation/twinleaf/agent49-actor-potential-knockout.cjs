'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent49-public-printed-potential-ko-v1';

/** @param {object} view Public actor observation. @param {object[]} affordable Affordable printed attacks. @returns {object} */
function choosePotentialKnockout(view, affordable) {
  assert.ok(Array.isArray(affordable) && affordable.length > 0);
  const first = affordable[0];
  const opponent = view.opponentPublic?.active;
  if (first.gxAttack === true || !opponent || !Number.isSafeInteger(opponent.hp) ||
      !Number.isSafeInteger(opponent.damage)) return first;
  const hpLeft = opponent.hp - opponent.damage;
  if (hpLeft <= 0) return first;
  return affordable.find(attack =>
    attack.gxAttack !== true && Number.isSafeInteger(attack.damage) &&
    attack.damage > 0 &&
    (attack.damageCalculation === null || attack.damageCalculation === undefined) &&
    attack.damage >= hpLeft) ?? first;
}

module.exports = { VERSION, choosePotentialKnockout };
