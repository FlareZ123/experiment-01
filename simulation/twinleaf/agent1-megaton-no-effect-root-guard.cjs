'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const VERSION = 'agent1-megaton-paper-no-effect-root-guard-v1';

/**
 * Only the printed categories relevant to Megaton Blower are inspected:
 * a Stadium anywhere in play, opposing Pokemon Tools, or opposing Special
 * Energy. Hidden decks, Prize identities and opponent hands are unused.
 *
 * This is a conservative negative-only paper eligibility check. The genuine
 * Store must still validate all other play constraints and target effects.
 *
 * @param {object} state Genuine pinned Store state.
 * @param {object} action Native PlayCardAction.
 * @param {Function} PlayCardAction Pinned action class.
 * @param {number} specialEnergyType Pinned EnergyType.SPECIAL enum.
 * @returns {boolean} True only for a Megaton action proven to have no targets.
 */
function megatonProvablyNoEffect(state, action, PlayCardAction, specialEnergyType) {
  if (!(action instanceof PlayCardAction)) return false;
  const players = state?.players;
  if (!Array.isArray(players) || players.length !== 2) return false;
  const actorSeat = players.findIndex(p => p.id === action.id);
  if (actorSeat === -1) return false;
  const actor = players[actorSeat];
  const held = actor.hand?.cards?.[action.handIndex];
  if (held?.fullName !== 'Megaton Blower SSP') return false;
  if (players.some(p => p.stadium?.cards?.length > 0)) return false;
  const opponent = players[1 - actorSeat];
  for (const slot of [opponent.active, ...opponent.bench]) {
    if (!slot?.getPokemonCard?.()) continue;
    if (slot.tools?.length > 0) return false;
    if (slot.energies?.cards?.some(energy =>
      energy.energyType === specialEnergyType)) return false;
  }
  return true;
}

/**
 * Fail closed only for an exact, owner-held Megaton Blower action whose entire
 * printed effect has no eligible public object. Reversibly intercept the real
 * Store, before native dispatch can consume the Item. Never change upstream.
 *
 * @template T
 * @param {()=>T} run Synchronous native Store experiment.
 * @param {{Store?:Function,PlayCardAction?:Function,EnergyType?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withMegatonNoEffectRootGuard(run, deps = {}) {
  assert.equal(typeof run, 'function');
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const load = name => require(path.join(output, name));
  const Store = deps.Store ?? load('game/store/store').Store;
  const PlayCardAction = deps.PlayCardAction ??
    load('game/store/actions/play-card-action').PlayCardAction;
  const EnergyType = deps.EnergyType ??
    load('game/store/card/card-types').EnergyType;
  const before = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof before?.value, 'function');
  const audit = {version:VERSION,inspectedMegatonActions:0,
    rejectedProvenNoEffect:0,competitiveGameQualified:false};
  function guarded(action, ...args) {
    if (action instanceof PlayCardAction &&
        this.state?.players?.some(player =>
          player.id === action.id &&
          player.hand?.cards?.[action.handIndex]?.fullName ===
          'Megaton Blower SSP')) {
      audit.inspectedMegatonActions++;
      if (megatonProvablyNoEffect(
        this.state, action, PlayCardAction, EnergyType.SPECIAL)) {
        audit.rejectedProvenNoEffect++;
        throw new Error('PAPER_MEGATON_NO_EFFECT_TARGET');
      }
    }
    return before.value.call(this, action, ...args);
  }
  Object.defineProperty(Store.prototype, 'dispatch', {...before,value:guarded});
  try {
    return {result:run(),audit};
  } finally {
    assert.strictEqual(Store.prototype.dispatch, guarded);
    Object.defineProperty(Store.prototype, 'dispatch', before);
  }
}
module.exports={VERSION,megatonProvablyNoEffect,withMegatonNoEffectRootGuard};
