'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent49-public-printed-potential-ko-v2-discrete-safe';

/**
 * Rank payable printed attacks using only an authenticated actor observation.
 * Preserve the first candidate whenever a nonnumeric or special-effect
 * attack has unmodeled decisive tactical value. Reuse the established narrow
 * printing-locked proof when public facts make such a leading attack dead.
 * An observed fixed-damage threshold remains only a potential knockout.
 *
 * @param {object} view Detached own-player observation.
 * @param {object[]} affordable Ordered, already-cost-checked printed attacks.
 * @returns {object} A member of the original affordable array.
 */
function choosePotentialKnockout(view, affordable) {
  assert.ok(Array.isArray(affordable) && affordable.length > 0);
  const first = affordable[0];
  const opponent = view.opponentPublic?.active;
  if (first.gxAttack === true || !opponent ||
      !Number.isSafeInteger(opponent.hp) ||
      !Number.isSafeInteger(opponent.damage)) return first;
  const hpLeft = opponent.hp - opponent.damage;
  if (hpLeft <= 0) return first;

  if (!Number.isSafeInteger(first.damage) || first.damage <= 0 ||
      (first.damageCalculation !== null &&
       first.damageCalculation !== undefined)) {
    const proof = require('./agent1-actor-dead-first-attack-frontier.cjs')
      .chooseKnownDeadLeadingAttack(view, affordable);
    return affordable.find(attack => attack.name === proof?.attackName) ?? first;
  }

  return affordable.find(attack =>
    attack.gxAttack !== true && Number.isSafeInteger(attack.damage) &&
    attack.damage > 0 &&
    (attack.damageCalculation === null || attack.damageCalculation === undefined) &&
    attack.damage >= hpLeft) ?? first;
}

module.exports = { VERSION, choosePotentialKnockout };
