'use strict';

const assert = require('node:assert/strict');
const {specialEnergyUnits,missingEnergyUnits} =
  require('./agent3-special-energy-frontier.cjs');
const {effectiveNativeAttackCost} =
  require('./agent17-public-context-special-energy.cjs');

const VERSION = 'agent41-public-immediate-special-attack-contest-v3-stadium-cost';

/**
 * Choose a known Special Energy over a known Basic Energy only when the
 * Special immediately funds an allowed printed damaging attack and every
 * available Basic leaves that attack and all other eligible damaging attacks
 * unfunded. This is a conservative public-cost tie breaker; native Store
 * remains responsible for attachment/attack legality and all effects.
 *
 * @param {object} view Frozen owner-only actorObservation.
 * @param {object} catalog Exact public printed Energy/type metadata.
 * @returns {{kind:'attach-special-energy',handIndex:number,printing:string,slot:'active',index:0}|null}
 */
function specialFundsImmediateAttack(view, catalog) {
  assert.equal(view.decisionKind, 'owner-root');
  const own = view.ownPublic, r = view.ownTurnResources;
  const active = own?.active;
  if (!active || view.globalTurn <= 1 ||
      r?.energyPlayLocked !== false ||
      r?.specialEnergyPlayLocked === true ||
      r?.energyPlayedTurn === view.globalTurn ||
      own.publicTurnRestrictions?.attackLockTurnsRemaining > 0 ||
      active.publicRestrictions?.cannotAttackNextTurn === true ||
      active.specialConditions?.some(c => c === catalog.specialConditions.ASLEEP ||
        c === catalog.specialConditions.PARALYZED)) return null;

  const basicOptions = [];
  const specialOptions = [];
  const basicTypeNames = Object.keys(catalog.basicEnergyTypes);
  const temple = [...(own.stadium ?? []),
    ...(view.opponentPublic?.stadium ?? [])]
    .some(printing => printing.startsWith('Temple of Sinnoh '));

  const unitsFor = printing => {
    const special = specialEnergyUnits(printing, catalog, temple);
    if (special !== null) return special;
    if (!catalog.basicEnergies.has(printing)) return null;
    const name = basicTypeNames.find(type =>
      printing.startsWith(type + ' Energy '));
    return name === undefined ? null : [catalog.basicEnergyTypes[name]];
  };
  const attached = [];
  for (const printing of active.energies ?? []) {
    const units = unitsFor(printing);
    if (!units) return null;
    attached.push(...units);
  }

  for (let handIndex = 0; handIndex < view.ownHand.length; handIndex++) {
    const printing = view.ownHand[handIndex];
    // Speed Lightning provides Lightning on any Pokémon; its draw-2
    // bonus alone requires a Lightning recipient (RCL 173).
    const units = unitsFor(printing);
    if (!units) continue;
    const candidate = {handIndex, printing, units};
    if (catalog.basicEnergies.has(printing)) basicOptions.push(candidate);
    else if (printing !== 'Telepath [P] Energy M3')
      specialOptions.push(candidate);
  }
  if (!basicOptions.length || !specialOptions.length) return null;

  const restrictions = active.publicRestrictions ?? {};
  const attacks = (active.attacks ?? []).filter(attack =>
    Number.isSafeInteger(attack.damage) && attack.damage > 0 &&
    Array.isArray(attack.cost) && attack.cost.every(Number.isSafeInteger) &&
    attack.gxAttack !== true && !attack.name.endsWith('-GX') &&
    restrictions.blockedAttackNameNextTurn !== attack.name &&
    restrictions.blockedAttackNameUntilLeavesActive !== attack.name &&
    !(restrictions.cannotUseAttacksNextTurn ?? []).includes(attack.name) &&
    (!restrictions.onlyAllowedAttackNameNextTurn ||
      restrictions.onlyAllowedAttackNameNextTurn === attack.name));

  if (!attacks.length) return null;
  const missing = (attack, provided) => {
    const cost=effectiveNativeAttackCost(view,catalog,active,attack);
    return cost===null?Number.POSITIVE_INFINITY:
      missingEnergyUnits(cost,provided,catalog.colorlessEnergyType);
  };
  // Do not spend a scarce Special Energy to fund a second attack when an
  // existing damaging attack is already payable from public printed costs.
  if (attacks.some(attack => missing(attack, attached) === 0)) return null;
  // The existing first-choice Basic can already fund an attack: preserve it.
  if (attacks.some(attack => basicOptions.some(candidate =>
    missing(attack, [...attached,...candidate.units]) === 0))) return null;

  for (const special of specialOptions) {
    if (attacks.some(attack => missing(attack, attached) > 0 &&
      missing(attack, [...attached,...special.units]) === 0)) {
      return {kind:'attach-special-energy',handIndex:special.handIndex,
        printing:special.printing,slot:'active',index:0};
    }
  }
  return null;
}

module.exports = {VERSION,specialFundsImmediateAttack};
