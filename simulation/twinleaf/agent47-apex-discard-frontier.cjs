'use strict';

const assert = require('node:assert/strict');
const {chooseActorHandDiscard} = require('./agent47-actor-hand-discard.cjs');

const VERSION = 'agent47-apex-payload-discard-proposal-v1';

/**
 * Narrow, public-zone-only proof that the Active Regidrago VSTAR can pay
 * Apex Dragon using either two Double Dragon Energy or 2 Grass + 1 Fire.
 * Other Energy combinations are deliberately unsupported.
 * @param {object} actor Detached actor-only observation.
 * @returns {boolean}
 */
function directlyReadyApex(actor) {
  const own = actor.ownPublic;
  const active = own?.active;
  if (actor.decisionKind !== 'owner-prompt' || actor.globalTurn === 1 ||
      active?.printing !== 'Regidrago VSTAR SIT' ||
      !active.attacks?.some(attack => attack.name === 'Apex Dragon') ||
      own.publicTurnRestrictions?.attackLockTurnsRemaining > 0 ||
      active.publicRestrictions?.cannotAttackNextTurn === true ||
      active.publicRestrictions?.blockedAttackNameNextTurn === 'Apex Dragon' ||
      active.publicRestrictions?.blockedAttackNameUntilLeavesActive === 'Apex Dragon' ||
      active.publicRestrictions?.cannotUseAttacksNextTurn?.includes('Apex Dragon') ||
      (active.publicRestrictions?.onlyAllowedAttackNameNextTurn &&
        active.publicRestrictions.onlyAllowedAttackNameNextTurn !== 'Apex Dragon') ||
      (active.specialConditions?.length ?? 0) > 0) return false;
  const energy = active.energies ?? [];
  const grass = energy.filter(name => name.startsWith('Grass Energy ')).length;
  const fire = energy.filter(name => name.startsWith('Fire Energy ')).length;
  if (grass >= 2 && fire >= 1) return true;
  const stadiums = [...(own.stadium ?? []), ...(actor.opponentPublic?.stadium ?? [])];
  const temple = stadiums.some(name => name.startsWith('Temple of Sinnoh '));
  return !temple && energy.filter(name => name === 'Double Dragon Energy ROS').length >= 2;
}

/**
 * Report a strictly conditional alternate mandatory hand-discard choice.
 * Native prompt menu supplies validated physical-printing multisets; static
 * payloadPrintings must be checked from the printed card database. The
 * proposal is NEVER an independent legality or gameplay outcome claim.
 * @param {{actor:object,prompt:{menu:string[][]}}} input
 * @param {Set<string>} payloadPrintings Exact Dragon Pokémon printings with copyable attacks.
 * @returns {{version:string,reason:string,baseline:string[],proposal:string[],changed:boolean}}
 */
function proposeApexPayloadDiscard(input, payloadPrintings) {
  assert.ok(input?.actor && Array.isArray(input?.prompt?.menu));
  assert.ok(payloadPrintings instanceof Set);
  const baseline = chooseActorHandDiscard(input).printings;
  const result = (reason, proposal = baseline) => ({
    version:VERSION,reason,baseline:[...baseline],proposal:[...proposal],
    changed:JSON.stringify(proposal) !== JSON.stringify(baseline)
  });
  if (!directlyReadyApex(input.actor)) return result('apex-not-directly-confirmed-ready');
  const discard = input.actor.ownPublic.discard ?? [];
  if (discard.some(name => payloadPrintings.has(name)))
    return result('already-has-copyable-public-payload');
  if (baseline.some(name => payloadPrintings.has(name)))
    return result('baseline-already-discards-payload');
  const available = input.prompt.menu.filter(names =>
    names.some(name => payloadPrintings.has(name)));
  if (available.length === 0) return result('no-valid-payload-menu-choice');
  const ownCounts = new Map();
  for (const name of input.actor.ownHand)
    ownCounts.set(name,(ownCounts.get(name) ?? 0) + 1);
  const preservationCost = names => {
    const chosen = new Map();
    for (const name of names) chosen.set(name,(chosen.get(name) ?? 0) + 1);
    let erased = 0,unique = 0;
    for (const [name,n] of chosen) {
      if (ownCounts.get(name) === n) erased++;
      if (ownCounts.get(name) === 1) unique++;
    }
    return erased * 100 + unique * 10;
  };
  const ordered = [...available].sort((a,b) =>
    preservationCost(a) - preservationCost(b) ||
    JSON.stringify(a).localeCompare(JSON.stringify(b),'en'));
  return result('first-copyable-apex-payload-opportunity',ordered[0]);
}

module.exports = {VERSION,directlyReadyApex,proposeApexPayloadDiscard};
