'use strict';

const assert = require('node:assert/strict');
const {chooseActorHandDiscard} = require('./agent47-actor-hand-discard.cjs');

const VERSION = 'agent47-owner-immediate-attack-fuel-v1';
const DCE = 'Double Colorless Energy SUM';

/**
 * Return known Energy units under public attached-card and Stadium context.
 * Unknown Special Energy deliberately excludes the entire comparison.
 * @param {string} printing Exact Energy printing.
 * @param {object} catalog Public card catalog (no owner private-zone access).
 * @param {boolean} temple True while Temple of Sinnoh is in play.
 * @returns {number[]|null} Exact known contribution or null.
 */
function energyUnits(printing, catalog, temple) {
  if (catalog.basicEnergies?.has(printing)) {
    for (const [name, type] of Object.entries(catalog.basicEnergyTypes ?? {})) {
      if (printing.startsWith(name + ' Energy ')) return [type];
    }
    return null;
  }
  if (printing === DCE) {
    const c = catalog.colorlessEnergyType;
    return Number.isInteger(c) ? (temple ? [c] : [c, c]) : null;
  }
  return null;
}

/**
 * Printed attack-cost accounting; each energy unit can satisfy one symbol.
 * @param {number[]} cost Printed Energy cost.
 * @param {number[]} provided Known Energy units.
 * @param {number} colorless Native CardType.COLORLESS enum.
 * @returns {boolean}
 */
function paysPrintedCost(cost, provided, colorless) {
  const remaining = provided.slice();
  for (const requirement of cost) {
    if (requirement === colorless) continue;
    const i = remaining.indexOf(requirement);
    if (i < 0) return false;
    remaining.splice(i, 1);
  }
  return remaining.length >= cost.filter(x => x === colorless).length;
}

/**
 * Compare actual Store-validated owner hand-discard bundles with the owner's
 * current Active attack and single remaining manual attachment. Intervene
 * ONLY when the generic selection destroys every currently playable one-card
 * attack-funding option and another legal bundle preserves at least one.
 * No deck/Prize/hidden-opponent information or speculative search links.
 *
 * @param {{actor:object,prompt:{menu:string[][]}}} input Detached prompt.
 * @param {object} catalog Public printed card metadata and enums.
 * @returns {{version:string,reason:string,baseline:string[],proposal:string[],changed:boolean}}
 */
function proposeAttackFuelDiscard(input, catalog) {
  assert.equal(input?.actor?.decisionKind, 'owner-prompt');
  assert.ok(Array.isArray(input.prompt?.menu) && input.prompt.menu.length > 0);
  const baseline = chooseActorHandDiscard(input).printings;
  const receipt = (reason, proposal = baseline) => ({
    version:VERSION, reason, baseline:[...baseline], proposal:[...proposal],
    changed:JSON.stringify(proposal) !== JSON.stringify(baseline)
  });
  const actor = input.actor;
  const own = actor.ownPublic;
  const active = own?.active;
  const resources = actor.ownTurnResources;
  if (!active || !resources || !catalog?.basicEnergies ||
      !Number.isInteger(catalog.colorlessEnergyType) ||
      !Array.isArray(actor.ownHand) || !Array.isArray(active.attacks) ||
      !Array.isArray(active.energies) || actor.globalTurn === 1 ||
      resources.energyPlayedTurn === actor.globalTurn ||
      resources.energyPlayLocked === true ||
      own.publicTurnRestrictions?.specialEnergyPlayLocked === true ||
      own.publicTurnRestrictions?.attackLockTurnsRemaining > 0 ||
      active.publicRestrictions?.cannotAttackNextTurn === true ||
      active.specialConditions?.some(s => s === catalog.specialConditions?.ASLEEP ||
          s === catalog.specialConditions?.PARALYZED)) {
    return receipt('immediate-attack-frontier-not-applicable');
  }
  const temple = [...(own.stadium ?? []), ...(actor.opponentPublic?.stadium ?? [])]
    .some(name => name.startsWith('Temple of Sinnoh '));
  const attached = [];
  for (const printing of active.energies) {
    const units = energyUnits(printing, catalog, temple);
    if (!units) return receipt('unknown-attached-energy-or-provision');
    attached.push(...units);
  }
  const colorless = catalog.colorlessEnergyType;
  const attacks = active.attacks.filter(attack => {
    if (!Array.isArray(attack.cost) || attack.cost.length === 0 ||
        attack.gxAttack === true && own.publicTurnRestrictions?.gxUsed === true ||
        active.publicRestrictions?.blockedAttackNameNextTurn === attack.name ||
        active.publicRestrictions?.blockedAttackNameUntilLeavesActive === attack.name ||
        active.publicRestrictions?.cannotUseAttacksNextTurn?.includes(attack.name) ||
        active.publicRestrictions?.onlyAllowedAttackNameNextTurn &&
          active.publicRestrictions.onlyAllowedAttackNameNextTurn !== attack.name) return false;
    return !paysPrintedCost(attack.cost, attached, colorless);
  });
  if (attacks.length === 0) return receipt('no-unfunded-available-printed-attack');
  const candidateFuel = new Set(actor.ownHand.filter(printing => {
    const units = energyUnits(printing, catalog, temple);
    return units && attacks.some(attack => paysPrintedCost(
      attack.cost, [...attached, ...units], colorless));
  }));
  if (candidateFuel.size === 0) return receipt('no-one-attachment-attack-option');
  const retainedFuel = names => {
    const remaining = new Map();
    for (const name of actor.ownHand)
      remaining.set(name, (remaining.get(name) ?? 0) + 1);
    for (const name of names)
      remaining.set(name, (remaining.get(name) ?? 0) - 1);
    return [...candidateFuel].some(name => (remaining.get(name) ?? 0) > 0);
  };
  if (retainedFuel(baseline)) return receipt('generic-preserves-immediate-attack-fuel');
  const alternatives = input.prompt.menu.filter(retainedFuel);
  if (alternatives.length === 0) return receipt('all-valid-bundles-extinguish-attack-fuel');
  const proposal = chooseActorHandDiscard({
    ...input, prompt:{...input.prompt, menu:alternatives}
  }).printings;
  return receipt('preserve-one-attachment-immediate-attack', proposal);
}

module.exports = {VERSION, energyUnits, paysPrintedCost, proposeAttackFuelDiscard};
