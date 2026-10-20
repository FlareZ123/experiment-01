'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent10-multiplicity-aware-basic-energy-frontier-v1';
const TYPES = ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic',
  'Fighting', 'Darkness', 'Metal', 'Fairy'];

/**
 * Count further one-unit Basic Energy attachments needed to pay a printed
 * attack cost, assuming no other effects or Special Energy. Preserves
 * multiplicity: two Psychic symbols require two distinct energy units.
 *
 * @param {number[]} cost Native numeric CardType cost symbols.
 * @param {number[]} attached Known one-unit Basic Energy types.
 * @param {number} colorless Native CardType.COLORLESS.
 * @returns {number}
 */
function remainingBasicAttachments(cost, attached, colorless) {
  assert.ok(Array.isArray(cost) && Array.isArray(attached));
  const unused = attached.slice();
  let coloredMissing = 0;
  for (const required of cost) {
    if (required === colorless) continue;
    const index = unused.indexOf(required);
    if (index < 0) coloredMissing++;
    else unused.splice(index, 1);
  }
  return Math.max(coloredMissing, cost.length - attached.length, 0);
}

/**
 * Choose the owner-held Basic Energy that most efficiently shortens the
 * printed cost of an Active Pokemon attack. All inputs are detached actor
 * observation and public card definitions, without any physical Store state.
 *
 * This is a planning heuristic, not a legality or attack-readiness oracle:
 * unknown Special Energy, evolving, copying, attack-cost modifiers, other
 * goals, opponent moves, and effects are deliberately outside its scope.
 *
 * @param {object} view Frozen actorObservation with ownHand and ownPublic.
 * @param {object} catalog Actor34's public, typed basic Energy catalog.
 * @returns {{handIndex:number,printing:string,attackName:string|null,
 *   gapBefore:number|null,gapAfter:number|null,knownBasicEnergyOnly:true}|null}
 */
function chooseBasicEnergyFrontier(view, catalog) {
  assert.equal(view.decisionKind, 'owner-root');
  const active = view.ownPublic.active;
  if (!active) return null;
  const kind = printing => {
    if (!catalog.basicEnergies.has(printing)) return null;
    const name = TYPES.find(t => printing.startsWith(t + ' Energy '));
    return name ? catalog.basicEnergyTypes[name] ?? null : null;
  };
  const held = view.ownHand.flatMap((printing, handIndex) => {
    const type = kind(printing);
    return type === null ? [] : [{printing, handIndex, type}];
  });
  if (!held.length) return null;
  const attached = active.energies.map(kind).filter(type => type !== null);
  const rules = active.publicRestrictions ?? {};
  const player = view.ownPublic.publicTurnRestrictions ?? {};
  const viable = (active.attacks ?? []).filter(attack =>
    Array.isArray(attack.cost) &&
    !(attack.gxAttack && (player.gxUsed || player.cannotUseGXAttacks)) &&
    !rules.cannotAttackNextTurn &&
    rules.blockedAttackNameNextTurn !== attack.name &&
    rules.blockedAttackNameUntilLeavesActive !== attack.name &&
    !(rules.cannotUseAttacksNextTurn ?? []).includes(attack.name) &&
    (!rules.onlyAllowedAttackNameNextTurn ||
      rules.onlyAllowedAttackNameNextTurn === attack.name));
  let best = null;
  for (const energy of held) {
    for (const attack of viable) {
      const before = remainingBasicAttachments(
        attack.cost, attached, catalog.colorlessEnergyType);
      const after = remainingBasicAttachments(
        attack.cost, [...attached, energy.type], catalog.colorlessEnergyType);
      const gain = before - after;
      if (gain > 0 && (!best || after < best.gapAfter ||
          (after === best.gapAfter && gain > best.gain))) {
        best = {handIndex:energy.handIndex, printing:energy.printing,
          attackName:attack.name, gapBefore:before, gapAfter:after, gain};
      }
    }
  }
  if (!best) return {
    handIndex:held[0].handIndex, printing:held[0].printing,
    attackName:null, gapBefore:null, gapAfter:null,
    knownBasicEnergyOnly:true
  };
  const {gain, ...choice} = best;
  return {...choice, knownBasicEnergyOnly:true};
}

module.exports = {VERSION, remainingBasicAttachments,
  chooseBasicEnergyFrontier};
