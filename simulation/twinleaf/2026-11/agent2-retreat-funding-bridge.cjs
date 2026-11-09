'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent2-one-basic-shortfall-retreat-funding-bridge-v2';

/**
 * Recover a two-action mobility line: attach a held Basic Energy to an Active
 * missing exactly one printed Colorless Retreat unit (fee 1 or 2), then pay
 * the complete Basic Energy cost to Retreat to a funded Bench attacker.
 * Re-evaluate from the live owner root after the native attachment.
 * The genuine Store determines payment, switching and attack legality.
 *
 * Avoid commitment when another attack is payable on the Active, the Active
 * carries a position-dependent Ability, or the public opponent blocks retreat.
 * Only printed one- or two-unit Colorless retreat with absent or known
 * non-Retreat-modifying Tools, and complete Basic Energy payment, is modeled. No deck order, Prize identity or opponent hand is inspected.
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
      active.printed.retreatCost.length < 1 ||
      active.printed.retreatCost.length > 2 ||
      !active.printed.retreatCost.every(type =>
        type === catalog.colorlessEnergyType) ||
      (active.tools ?? []).some(tool =>
        tool !== 'Stealthy Hood UNB' &&
        tool !== 'Forest Seal Stone SIT') ||
      !Array.isArray(active.energies) ||
      !Array.isArray(own.bench) ||
      !(catalog.basicEnergies instanceof Set)) return null;
  const feeUnits = active.printed.retreatCost.length;
  if (active.energies.length < feeUnits - 1 ||
      active.energies.length > feeUnits ||
      active.energies.some(printing => !catalog.basicEnergies.has(printing)))
    return null;

  // A face-up Skyliner makes Basic retreat free. Funding a printed one-unit
  // fee in that case would burn the owner's Energy attachment for no gain.
  // Conservative even if an unmodeled lock currently suppresses Skyliner.
  if (catalog.stages?.BASIC !== undefined &&
      active.printed?.stage === catalog.stages.BASIC &&
      own.bench.some(pokemon => pokemon?.abilities?.includes('Skyliner')))
    return null;

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

  if (active.energies.length === feeUnits) {
    return {kind: 'paid-retreat', benchIndex: target.benchIndex,
      printing: target.printing, attackName: target.attackName,
      retreatCostUnits: feeUnits, source: VERSION,
      stage: 'retreat-after-basic-attachment', paperVerified: false};
  }

  if (resources.energyPlayedTurn === view.globalTurn ||
      resources.energyPlayLocked === true ||
      own.publicTurnRestrictions?.energyPlayLocked === true) return null;
  const handIndex = (view.ownHand ?? []).findIndex(printing =>
    catalog.basicEnergies.has(printing) &&
    !(active.attacks ?? []).some(attack =>
      Array.isArray(attack.cost) &&
      paysWithBasics({...active,
        energies: [...active.energies, printing]}, attack, catalog)));
  if (handIndex < 0) return null;
  return {kind: 'attach-basic-energy', slot: 'active', index: 0,
    handIndex, printing: view.ownHand[handIndex], source: VERSION,
    stage: 'fund-one-unit-shortfall-retreat',
    retreatCostUnits: feeUnits,
    readyBenchIndex: target.benchIndex,
    followupAttackName: target.attackName, paperVerified: false};
}

module.exports = {VERSION, chooseRetreatFundingBridge};
