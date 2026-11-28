'use strict';
const assert = require('node:assert/strict');

/**
 * Project only an already-public attack's impending KO on the exact native
 * PokemonCardList. No deck, hand, Prize, or arbitrary native effect is copied.
 * null means the engine's queue is missing, not proof that no threat exists.
 * This is a PUBLIC tactical fact, not a replacement for paper-correct
 * switch/evolution/devolution cleanup in the Store.
 */
function pendingPaleMoonGXKnockOut(player, slot) {
  const effects = player?.pendingEndOfTurnEffects;
  if (effects === undefined || effects === null) return null;
  assert.ok(Array.isArray(effects), 'Pale Moon public effect queue must be an array');
  return effects.some(effect => effect?.type === 'knock_out' &&
    effect?.attack?.name === 'Pale Moon-GX' && effect?.target === slot);
}

/**
 * A deliberately narrow actor-only real root choice: protect an Active
 * Pokemon with a known pending Pale Moon-GX KO by using the ONE offered
 * legal RetreatAction, ONLY when there is ONE occupied Bench target and
 * no offered attack. Other decisions remain the existing worker's job.
 * This returns a native token, not a forged action or a complete game policy.
 */
function choosePaleMoonEscapeRetreat(view, items) {
  if (view?.decisionKind !== 'owner-root' ||
      view?.ownPublic?.active?.publicRestrictions?.pendingPaleMoonGXKnockOut !== true ||
      !Array.isArray(items) ||
      items.some(item => !['pass','retreat'].includes(item?.kind))) return null;
  const benches = view.ownPublic.bench;
  if (!Array.isArray(benches)) return null;
  const occupied = benches.map((slot, index) => slot ? index : -1).filter(index => index >= 0);
  if (occupied.length !== 1) return null;
  const retreats = items.filter(item => item?.kind === 'retreat' &&
    item.publicMetadata?.targetSeat === 'actor' &&
    item.publicMetadata?.benchIndex === occupied[0] &&
    item.publicMetadata?.targetIndex === occupied[0] &&
    item.publicMetadata?.targetZone === 'bench' &&
    (typeof item.token === 'string' || Number.isSafeInteger(item.token)));
  if (retreats.length !== 1) return null;
  return { token: retreats[0].token, reason: 'PUBLIC_PALE_MOON_PENDING_KO_SINGLE_LEGAL_RETREAT' };
}


/**
 * A second, distinct complete no-prompt paper reply for a source printing
 * held by Hood Shield but omitted by Lockbridge. Pinned Pokemon Ranger STS
 * calls removeAttackEffectsFromPlayerAndPokemon(), which clears the queued
 * delayed knock_out. Only a single offered native Ranger root versus Pass
 * qualifies; any additional tactical choice is left to a stronger policy.
 */
function choosePaleMoonEscapeRanger(view, items) {
  if (view?.decisionKind !== 'owner-root' ||
      view?.ownPublic?.active?.publicRestrictions?.pendingPaleMoonGXKnockOut !== true ||
      !Array.isArray(items) ||
      items.some(item => !['pass','play-card'].includes(item?.kind))) return null;
  const available = items.filter(item => item?.kind === 'play-card');
  if (available.length !== 1) return null;
  const ranger = available[0];
  if (ranger.actorPrinting !== 'Pokemon Ranger STS' ||
      !(typeof ranger.token === 'string' || Number.isSafeInteger(ranger.token))) return null;
  const resources = view.ownTurnResources;
  if (resources?.supporterPlayLocked !== false ||
      resources?.supporterPlayedTurn !== 0) return null;
  // Preserve any known continuing own Altered Creation-GX advantages.
  const own = view.ownPublic?.publicTurnRestrictions;
  if (own?.alteredCreationDamage !== false ||
      own?.usedAlteredCreation !== false) return null;
  return { token: ranger.token, reason: 'PUBLIC_PALE_MOON_PENDING_KO_ONLY_RANGER_ROOT' };
}

module.exports = {
  pendingPaleMoonGXKnockOut,
  choosePaleMoonEscapeRetreat,
  choosePaleMoonEscapeRanger
};
