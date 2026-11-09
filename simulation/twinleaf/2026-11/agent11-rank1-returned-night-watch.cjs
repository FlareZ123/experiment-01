'use strict';

const path = require('node:path');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');

const OUTPUT = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(OUTPUT, modulePath));

/**
 * Detached owner-only attempt after original rank1 Raihan / corrected Pale
 * Moon-GX, the genuine opponent Skyliner Retreat and its genuine Pass.
 * The native Store state is cloned and only cards physically in the source
 * owner's hand are eligible. The old opponent's hand is never consulted.
 *
 * @param {{state:object,ownerId:number,opponentId:number}} context
 * @returns {object}
 */
function executeReturnedNightWatch(context) {
  const { deepClone } = load('utils/utils');
  const { Store } = load('game/store/store');
  const { PlayCardAction, PlayerType, SlotType } =
    load('game/store/actions/play-card-action');
  const { AttackAction } = load('game/store/actions/game-actions');
  const { ResolvePromptAction } =
    load('game/store/actions/resolve-prompt-action');
  const { StateUtils } = load('game/store/state-utils');
  const { state, ownerId, opponentId } = context;
  const game = new Store({onStateChange() {}});
  game.state = deepClone(state);
  const source = game.state.players.find(p => p.id === ownerId);
  const opponent = game.state.players.find(p => p.id === opponentId);
  assert.ok(source && opponent, 'original physical player owners required');
  const remainingPrizes = p =>
    p.prizes.reduce((count, slot) => count + slot.cards.length, 0);
  const sourceStartEnergy = source.active.energies.cards.slice();
  const chosenEnergy = source.hand.cards.find(c =>
    c.fullName === 'Psychic Energy MEE');
  const result = {
    sourceOwnerId:ownerId, opponentId, sourceTurn:game.state.turn,
    opponentActive:opponent.active.getPokemonCard()?.fullName ?? null,
    sourceActive:source.active.getPokemonCard()?.fullName ?? null,
    stadium:StateUtils.getStadiumCard(game.state)?.fullName ?? null,
    energyBefore:sourceStartEnergy.map(c=>c.fullName),
    hasHeldThirdPsychic:Boolean(chosenEnergy),
    sourceRemainingPrizesBefore:remainingPrizes(source),
    sourceRemainingPrizesAfter:remainingPrizes(source),
    opponentRemainingPrizesBefore:remainingPrizes(opponent),
    sourceOwnerOnlyHandForChoice:true, noInsertedCards:true,
    status:'unattempted', attackAccepted:false,
    errors:[], unsettledPrompts:[]
  };
  const ownerTurn=game.state.players[game.state.activePlayer]?.id;
  if(ownerTurn!==ownerId ||
     result.sourceActive!=='Trevenant & Dusknoir-GX SMP' ||
     result.opponentActive!=='Girafarig LOT' ||
     result.stadium!=='Dimension Valley PHF' ||
     sourceStartEnergy.length!==2 ||
     !chosenEnergy) {
    result.status='original-owner-return-preconditions-not-met';
    return result;
  }
  try {
    const selectedIndex=source.hand.cards.indexOf(chosenEnergy);
    const beforeHandCount=source.hand.cards.length;
    game.dispatch(new PlayCardAction(ownerId, selectedIndex, {
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    result.energyAfter=source.active.energies.cards.map(c=>c.fullName);
    result.attachAccepted=true;
    result.physicalEnergyMoved=source.hand.cards.length===beforeHandCount-1 &&
      source.active.energies.cards.length===sourceStartEnergy.length+1 &&
      !source.hand.cards.includes(chosenEnergy) &&
      source.active.energies.cards.includes(chosenEnergy);
    const sourceBeforeAttack=remainingPrizes(source);
    result.opponentDamageBefore=opponent.active.damage;
    game.dispatch(new AttackAction(ownerId,'Night Watch'));
    result.attackAccepted=true;
    for(let i=0;i<12;i++){
      const pending=game.state.prompts.find(p=>p.result===undefined);
      if(pending?.constructor.name!=='WaitPrompt')break;
      game.dispatch(new ResolvePromptAction(pending.id,null));
    }
    result.opponentDamageAfter=opponent.active.damage;
    result.opponentActiveAfter=opponent.active.getPokemonCard()?.fullName??null;
    result.opponentDiscardedGirafarig=opponent.discard.cards.some(c=>
      c.fullName==='Girafarig LOT');
    result.sourceRemainingPrizesAfter=remainingPrizes(source);
    result.actualPrizeProgress=sourceBeforeAttack-remainingPrizes(source);
    result.unsettledPrompts=game.state.prompts
      .filter(p=>p.result===undefined).map(p=>p.constructor.name);
    result.status=result.unsettledPrompts.length===0?
      'native-night-watch-fully-settled':
      'native-night-watch-owner-prompt-pending';
    result.stateFingerprint=createHash('sha256').update(JSON.stringify({
      turn:game.state.turn,sourcePrizes:remainingPrizes(source),
      opponentActive:result.opponentActiveAfter,
      sourceEnergy:result.energyAfter,unsettled:result.unsettledPrompts
    })).digest('hex');
  } catch(error) {
    result.status='native-paid-attachment-or-night-watch-rejected';
    result.errors.push(String(error?.stack??error));
    result.unsettledPrompts=game.state.prompts
      .filter(p=>p.result===undefined).map(p=>p.constructor.name);
  }
  return result;
}

module.exports={executeReturnedNightWatch};
