'use strict';

const assert = require('node:assert/strict');
const {chooseActorHandDiscard} = require('../agent47-actor-hand-discard.cjs');

const VERSION = 'agent47-owner-immediate-attack-fuel-v3-known-special-energy';
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
  // Preserve the existing, independently checked bounded native Special
  // Energy mapping (Telepath [P], Speed Lightning, Capture, Spiky). Unknown
  // printings remain explicitly unsupported; this is not a paper oracle.
  return require('../agent3-special-energy-frontier.cjs')
    .specialEnergyUnits(printing,catalog,temple);
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
 * Include public printed Perfection donor costs for Mewtwo & Mew-GX. The
 * existing catalog deliberately covers only verified, known donor printings;
 * no hidden deck or Prize cards contribute. The native Store still decides
 * whether a copied attack may actually be announced and resolved.
 * @param {object} actor Detached actor-owned prompt observation.
 * @param {object} catalog Public native printed card catalog.
 * @returns {object[]} Usable public donor attack descriptions.
 */
function availablePerfectionAttacks(actor, catalog) {
  if (!(catalog.perfectionDonors instanceof Map)) return [];
  const {publicPerfectionVeto} =
    require('../agent30-known-perfection-options.cjs');
  if (publicPerfectionVeto(actor,catalog.specialConditions)!==null)
    return [];
  const own=actor.ownPublic;
  const sources=new Set([...(own.discard??[]),
    ...(own.bench??[]).flatMap(slot=>slot?[slot.printing]:[])]);
  const gxSpent=own.publicTurnRestrictions?.gxUsed===true||
    own.publicTurnRestrictions?.cannotUseGXAttacks===true;
  const attacks=[];
  for (const [printing, moves] of catalog.perfectionDonors) {
    if (!sources.has(printing)) continue;
    for (const move of moves) {
      if (!Array.isArray(move.cost) ||
          !move.cost.every(Number.isSafeInteger) ||
          (gxSpent && move.gxAttack)) continue;
      attacks.push({name:move.name,cost:move.cost,
        gxAttack:move.gxAttack,sourcePrinting:printing});
    }
  }
  return attacks;
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
  const attacks = [...active.attacks,
    ...availablePerfectionAttacks(actor,catalog)].filter(attack => {
    if (!Array.isArray(attack.cost) || attack.cost.length === 0 ||
        attack.gxAttack === true && (own.publicTurnRestrictions?.gxUsed === true ||
          own.publicTurnRestrictions?.cannotUseGXAttacks === true) ||
        active.publicRestrictions?.blockedAttackNameNextTurn === attack.name ||
        active.publicRestrictions?.blockedAttackNameUntilLeavesActive === attack.name ||
        active.publicRestrictions?.cannotUseAttacksNextTurn?.includes(attack.name) ||
        active.publicRestrictions?.onlyAllowedAttackNameNextTurn &&
          active.publicRestrictions.onlyAllowedAttackNameNextTurn !== attack.name) return false;
    return !paysPrintedCost(attack.cost, attached, colorless);
  });
  if (attacks.length === 0) return receipt('no-unfunded-available-printed-attack');
  const candidateFuel = new Set(actor.ownHand.filter(printing => {
    if (own.publicTurnRestrictions?.specialEnergyPlayLocked === true &&
        !catalog.basicEnergies.has(printing)) return false;
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

module.exports = {VERSION, energyUnits, paysPrintedCost,
  availablePerfectionAttacks, proposeAttackFuelDiscard};
