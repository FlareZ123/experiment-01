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
    // Pinned Night Watch queues its effect before it applies damage. Its
    // owner-facing prompt is mechanically attacker-selectable, but printed
    // Night Watch requires a RANDOM opposing-hand pair. The existing Agent12
    // unbiased position sampler avoids consulting concealed card identities.
    const {sampleUniformPositions} =
      require('../agent12-nightwatch-paper-random-chooser.cjs');
    result.promptTrace=[];
    for(let i=0;i<18;i++){
      const prompt=game.state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      const kind=prompt.constructor.name;
      const trace={kind,playerId:prompt.playerId??null};
      if(kind==='WaitPrompt'||kind==='ShowCardsPrompt'){
        game.dispatch(new ResolvePromptAction(prompt.id,null));
      }else if(kind==='ChooseCardsPrompt' &&
          prompt.playerId===ownerId &&
          prompt.cards===opponent.hand &&
          prompt.options?.isSecret===true &&
          prompt.options?.allowCancel===false &&
          prompt.options?.min===prompt.options?.max &&
          prompt.options?.min<=2){
        const count=prompt.options.min;
        const indices=sampleUniformPositions(
          opponent.hand.cards.length,count,
          'agent11-rank1-t20-nightwatch-20261109',
          JSON.stringify([game.state.turn,prompt.id]));
        const selection=indices.map(index=>opponent.hand.cards[index]);
        assert.equal(prompt.validate(selection,game.state),true);
        trace.opaqueHandIndices=indices;
        trace.concealedCardNamesReadForChoice=false;
        game.dispatch(new ResolvePromptAction(prompt.id,selection));
      }else if(kind==='ShuffleDeckPrompt'){
        const shuffleOwner=game.state.players.find(p=>p.id===prompt.playerId);
        assert.ok(shuffleOwner);
        const count=shuffleOwner.deck.cards.length;
        const permutation=sampleUniformPositions(count,count,
          'agent11-rank1-t20-nightwatch-shuffle',
          JSON.stringify([game.state.turn,prompt.id]));
        assert.equal(prompt.validate(permutation,game.state),true);
        trace.deckSize=count;
        game.dispatch(new ResolvePromptAction(prompt.id,permutation));
      }else if(kind==='ChoosePrizePrompt' &&
          prompt.playerId===ownerId &&
          prompt.options?.destination===source.hand &&
          prompt.options?.useOpponentPrizes===false &&
          Number.isInteger(prompt.options?.count)){
        const chosen=source.prizes.filter(slot=>slot.cards.length>0)
          .slice(0,prompt.options.count);
        assert.equal(chosen.length,prompt.options.count);
        assert.equal(prompt.validate(chosen,game.state),true);
        trace.opaquePrizeSlots=chosen.map(slot=>source.prizes.indexOf(slot));
        trace.concealedPrizeFacesReadForChoice=false;
        game.dispatch(new ResolvePromptAction(prompt.id,chosen));
      }else{
        trace.unresolved=true;
        result.promptTrace.push(trace);
        break;
      }
      trace.resolved=true;
      result.promptTrace.push(trace);
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
