'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent49-public-printed-potential-ko-v3-type-adjusted';

/**
 * Estimate fixed printed damage after public printed Weakness and Resistance.
 * This is a potential knockout estimate; live damage modifiers, prevention,
 * Ability suppression and attack effects still require native Store resolution.
 * Unknown modifier shapes cause abstention rather than an assumed knockout.
 *
 * @param {number} damage Printed fixed attack damage.
 * @param {object} attacker Detached public attacker.
 * @param {object} defender Detached public defending Pokémon.
 * @returns {number|null} Nominal type-adjusted damage or unknown.
 */
function typeAdjustedFixedDamage(damage, attacker, defender) {
  if (!Number.isSafeInteger(damage) || damage <= 0) return null;
  const sourceTypes = attacker?.printed?.types;
  const target = defender?.printed;

  // Retain existing behavior for minimal legacy observations with no
  // printed-type metadata on either Pokémon. Actual Store observations
  // include public types, Weakness and Resistance.
  if (sourceTypes === undefined && target === undefined) return damage;
  if (!Array.isArray(sourceTypes) || sourceTypes.length === 0 ||
      !Array.isArray(target?.weakness) ||
      !Array.isArray(target?.resistance)) return null;

  const weakness = target.weakness.filter(row => sourceTypes.includes(row.type));
  const resistance = target.resistance.filter(row => sourceTypes.includes(row.type));
  if (weakness.length > 1 || resistance.length > 1) return null;
  let result = damage;
  if (weakness.length === 1) {
    // The pinned Weakness type omits value for the ordinary ×2 rule.
    // The detached actor observation normalizes that undefined to null.
    const multiplier = weakness[0].value ?? 2;
    if (multiplier !== 1 && multiplier !== 2) return null;
    result *= multiplier;
  }
  if (resistance.length === 1) {
    const reduction = resistance[0].value;
    if (!Number.isSafeInteger(reduction) || reduction > 0) return null;
    result = Math.max(0, result + reduction);
  }
  return result;
}

/**
 * Rank payable printed attacks using only an authenticated actor observation.
 * Preserve the first candidate whenever a nonnumeric or special-effect
 * attack has unmodeled decisive tactical value. Reuse the established narrow
 * printing-locked proof when public facts make such a leading attack dead.
 * A type-adjusted threshold is a potential knockout, not an actual outcome.
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
    attack.gxAttack !== true &&
    (attack.damageCalculation === null || attack.damageCalculation === undefined) &&
    (typeAdjustedFixedDamage(attack.damage, view.ownPublic?.active, opponent) ?? 0)
      >= hpLeft) ?? first;
}

module.exports = { VERSION, typeAdjustedFixedDamage, choosePotentialKnockout };
