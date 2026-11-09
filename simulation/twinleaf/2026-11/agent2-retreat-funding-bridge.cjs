'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent2-one-basic-retreat-funding-bridge-v1';

/**
 * Recover a two-action mobility line: attach a held Basic Energy to an empty
 * one-Colorless-retreat Active, then pay that Energy to Retreat to an already
 * powered, substantive Bench attacker. Re-evaluate on each live owner root.
 * The genuine Store determines payment, switching and attack legality.
 *
 * Avoid commitment when another attack is payable on the Active, the Active
 * carries a position-dependent Ability, or the public opponent blocks retreat.
 * Only printed single-unit retreat with no Tool and supported Basic Energy
 * is modeled. No deck order, Prize identity or opponent hand is inspected.
 *
 * @param {object} view Detached actor-owned root observation.
 * @param {object} catalog Public printed card catalog and game enums.
 * @param {{paysWithBasics?:Function,opponentActiveBlocksRetreat?:Function,
 *   wouldLoseActivePositionAbility?:Function,projectedPrintedDamage?:Function}} [deps]
 *   Injectable genuine shared helpers for isolated pure contract testing.
 * @returns {object|null} Native-neutral intent, or no supported line.
 */
function chooseRetreatFundingBridge(view, catalog, deps = {}) {
  assert.equal(view?.decisionKind, 'owner-root');
  const paysWithBasics = deps.paysWithBasics ??
    require('../agent7-actor-free-retreat-frontier.cjs').paysWithBasics;
  const opponentActiveBlocksRetreat = deps.opponentActiveBlocksRetreat ??
    require('../agent2-owner-skyliner-funded-bench-frontier.cjs').opponentActiveBlocksRetreat;
  const wouldLoseActivePositionAbility = deps.wouldLoseActivePositionAbility ??
    require('../agent47-active-position-retreat-veto.cjs').wouldLoseActivePositionAbility;
  const projectedPrintedDamage = deps.projectedPrintedDamage ??
    require('../agent6-actor-paid-retreat-frontier.cjs').projectedPrintedDamage;

  const own = view.ownPublic;
  const active = own?.active;
  const resources = view.ownTurnResources;
  if (!active || !view.opponentPublic?.active || view.globalTurn <= 1 ||
      !Number.isSafeInteger(resources?.retreatedTurn) ||
      resources.retreatedTurn === view.globalTurn ||
      own.publicTurnRestrictions?.attackLockTurnsRemaining > 0 ||
      opponentActiveBlocksRetreat(view) ||
      active.publicRestrictions?.cannotRetreatNextTurn === true ||
      active.publicRestrictions?.cannotRetreatWhileActive === true ||
      (active.specialConditions ?? []).some(status =>
        status === catalog.specialConditions?.ASLEEP ||
        status === catalog.specialConditions?.PARALYZED) ||
      !Array.isArray(active.printed?.retreatCost) ||
      active.printed.retreatCost.length !== 1 ||
      active.printed.retreatCost[0] !== catalog.colorlessEnergyType ||
      (active.tools ?? []).length > 0 ||
      !Array.isArray(active.energies) ||
      active.energies.length > 1 ||
      !Array.isArray(own.bench) ||
      !(catalog.basicEnergies instanceof Set)) return null;

  // A zero-cost control attack can be strategically decisive even if it does
  // no damage. Preserve any payable printed Active attack, including GX.
  if ((active.attacks ?? []).some(attack =>
    Array.isArray(attack.cost) &&
    paysWithBasics(active, attack, catalog))) return null;

  const ready = [];
  for (const [benchIndex, pokemon] of own.bench.entries()) {
    if (!pokemon || !Array.isArray(pokemon.energies) ||
        wouldLoseActivePositionAbility(view, benchIndex) ||
        pokemon.publicRestrictions?.cannotAttackNextTurn === true ||
        (pokemon.specialConditions ?? []).some(status =>
          status === catalog.specialConditions?.ASLEEP ||
          status === catalog.specialConditions?.PARALYZED)) continue;
    for (const attack of pokemon.attacks ?? []) {
      const damage = projectedPrintedDamage(view, pokemon, attack);
      if (attack.gxAttack === true || damage === null || damage < 80 ||
          (attack.damageCalculation !== null &&
           attack.damageCalculation !== undefined) ||
          pokemon.publicRestrictions?.blockedAttackNameNextTurn === attack.name ||
          pokemon.publicRestrictions?.blockedAttackNameUntilLeavesActive === attack.name ||
          pokemon.publicRestrictions?.cannotUseAttacksNextTurn?.includes(attack.name) ||
          (pokemon.publicRestrictions?.onlyAllowedAttackNameNextTurn &&
           pokemon.publicRestrictions.onlyAllowedAttackNameNextTurn !== attack.name) ||
          !paysWithBasics(pokemon, attack, catalog)) continue;
      ready.push({benchIndex, printing: pokemon.printing,
        attackName: attack.name, projectedPrintedDamage: damage});
    }
  }
  ready.sort((a, b) =>
    b.projectedPrintedDamage - a.projectedPrintedDamage ||
    a.benchIndex - b.benchIndex || a.attackName.localeCompare(b.attackName));
  const target = ready[0];
  if (!target) return null;

  if (active.energies.length === 1) {
    if (!catalog.basicEnergies.has(active.energies[0])) return null;
    return {kind: 'paid-retreat', benchIndex: target.benchIndex,
      printing: target.printing, attackName: target.attackName,
      retreatCostUnits: 1, source: VERSION,
      stage: 'retreat-after-basic-attachment', paperVerified: false};
  }

  if (resources.energyPlayedTurn === view.globalTurn ||
      resources.energyPlayLocked === true ||
      own.publicTurnRestrictions?.energyPlayLocked === true) return null;
  const handIndex = (view.ownHand ?? []).findIndex(printing =>
    catalog.basicEnergies.has(printing));
  if (handIndex < 0) return null;
  return {kind: 'attach-basic-energy', slot: 'active', index: 0,
    handIndex, printing: view.ownHand[handIndex], source: VERSION,
    stage: 'fund-one-basic-retreat',
    readyBenchIndex: target.benchIndex,
    followupAttackName: target.attackName, paperVerified: false};
}

module.exports = {VERSION, chooseRetreatFundingBridge};
