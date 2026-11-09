'use strict';
const assert = require('node:assert/strict');

const HOOD = 'Stealthy Hood';
const DOOR = 'Underworld Door';

/** @param {object} root */
function isAcceptedHood(root) {
  return root.action === 'PlayCardAction' &&
    typeof root.card === 'string' && root.card.startsWith(HOOD);
}

/** @param {object} root */
function isAcceptedDoor(root) {
  return root.action === 'UseAbilityAction' &&
    [root.ability, root.power, root.name].some(v =>
      typeof v === 'string' && v.includes(DOOR)) ||
    root.action === 'UseAbilityAction' && JSON.stringify(root).includes(DOOR);
}

/**
 * Count genuinely accepted public Store roots in one original-60 match.
 * Chronological root order alone does not prove the Hood and Door target
 * the same physical Pokemon, or certify printed Ability payment.
 *
 * @param {object} native One completed-or-capped genuine native game result.
 * @param {0|1} candidateSeat Physical candidate player slot.
 * @returns {object} Compact publicly observed causal-frontier diagnostics.
 */
function hoodSequence(native, candidateSeat) {
  assert.ok(candidateSeat === 0 || candidateSeat === 1);
  const roots = native.rootActionLedger ?? [];
  assert.ok(Array.isArray(roots));
  const own = (root) => root.playerSlot === candidateSeat;
  const hood = [];
  const door = [];
  const attacks = [];
  const sourceAttacks = [];
  for (let i = 0; i < roots.length; i++) {
    const root = roots[i];
    if (own(root) && isAcceptedHood(root)) hood.push(i);
    if (own(root) && isAcceptedDoor(root)) door.push(i);
    if (root.action === 'AttackAction') {
      if (own(root)) attacks.push(i);
      else if (root.playerSlot === 1-candidateSeat) sourceAttacks.push(i);
    }
  }
  const firstHood = hood[0] ?? null;
  const firstDoorAfterHood = firstHood === null ? null :
    door.find(i => i > firstHood) ?? null;
  const afterDoor = firstDoorAfterHood === null ? [] :
    attacks.filter(i => i > firstDoorAfterHood);
  const sourceAfterDoor = firstDoorAfterHood === null ? [] :
    sourceAttacks.filter(i => i > firstDoorAfterHood);
  const snapshot = i => i === null ? null : ({
    index:i,
    actionOrdinal:roots[i].actionOrdinal ?? null,
    turnBefore:roots[i].turnBefore ?? null,
    playerSlot:roots[i].playerSlot,
    action:roots[i].action,
    card:roots[i].card ?? null,
    attack:roots[i].attack ?? null
  });
  return {
    acceptedHoodCount:hood.length,
    acceptedDoorCount:door.length,
    candidateAttackCount:attacks.length,
    originalSourceAttackCount:sourceAttacks.length,
    firstAcceptedHood:snapshot(firstHood),
    firstAcceptedDoorAfterHood:snapshot(firstDoorAfterHood),
    firstCandidateAttackAfterHoodDoor:snapshot(afterDoor[0] ?? null),
    firstSourceAttackAfterHoodDoor:snapshot(sourceAfterDoor[0] ?? null),
    observedTemporalHoodDoor:firstDoorAfterHood !== null,
    observedTemporalHoodDoorCandidateAttack:afterDoor.length > 0,
    observedTemporalHoodDoorSourceAttack:sourceAfterDoor.length > 0,
    hoodAndDoorSamePhysicalSourceVerified:false,
    paperPaymentAndTargetIndependentlyCertified:false,
    nativeTerminal:native.finished === true,
    nativeWinner:native.finished === true ? native.winner ?? null : null,
    finalNativePrizes:native.finalPrizes ?? null,
    suddenDeathClockResets:native.suddenDeathClockResets?.length ?? null,
    competitiveQualified:false
  };
}

module.exports = {isAcceptedHood,isAcceptedDoor,hoodSequence};
