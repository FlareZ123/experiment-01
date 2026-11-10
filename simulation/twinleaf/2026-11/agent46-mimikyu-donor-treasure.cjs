'use strict';

const path=require('node:path');
const OUTPUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const {installMimikyuFundAndPromote}=
  require('./agent46-mimikyu-fund-and-promote.cjs');
const {facingVisibleRegidrago}=
  require('./agent46-mimikyu-fog-search-setup.cjs');

const MIMIKYU='Mimikyu GRI';
const DIALGA='Dialga-GX UPR';
const TREASURE='Mysterious Treasure FLI';
let installed=null;

/**
 * The donor-discard opportunity is independent of whether Mimikyu already
 * occupies a Bench slot. Read only public opponent Pokémon, actual owner
 * in-play Pokémon, hand, discard and GX status. Never inspect owner deck or
 * concealed opponent zones before a legal search prompt.
 *
 * @param {object} state Actual native state.
 * @param {object} player Actual actor.
 * @param {0|1} seat Original rank1 candidate seat.
 * @returns {{handIndex:number,discardCard:object}|null} Physical owner cards.
 */
function ownerDonorTreasureOpportunity(state,player,seat){
  if(state.players[seat]?.id!==player.id||player.usedGX===true||
    !facingVisibleRegidrago(state,player)||
    ![player.active,...player.bench].some(slot=>
      slot.getPokemonCard()?.fullName===MIMIKYU)||
    player.discard.cards.some(card=>card.fullName===DIALGA))
    return null;
  const handIndex=player.hand.cards.findIndex(card=>
    card.fullName===TREASURE);
  const discardCard=player.hand.cards.find(card=>card.fullName===DIALGA);
  return handIndex>=0&&discardCard?{handIndex,discardCard}:null;
}

/**
 * Add an actor-only Mysterious Treasure donor discard choice to the existing
 * physical Mimikyu fund/promote policy. Every action is sent to the native
 * Store and printed card effect; no physical zones are mutated by this hook.
 *
 * @param {{seat:0|1,onEvent?:(event:object)=>void}} options
 * @returns {()=>void} Restore all native methods and parent policy.
 */
function installMimikyuDonorTreasure({seat,onEvent}){
  if(![0,1].includes(seat))throw new RangeError('Seat must be 0 or 1');
  if(installed){
    if(installed.seat!==seat)throw new Error('Conflicting donor owner seat');
    return installed.restore;
  }
  const restoreFund=installMimikyuFundAndPromote({seat,onEvent});
  const {PlayCardAction,PlayerType,SlotType}=require(path.join(OUTPUT,
    'game/store/actions/play-card-action'));
  const {ResolvePromptAction}=require(path.join(OUTPUT,
    'game/store/actions/resolve-prompt-action'));
  const {PlayTrainerTactic}=require(path.join(OUTPUT,
    'simple-bot/simple-tactics/play-trainer-tactic'));
  const {ChooseCardsPromptResolver}=require(path.join(OUTPUT,
    'simple-bot/prompt-resolver/choose-cards-prompt-resolver'));
  const previousTrainer=PlayTrainerTactic.prototype.useTactic;
  const previousResolver=ChooseCardsPromptResolver.prototype.resolvePrompt;

  function note(kind,state,player,fields={}){
    onEvent?.({kind,turn:state.turn,seat,
      ownerHandNames:player.hand.cards.map(x=>x.fullName),...fields});
  }

  function preferPhysicalDonorTreasure(state,player){
    const found=ownerDonorTreasureOpportunity(state,player,seat);
    if(found){
      note('proposed-donor-treasure-root',state,player,
        {handIndex:found.handIndex,discardPrinting:found.discardCard.fullName});
      return new PlayCardAction(player.id,found.handIndex,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      });
    }
    return previousTrainer.call(this,state,player);
  }

  function choosePhysicalDonorForTreasure(state,player,prompt){
    // The Treasure has left the hand by the time its payment prompt opens.
    // Re-check the actual physical donor without requiring a second Item.
    const donor=player.hand.cards.find(card=>card.fullName===DIALGA);
    const ownerTreasureInFlight=player.supporter.cards.some(card=>
      card.fullName===TREASURE);
    const eligible=state.players[seat]?.id===player.id&&
      player.usedGX!==true&&facingVisibleRegidrago(state,player)&&
      [player.active,...player.bench].some(slot=>
        slot.getPokemonCard()?.fullName===MIMIKYU)&&
      !player.discard.cards.some(card=>card.fullName===DIALGA);
    if(eligible&&donor&&ownerTreasureInFlight&&
      prompt?.constructor?.name==='ChooseCardsPrompt'&&
      prompt.playerId===player.id&&
      prompt.cards===player.hand&&
      prompt.message==='CHOOSE_CARD_TO_DISCARD'&&
      prompt.validate([donor])){
      note('resolved-physical-donor-treasure-payment',state,player,
        {promptId:prompt.id,printing:donor.fullName});
      return new ResolvePromptAction(prompt.id,[donor]);
    }
    return previousResolver.call(this,state,player,prompt);
  }

  PlayTrainerTactic.prototype.useTactic=preferPhysicalDonorTreasure;
  ChooseCardsPromptResolver.prototype.resolvePrompt=choosePhysicalDonorForTreasure;
  function restore(){
    if(PlayTrainerTactic.prototype.useTactic===preferPhysicalDonorTreasure)
      PlayTrainerTactic.prototype.useTactic=previousTrainer;
    if(ChooseCardsPromptResolver.prototype.resolvePrompt===choosePhysicalDonorForTreasure)
      ChooseCardsPromptResolver.prototype.resolvePrompt=previousResolver;
    restoreFund();
    if(installed?.restore===restore)installed=null;
  }
  installed={seat,restore};
  return restore;
}

module.exports={
  MIMIKYU,DIALGA,TREASURE,
  ownerDonorTreasureOpportunity,installMimikyuDonorTreasure
};
