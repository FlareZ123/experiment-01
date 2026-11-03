'use strict';

const assert = require('node:assert/strict');

const POLICY_VERSION = 'agent8-public-flat-copy-turns-v1';

/**
 * A reproducible comparison of *nominal printed* flat damage only. This is a
 * deliberate, opt-in heuristic, not an estimate of final attack damage:
 * Weakness, Resistance, Abilities, Tools, defensive effects and attack text
 * may change the actual payoff. The real Store must validate every choice.
 *
 * @param {object} input Detached owner-only ChooseAttackPrompt observation.
 * @param {{sourceIndex:number,attackIndex:number}} selected Existing choice.
 * @returns {{sourceIndex:number,attackIndex:number}|null} Strict upgrade or null.
 */
function preferFasterNominalCopy(input, selected) {
  assert.equal(input.actor.decisionKind, 'owner-prompt');
  assert.equal(input.prompt.kind, 'ChooseAttackPrompt');
  const defender = input.actor.opponentPublic?.active;
  if (!Number.isSafeInteger(defender?.hp) ||
      !Number.isSafeInteger(defender?.damage)) return null;
  const remainingHp = defender.hp - defender.damage;
  if (remainingHp <= 0) return null;
  const restrictions = input.actor.ownPublic?.publicTurnRestrictions;
  const gxUnavailable = restrictions?.gxUsed === true ||
    restrictions?.cannotUseGXAttacks === true;
  const eligible = [];
  for (const source of input.prompt.offered) {
    for (const attack of source.attacks) {
      const gx = attack.gxAttack === true ||
        (typeof attack.name === 'string' && attack.name.endsWith('-GX'));
      const numericDamage = typeof attack.damage === 'number' ? attack.damage :
        (typeof attack.damage === 'string' && /^\d+$/.test(attack.damage)
          ? Number(attack.damage) : null);
      if (attack.blocked || (gx && gxUnavailable) ||
          attack.damageCalculation != null ||
          !Number.isSafeInteger(numericDamage) || numericDamage <= 0) continue;
      eligible.push({sourceIndex:source.index, attackIndex:attack.index,
        printedDamage:numericDamage,
        nominalHits:Math.ceil(remainingHp / numericDamage)});
    }
  }
  const baseline = eligible.find(x => x.sourceIndex === selected.sourceIndex &&
    x.attackIndex === selected.attackIndex);
  if (!baseline) return null;
  const improvements = eligible.filter(x =>
    x.nominalHits < baseline.nominalHits &&
    x.printedDamage >= baseline.printedDamage + 60);
  if (improvements.length === 0) return null;
  improvements.sort((a,b) => a.nominalHits-b.nominalHits ||
    b.printedDamage-a.printedDamage || a.sourceIndex-b.sourceIndex ||
    a.attackIndex-b.attackIndex);
  return {sourceIndex:improvements[0].sourceIndex,
    attackIndex:improvements[0].attackIndex};
}

module.exports = {POLICY_VERSION, preferFasterNominalCopy};
