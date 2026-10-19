'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Check only the actor's visible hand card and their live, player-level play
 * locks. A clone-based legality forecast remains responsible for other rules.
 * The return value describes a prohibited proposed action, never a win result.
 *
 * @param {object} state Current live pinned Store state.
 * @param {object} action Proposed pinned game action.
 * @param {object} enums Pinned SuperType, TrainerType and EnergyType values.
 * @returns {object|null} Owner-observable rejection evidence.
 */
function blockedHandPlay(state, action, enums) {
  if (action?.type !== 'PLAY_CARD_ACTION') return null;
  const owner = state.players.find(player => player.id === action.id);
  const card = owner?.hand.cards[action.handIndex];
  if (!card) return null;
  const {SuperType, TrainerType, EnergyType} = enums;
  let reason = null;
  if (card.superType === SuperType.TRAINER) {
    if (card.trainerType === TrainerType.ITEM && owner.cannotPlayItemCards) {
      reason = 'cannotPlayItemCards';
    } else if (card.trainerType === TrainerType.SUPPORTER &&
               owner.cannotPlaySupporterCards) {
      reason = 'cannotPlaySupporterCards';
    } else if (card.trainerType === TrainerType.STADIUM &&
               owner.cannotPlayStadiumCards) {
      reason = 'cannotPlayStadiumCards';
    } else if (card.trainerType === TrainerType.TOOL &&
               owner.cannotPlayToolCards) {
      reason = 'cannotPlayToolCards';
    }
  } else if (card.superType === SuperType.ENERGY) {
    if (owner.cannotPlayEnergyCards) {
      reason = 'cannotPlayEnergyCards';
    } else if (card.energyType === EnergyType.SPECIAL &&
               owner.cannotPlaySpecialEnergyCards) {
      reason = 'cannotPlaySpecialEnergyCards';
    }
  }
  return reason ? {actorId:owner.id,turn:state.turn,
    printedCard:card.fullName,reason} : null;
}

/**
 * Apply the same owner-visible hand-play veto to every pinned bot seat.
 * Patching the bot's isValidAction makes its existing tactic ordering resume
 * naturally at the next legal proposal, without forcing a Pass or editing
 * post-selection actions. Store, vendor and printed rules remain untouched.
 *
 * @template T
 * @param {()=>T} execute Synchronous headless match.
 * @param {{BotClass?:Function,enums?:object}} [dependencies] Pure-test seam.
 * @returns {{result:T,policyAudit:object}}
 */
function withOwnerVisiblePlayLockGuard(execute, dependencies={}) {
  const BotClass = dependencies.BotClass ??
    require(path.join(output, 'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const enums = dependencies.enums ??
    require(path.join(output, 'game/store/card/card-types'));
  const proto = BotClass.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'isValidAction');
  const original = proto.isValidAction;
  if (typeof original !== 'function') {
    throw new TypeError('Pinned bot must expose isValidAction');
  }
  const events = [];
  function guarded(state, action) {
    const denied = blockedHandPlay(state, action, enums);
    if (denied) {
      events.push(denied);
      return false;
    }
    return original.call(this, state, action);
  }
  Object.defineProperty(proto, 'isValidAction',
    {value:guarded,writable:true,configurable:true});
  try {
    const result=execute();
    return {result, policyAudit: {
      version:'owner-visible-player-hand-lock-guard-v1',
      rejectedProposals:events.length,events,
      informationBoundary:'only proposed action, owner hand and live player locks',
      certifiedCompetitivePolicy:false
    }};
  } finally {
    if (proto.isValidAction !== guarded) {
      throw new Error('Owner-visible play-lock guard lost bot method ownership');
    }
    if (descriptor) {
      Object.defineProperty(proto, 'isValidAction', descriptor);
    } else {
      delete proto.isValidAction;
    }
  }
}

module.exports={blockedHandPlay,withOwnerVisiblePlayLockGuard};
