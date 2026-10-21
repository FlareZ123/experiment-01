'use strict';

const assert = require('node:assert/strict');
const {remainingBasicAttachments} = require('./agent10-basic-energy-frontier.cjs');

const VERSION = 'agent9-actor-visible-immediate-ko-energy-hypothesis-v1';
const TYPES = ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic',
  'Fighting', 'Darkness', 'Metal', 'Fairy'];

/**
 * Identify an Active Basic-Energy attachment that would pay for a presently
 * unpayable printed fixed-damage, non-GX attack whose base damage is at least
 * the opposing Active's public remaining HP.
 *
 * This is a pre-dispatch priority hypothesis: Weakness, Resistance, Abilities,
 * Tool effects, other modifiers, and attack text may prevent the nominal KO.
 * The actual pinned Store must decide attack legality and resolve all effects.
 * Unknown Special Energy, attack locks and statuses are conservatively excluded.
 *
 * @param {object} view Frozen detached actor observation.
 * @param {object} catalog Public typed print catalog.
 * @returns {object|null} Actor-visible Energy target suggestion.
 */
function chooseImmediateKoEnergyIntent(view, catalog) {
  assert.equal(view.decisionKind, 'owner-root');
  const own = view.ownPublic;
  const target = view.opponentPublic?.active;
  const active = own?.active;
  if (!active || !target || !Array.isArray(view.ownHand)) return null;
  if (!Number.isFinite(target.hp) || !Number.isFinite(target.damage)) return null;
  const remainingHP = target.hp - target.damage;
  if (remainingHP <= 0) return null;
  const ownerTurn = view.ownTurnResources ?? {};
  if (ownerTurn.energyPlayedTurn === view.globalTurn
      || ownerTurn.energyPlayLocked === true
      || own.publicTurnRestrictions?.energyPlayLocked === true) return null;

  const activeRules = active.publicRestrictions ?? {};
  const playerRules = own.publicTurnRestrictions ?? {};
  if (activeRules.cannotAttackNextTurn
      || playerRules.attackLockTurnsRemaining > 0
      || playerRules.attackMaxEnergy !== null && playerRules.attackMaxEnergy !== undefined
      || (active.specialConditions ?? []).some(status =>
        status === catalog.specialConditions?.ASLEEP
        || status === catalog.specialConditions?.PARALYZED)) return null;

  const kind = printing => {
    if (!catalog.basicEnergies.has(printing)) return null;
    const name = TYPES.find(type => printing.startsWith(type + ' Energy '));
    return name ? catalog.basicEnergyTypes[name] ?? null : null;
  };
  const attached = (active.energies ?? []).map(kind);
  if (attached.includes(null)) return null;

  const affordable = [];
  for (const attack of active.attacks ?? []) {
    if (!Array.isArray(attack.cost) || !attack.cost.every(Number.isSafeInteger)
        || attack.gxAttack === true
        || activeRules.blockedAttackNameNextTurn === attack.name
        || activeRules.blockedAttackNameUntilLeavesActive === attack.name
        || (activeRules.cannotUseAttacksNextTurn ?? []).includes(attack.name)
        || (activeRules.onlyAllowedAttackNameNextTurn
          && activeRules.onlyAllowedAttackNameNextTurn !== attack.name)) continue;
    const printedDamage = attack.damage;
    const damage = typeof printedDamage === 'number' ? printedDamage
      : typeof printedDamage === 'string' && /^\d+$/.test(printedDamage)
        ? Number(printedDamage) : NaN;
    if (!Number.isSafeInteger(damage) || damage < remainingHP) continue;

    const before = remainingBasicAttachments(
      attack.cost, attached, catalog.colorlessEnergyType);
    if (before !== 1) continue;
    view.ownHand.forEach((printing, handIndex) => {
      const type = kind(printing);
      if (type === null) return;
      const after = remainingBasicAttachments(
        attack.cost, [...attached, type], catalog.colorlessEnergyType);
      if (after === 0) affordable.push({
        handIndex, printing, slot: 'active', index: 0,
        attackName: attack.name, gapBefore: 1, gapAfter: 0,
        projectedBaseDamage: damage, opponentRemainingHP: remainingHP,
        knownBasicEnergyOnly: true
      });
    });
  }
  affordable.sort((a, b) =>
    b.projectedBaseDamage - a.projectedBaseDamage
    || a.handIndex - b.handIndex
    || a.attackName.localeCompare(b.attackName));
  return affordable[0] ?? null;
}

module.exports = {VERSION, chooseImmediateKoEnergyIntent};
