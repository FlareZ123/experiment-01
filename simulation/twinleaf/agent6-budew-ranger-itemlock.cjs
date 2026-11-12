'use strict';

const VERSION = 'agent6-budew-ranger-itemlock-owner-root-v1';
const RANGER = 'Pokemon Ranger STS';
const ITEM_LOCK_ATTACK = 'Itchy Pollen';

// Never copy concealed player zones into the effect-removal probe.
const HIDDEN_PLAYER_ZONES = new Set([
  'hand', 'deck', 'prizes', 'discard', 'lostzone', 'lostZone'
]);
const PLAYER_PROBE_EXCLUSIONS = new Set([
  ...HIDDEN_PLAYER_ZONES, 'active', 'bench', 'marker'
]);
const ALLOWED_OWNER_LOCK_FIELDS = new Set([
  'cannotPlayItemCards', 'playLocksTurnsRemaining'
]);

function cloneMarker(marker) {
  if (!marker || typeof marker !== 'object') return marker;
  const clone = Object.assign(Object.create(Object.getPrototypeOf(marker)), marker);
  if (Array.isArray(marker.markers)) clone.markers = marker.markers.slice();
  return clone;
}

function clonePokemonSlot(slot) {
  if (!slot || typeof slot !== 'object') return slot;
  const clone = Object.create(Object.getPrototypeOf(slot));
  for (const key of Object.keys(slot)) {
    if (key === 'marker') continue;
    clone[key] = slot[key];
  }
  clone.marker = cloneMarker(slot.marker);
  return clone;
}

function clonePublicPlayer(player) {
  const clone = Object.create(Object.getPrototypeOf(player));
  for (const key of Object.keys(player)) {
    if (PLAYER_PROBE_EXCLUSIONS.has(key)) continue;
    clone[key] = player[key];
  }
  clone.marker = cloneMarker(player.marker);
  clone.active = clonePokemonSlot(player.active);
  clone.bench = (player.bench ?? []).map(clonePokemonSlot);
  return clone;
}

function sameShallowValue(before, after) {
  if (Object.is(before, after)) return true;
  if (Array.isArray(before) && Array.isArray(after)) {
    return before.length === after.length &&
      before.every((value, index) => Object.is(value, after[index]));
  }
  return false;
}

function attackMarkers(marker) {
  if (!marker) return [];
  if (typeof marker.getMarkersBySourceType === 'function') {
    return marker.getMarkersBySourceType('attack');
  }
  return Array.isArray(marker.markers) ?
    marker.markers.filter(item => item?.sourceType === 'attack') : [];
}

function sameSourceCard(left, right) {
  return left === right ||
    (typeof left?.fullName === 'string' &&
      typeof right?.fullName === 'string' &&
      left.fullName === right.fullName);
}

function slotWouldLoseOtherAttackEffects(slot) {
  if (!slot) return false;
  if (attackMarkers(slot.marker).length > 0) return true;
  if (typeof slot.removeAttackEffects !== 'function') return true;
  try {
    const clone = clonePokemonSlot(slot);
    clone.removeAttackEffects();
    for (const key of Object.keys(slot)) {
      if (key === 'marker') continue;
      if (!sameShallowValue(slot[key], clone[key])) return true;
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * Probe the exact pinned engine cleanup method on a detached public-only
 * Player clone. For the locked owner, only the Budew Item lock itself may be
 * removed. For the opponent, no attack effect may be removed. Hidden zones
 * (hand, deck, Prizes, discard and Lost Zone) are never copied or inspected.
 */
function playerWouldLoseOtherAttackEffects(player, {
  allowBudewItemLock = false,
  budewSource = null
} = {}) {
  if (!player || typeof player.removeAttackEffectsFromPlayerAndPokemon !== 'function') {
    return true;
  }
  const markers = attackMarkers(player.marker);
  if (allowBudewItemLock) {
    if (!markers.every(marker =>
      marker?.targetScope === 'player' &&
      sameSourceCard(marker.source, budewSource))) return true;
  } else if (markers.length > 0) {
    return true;
  }

  try {
    const clone = clonePublicPlayer(player);
    clone.removeAttackEffectsFromPlayerAndPokemon();
    const allowed = allowBudewItemLock ? ALLOWED_OWNER_LOCK_FIELDS : new Set();
    for (const key of Object.keys(player)) {
      if (PLAYER_PROBE_EXCLUSIONS.has(key)) continue;
      if (sameShallowValue(player[key], clone[key])) continue;
      if (allowed.has(key)) continue;
      return true;
    }
    if (slotWouldLoseOtherAttackEffects(player.active)) return true;
    for (const slot of player.bench ?? []) {
      if (slotWouldLoseOtherAttackEffects(slot)) return true;
    }
    return false;
  } catch {
    // An unknown pinned-engine shape must fail closed rather than cancel
    // an attack effect whose strategic value the policy cannot evaluate.
    return true;
  }
}

/**
 * Attach a minimal public last-attack/Item-lock summary to an ordinary
 * actor-only observation. No opponent concealed zone is read. The full
 * offline diagnostic remains separate from the policy input.
 * @param {object} state Genuine pinned Twinleaf State, read only.
 * @param {0|1} seat Physical actor seat.
 * @param {object} baseView Detached ordinary actor observation.
 * @returns {object} Detached actor view with a narrow Budew opportunity.
 */
function observePublicBudewItemLock(state, seat, baseView) {
  if (!(seat === 0 || seat === 1) || state?.players?.length !== 2 ||
      !baseView || baseView.actorSeat !== seat) {
    return baseView;
  }
  const owner = state.players[seat];
  const opponent = state.players[1 - seat];
  const lastAttack = state.playerLastAttack?.[opponent.id] ?? null;
  const source = lastAttack?.sourceCard ?? null;
  const attack = lastAttack?.attack ?? null;
  const itemLockActive = owner?.cannotPlayItemCards === true &&
    Number(owner.playLocksTurnsRemaining) > 0;
  const sourceIsBudew = source?.name === 'Budew' &&
    attack?.name === ITEM_LOCK_ATTACK;
  const active = itemLockActive && sourceIsBudew;
  const ownerSafe = active && !playerWouldLoseOtherAttackEffects(owner, {
    allowBudewItemLock: true,
    budewSource: source
  });
  const opponentSafe = active && !playerWouldLoseOtherAttackEffects(opponent);
  const opportunity = Object.freeze({
    active,
    safeToClear: ownerSafe && opponentSafe,
    sourcePrinting: typeof source?.fullName === 'string' ? source.fullName : null,
    attackName: typeof attack?.name === 'string' ? attack.name : null,
    ownerLockTurns: itemLockActive ? owner.playLocksTurnsRemaining : 0
  });
  return Object.freeze({
    ...baseView,
    budewRangerOpportunity: opportunity
  });
}

function opponentAbilityTextLocksItemOrSupporter(view) {
  const opponent = view?.opponentPublic ?? {};
  const board = [opponent.active, ...(opponent.bench ?? [])].filter(Boolean);
  return board.some(pokemon => {
    if (pokemon.abilities?.includes('Sentinel')) return true;
    if (pokemon.printing?.includes('Vileplume AOR') &&
        pokemon.abilities?.includes('Irritating Pollen')) return true;
    const text = (pokemon.abilityDetails ?? [])
      .map(detail => String(detail?.text ?? '')).join('\n');
    return /(?:can't|cannot)\s+play\s+(?:item|supporter|trainer)\s+cards/i.test(text);
  });
}

/**
 * Default-off owner-root proposal. It is deliberately placed after other
 * supported roots by the shared selector, so it cannot preempt a higher
 * priority setup/Supporter decision.
 * @param {object} view Detached actor-only observation plus public opportunity.
 * @param {object} catalog Public printed-card catalog.
 * @returns {object|null} Native-neutral action proposal.
 */
function proposeRangerForBudewItemLock(view, catalog) {
  if (view?.decisionKind !== 'owner-root') return null;
  const opportunity = view.budewRangerOpportunity;
  if (opportunity?.active !== true || opportunity?.safeToClear !== true) return null;
  const resources = view.ownTurnResources ?? {};
  if (resources.itemPlayLocked !== true ||
      resources.supporterPlayLocked === true ||
      resources.supporterPlayedTurn !== 0 ||
      (view.ownPublic?.resolvingSupporter ?? []).length > 0) return null;
  if (opponentAbilityTextLocksItemOrSupporter(view)) return null;
  const hand = Array.isArray(view.ownHand) ? view.ownHand : [];
  const handIndex = hand.indexOf(RANGER);
  if (handIndex < 0) return null;
  const itemPrintings = catalog?.itemPrintings;
  if (!(itemPrintings instanceof Set) ||
      !hand.some(printing => itemPrintings.has(printing))) return null;
  return {
    kind: 'play-ranger-budew-item-lock',
    printing: RANGER,
    handIndex,
    source: VERSION,
    trigger: 'opponent-last-attack-Budew-Itchy-Pollen-item-lock'
  };
}

module.exports = {
  VERSION,
  RANGER,
  ITEM_LOCK_ATTACK,
  observePublicBudewItemLock,
  playerWouldLoseOtherAttackEffects,
  opponentAbilityTextLocksItemOrSupporter,
  proposeRangerForBudewItemLock
};
