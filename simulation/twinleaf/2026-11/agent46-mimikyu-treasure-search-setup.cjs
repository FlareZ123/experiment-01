'use strict';

const path=require('node:path');
const {installFogMimikyuSetup,ownerSetupWindow}=
  require('./agent46-mimikyu-fog-search-setup.cjs');

const OUTPUT=path.resolve(__dirname,
  '../../../vendor/twinleaf/ptcg-server/output');
const MIMIKYU='Mimikyu GRI';
const TREASURE='Mysterious Treasure FLI';
const DIALGA='Dialga-GX UPR';
const RADIANT='Radiant Eternatus CRZ';
let installed=null;

/**
 * Only owner's hand and public opponent board before the Item is played.
 * @param {object} state Native state.
 * @param {object} player Acting player.
 * @param {0|1} seat Owner physical seat.
 * @returns {number} Treasure's physical hand index or -1.
 */
function payableTreasureHandIndex(state,player,seat){
  if(!ownerSetupWindow(state,player,seat))return -1;
  if([player.active,...player.bench].some(slot=>
      slot.getPokemonCard()?.fullName===MIMIKYU)||
    player.hand.cards.some(card=>card.fullName===MIMIKYU)||
    player.discard.cards.some(card=>card.fullName===MIMIKYU))return -1;
  if(!player.hand.cards.some(card=>[DIALGA,RADIANT].includes(card.fullName))){
    return -1;
  }
  return player.hand.cards.findIndex(card=>card.fullName===TREASURE);
}

/**
 * Reuse the already-preserved Fog basic policy, then add owner-scoped
 * Mysterious Treasure as a preferred one-Item dual-axis tactic. Search the
 * deck only *after* native ChooseCardsPrompt exposes that owner's deck.
 *
 * @param {{seat:0|1,onEvent?:(event:object)=>void}} options
 * @returns {()=>void}
 */
function installTreasureMimikyuSetup({seat,onEvent}){
  if(![0,1].includes(seat))throw new RangeError('Expected physical seat 0 or 1');
  if(installed){
    if(installed.seat!==seat)throw new Error('Conflicting Treasure owner seat');
    return installed.restore;
  }
  const restoreFog=installFogMimikyuSetup({seat,onEvent});
  const {PlayCardAction,PlayerType,SlotType}=require(path.join(OUTPUT,
    'game/store/actions/play-card-action'));
  const {ResolvePromptAction}=require(path.join(OUTPUT,
    'game/store/actions/resolve-prompt-action'));
  const {PlayTrainerTactic}=require(path.join(OUTPUT,
    'simple-bot/simple-tactics/play-trainer-tactic'));
  const {ChooseCardsPromptResolver}=require(path.join(OUTPUT,
    'simple-bot/prompt-resolver/choose-cards-prompt-resolver'));
  const formerTrainer=PlayTrainerTactic.prototype.useTactic;
  const formerResolver=ChooseCardsPromptResolver.prototype.resolvePrompt;

  /** @param {string} kind @param {object} state @param {object} player @param {object} other */
  function note(kind,state,player,other={}){
    if(onEvent)onEvent({kind,seat,turn:state.turn,
      ownerHandNames:player.hand.cards.map(c=>c.fullName),...other});
  }

  function preferTreasure(state,player){
    const i=payableTreasureHandIndex(state,player,seat);
    if(i>=0){
      note('proposed-treasure',state,player,{handIndex:i});
      return new PlayCardAction(player.id,i,
        {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    }
    return formerTrainer.call(this,state,player);
  }

  function resolveTreasure(state,player,prompt){
    const owned=state.players[seat]?.id===player.id;
    const actualTreasure=owned&&player.supporter.cards.some(c=>
      c.fullName===TREASURE);
    const mimikyuNotExposed=[player.active,...player.bench].every(slot=>
      slot.getPokemonCard()?.fullName!==MIMIKYU)&&
      !player.hand.cards.some(card=>card.fullName===MIMIKYU)&&
      !player.discard.cards.some(card=>card.fullName===MIMIKYU);
    const eligible=actualTreasure&&mimikyuNotExposed&&
      ownerSetupWindow(state,player,seat)&&
      prompt?.playerId===player.id&&
      prompt?.constructor?.name==='ChooseCardsPrompt'&&
      prompt.options?.min<=1&&prompt.options?.max===1;
    if(eligible&&prompt.cards===player.hand&&
        prompt.message==='CHOOSE_CARD_TO_DISCARD'){
      const preferences=player.usedGX===true?
        [RADIANT,DIALGA]:[DIALGA,RADIANT];
      for(const preferred of preferences){
        const physical=prompt.cards.cards.find(card=>
          card.fullName===preferred);
        if(physical&&prompt.validate([physical])){
          note('selected-physical-treasure-discard',state,player,
            {printing:physical.fullName,promptId:prompt.id});
          return new ResolvePromptAction(prompt.id,[physical]);
        }
      }
    }
    if(eligible&&prompt.cards===player.deck&&
        prompt.message==='CHOOSE_CARD_TO_HAND'&&
        ownerSetupWindow(state,player,seat)){
      const index=prompt.cards.cards.findIndex(card=>card.fullName===MIMIKYU);
      if(index>=0&&!prompt.options?.blocked?.includes(index)){
        const physical=prompt.cards.cards[index];
        if(prompt.validate([physical])){
          note('selected-physical-treasure-mimikyu',state,player,
            {printing:physical.fullName,promptId:prompt.id});
          return new ResolvePromptAction(prompt.id,[physical]);
        }
      }
    }
    return formerResolver.call(this,state,player,prompt);
  }

  PlayTrainerTactic.prototype.useTactic=preferTreasure;
  ChooseCardsPromptResolver.prototype.resolvePrompt=resolveTreasure;

  function restore(){
    if(PlayTrainerTactic.prototype.useTactic===preferTreasure){
      PlayTrainerTactic.prototype.useTactic=formerTrainer;
    }
    if(ChooseCardsPromptResolver.prototype.resolvePrompt===resolveTreasure){
      ChooseCardsPromptResolver.prototype.resolvePrompt=formerResolver;
    }
    restoreFog();
    if(installed?.restore===restore)installed=null;
  }
  installed={seat,restore};
  return restore;
}
module.exports={MIMIKYU,TREASURE,DIALGA,RADIANT,
  payableTreasureHandIndex,installTreasureMimikyuSetup};
