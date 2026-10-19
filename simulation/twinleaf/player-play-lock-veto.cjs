'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * A card-play veto using only the actor's own hand and public attack-lock
 * state. In the pinned engine the player-wide flags are set by effects
 * such as Shadow Rider Calyrex V's Shadow Mist. A switch does not clear them.
 *
 * @param {object} player
 * @param {object} proposedAction
 * @param {{superTrainer:number,superEnergy:number,stadium:number,specialEnergy:number}} enums
 * @returns {'stadium-lock'|'special-energy-lock'|null}
 */
function playerPlayLockVeto(player, proposedAction, enums) {
  if (proposedAction?.type !== 'PLAY_CARD_ACTION' ||
      proposedAction.id !== player.id) return null;
  const card = player.hand.cards[proposedAction.handIndex];
  if (!card) return null;
  if (player.cannotPlayStadiumCards &&
      card.superType === enums.superTrainer &&
      card.trainerType === enums.stadium) return 'stadium-lock';
  if (player.cannotPlaySpecialEnergyCards &&
      card.superType === enums.superEnergy &&
      card.energyType === enums.specialEnergy) return 'special-energy-lock';
  return null;
}

/**
 * Reversible owner-visible tactical guard for pinned Twinleaf.
 * The original SimpleTacticsAi iterates over tactics and calls isValidAction
 * for each proposed move; rejecting a lock-prohibited candidate lets later
 * tactics propose legal actions, without substituting a forced Pass.
 *
 * @template T
 * @param {0|1|null} seat null applies the same restriction to both actors
 * @param {()=>T} execute synchronous source-dealt match
 * @returns {{result:T,audit:{version:string,seat:number|null,rejections:object[]}}}
 */
function withPlayerPlayLockVeto(seat, execute) {
  assert.ok(seat === null || seat === 0 || seat === 1);
  assert.equal(typeof execute, 'function');
  const load = name => require(path.join(OUTPUT, name));
  const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');
  const {SuperType,TrainerType,EnergyType} = load('game/store/card/card-types');
  const {PlayStadiumTactic}=load('simple-bot/simple-tactics/play-stadium-tactic');
  const {PassTurnAction}=load('game/store/actions/game-actions');
  const originalDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const originalStadium=PlayStadiumTactic.prototype.useTactic;
  const original = SimpleTacticsAi.prototype.isValidAction;
  assert.equal(typeof original, 'function');
  const enums = {
    superTrainer: SuperType.TRAINER,
    superEnergy: SuperType.ENERGY,
    stadium: TrainerType.STADIUM,
    specialEnergy: EnergyType.SPECIAL
  };
  const rejections = [];
  const considered = [];
  const directProposals = [];
  const guardedStadium=function ownerStadiumRestriction(state,player) {
    const actorIndex=state.players.findIndex(p=>p.id===player.id);
    if ((seat===null || seat===actorIndex) && player.cannotPlayStadiumCards) {
      rejections.push({turn:state.turn,seat:actorIndex,
        reason:'stadium-tactic-held',card:null,actorId:player.id,
        proposedAction:'PlayStadiumTactic'});
      return undefined;
    }
    return originalStadium.call(this,state,player);
  };
  const guardedDecode=function ownerDirectActionGuard(state) {
    const proposal=originalDecode.call(this,state);
    const actorIndex=state.players.findIndex(p=>p.id===this.client?.id);
    if (actorIndex<0 || (seat!==null && seat!==actorIndex)) return proposal;
    const player=state.players[actorIndex];
    const reason=playerPlayLockVeto(player,proposal,enums);
    if (!reason) return proposal;
    directProposals.push({turn:state.turn,seat:actorIndex,reason,
      card:player.hand.cards[proposal.handIndex].fullName,
      actorId:player.id,proposedAction:proposal.type});
    // An illegal direct proposal cannot be dispatched. This conservative
    // last-resort guard ends the turn; stronger tactic selection is a
    // separate research question.
    return new PassTurnAction(player.id);
  };
  const adapted = function pinnedPlayLockOwnerVeto(state, action) {
    const actorIndex = state.players.findIndex(p=>p.id===this.client?.id);
    if (actorIndex>=0 && (seat===null || seat===actorIndex)) {
      const player=state.players[actorIndex];
      if (considered.length<160 && state.turn<=4) {
        const card=player.hand.cards[action?.handIndex];
        considered.push({turn:state.turn,seat:actorIndex,
          actionType:action?.type??null,card:card?.fullName??null,
          superType:card?.superType??null,trainerType:card?.trainerType??null,
          energyType:card?.energyType??null,
          stadiumLocked:player.cannotPlayStadiumCards,
          specialEnergyLocked:player.cannotPlaySpecialEnergyCards,
          lockTurns:player.playLocksTurnsRemaining});
      }
      const reason=playerPlayLockVeto(player,action,enums);
      if (reason) {
        rejections.push({turn:state.turn,seat:actorIndex,reason,
          card:player.hand.cards[action.handIndex].fullName,
          actorId:player.id,proposedAction:action.type});
        return false;
      }
    }
    return original.call(this,state,action);
  };
  SimpleTacticsAi.prototype.isValidAction = adapted;
  SimpleTacticsAi.prototype.decodeNextAction = guardedDecode;
  PlayStadiumTactic.prototype.useTactic = guardedStadium;
  try {
    const result=execute();
    return {result,audit:{version:'owner-visible-player-play-lock-v1',
      seat,rejections,considered,directProposals}};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.isValidAction,adapted);
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,guardedDecode);
    assert.equal(PlayStadiumTactic.prototype.useTactic,guardedStadium);
    SimpleTacticsAi.prototype.isValidAction = original;
    SimpleTacticsAi.prototype.decodeNextAction = originalDecode;
    PlayStadiumTactic.prototype.useTactic = originalStadium;
  }
}

module.exports={playerPlayLockVeto,withPlayerPlayLockVeto};
