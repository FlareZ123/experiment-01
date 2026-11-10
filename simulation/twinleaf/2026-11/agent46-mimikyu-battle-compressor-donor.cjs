'use strict';

const path=require('node:path');
const OUTPUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const {installMimikyuDonorTreasure}=
  require('./agent46-mimikyu-donor-treasure.cjs');
const {facingVisibleRegidrago}=
  require('./agent46-mimikyu-fog-search-setup.cjs');

const MIMIKYU='Mimikyu GRI',DIALGA='Dialga-GX UPR',
  COMPRESSOR='Battle Compressor PHF';
let installed=null;

/**
 * Owner-public opportunity; do not search concealed deck prematurely.
 * Require Mimikyu to be in play with Energy and the donor absent from all
 * exposed owner zones. A Prized donor may still make Compressor miss.
 * @param {object} state Actual native state.
 * @param {object} player Actual candidate player.
 * @param {0|1} seat Original source candidate seat.
 * @returns {number} Held physical Compressor index, or -1.
 */
function payableCompressorHandIndex(state,player,seat){
  if(state.players[seat]?.id!==player.id||player.usedGX===true||
    !facingVisibleRegidrago(state,player)||
    player.discard.cards.some(c=>c.fullName===DIALGA)||
    player.hand.cards.some(c=>c.fullName===DIALGA)||
    [player.active,...player.bench].some(slot=>
      slot.getPokemonCard()?.fullName===DIALGA)||
    ![player.active,...player.bench].some(slot=>
      slot.getPokemonCard()?.fullName===MIMIKYU&&
      slot.energies.cards.length>0))return -1;
  return player.hand.cards.findIndex(c=>c.fullName===COMPRESSOR);
}

/**
 * Reversible player-scoped native Item preference and genuine deck search.
 * Underlying donor Treasure, funding and promotion hooks stay installed.
 * @param {{seat:0|1,onEvent?:(event:object)=>void}} options
 * @returns {()=>void} Restore own and inherited hooks.
 */
function installMimikyuCompressorDonor({seat,onEvent}){
  if(![0,1].includes(seat))throw new RangeError('Invalid source seat');
  if(installed){
    if(installed.seat!==seat)throw new Error('Conflicting owner seat');
    return installed.restore;
  }
  const restoreParent=installMimikyuDonorTreasure({seat,onEvent});
  const {PlayCardAction,PlayerType,SlotType}=require(path.join(OUTPUT,
    'game/store/actions/play-card-action'));
  const {ResolvePromptAction}=require(path.join(OUTPUT,
    'game/store/actions/resolve-prompt-action'));
  const {PlayTrainerTactic}=require(path.join(OUTPUT,
    'simple-bot/simple-tactics/play-trainer-tactic'));
  const {ChooseCardsPromptResolver}=require(path.join(OUTPUT,
    'simple-bot/prompt-resolver/choose-cards-prompt-resolver'));
  const oldTrainer=PlayTrainerTactic.prototype.useTactic;
  const oldResolver=ChooseCardsPromptResolver.prototype.resolvePrompt;
  function note(kind,state,player,detail={}){
    onEvent?.({kind,turn:state.turn,seat,
      ownerHandNames:player.hand.cards.map(c=>c.fullName),...detail});
  }
  function rootItem(state,player){
    const index=payableCompressorHandIndex(state,player,seat);
    if(index>=0){
      note('proposed-donor-compressor-root',state,player,{index});
      return new PlayCardAction(player.id,index,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    }
    return oldTrainer.call(this,state,player);
  }
  function chooseDonor(state,player,prompt){
    // Only once the native Item has begun its actual deck-search prompt.
    const eligible=state.players[seat]?.id===player.id&&
      player.usedGX!==true&&facingVisibleRegidrago(state,player)&&
      !player.discard.cards.some(c=>c.fullName===DIALGA)&&
      !player.hand.cards.some(c=>c.fullName===DIALGA)&&
      [player.active,...player.bench].some(slot=>
        slot.getPokemonCard()?.fullName===MIMIKYU&&
        slot.energies.cards.length>0);
    const donor=player.deck.cards.find(c=>c.fullName===DIALGA);
    if(eligible&&donor&&
      player.supporter.cards.some(c=>c.fullName===COMPRESSOR)&&
      prompt?.constructor?.name==='ChooseCardsPrompt'&&
      prompt.playerId===player.id&&
      prompt.cards===player.deck&&
      prompt.message==='CHOOSE_CARD_TO_DISCARD'&&
      prompt.validate([donor])){
      note('resolved-physical-compressor-donor-search',state,player,
        {promptId:prompt.id,printing:donor.fullName});
      return new ResolvePromptAction(prompt.id,[donor]);
    }
    return oldResolver.call(this,state,player,prompt);
  }
  PlayTrainerTactic.prototype.useTactic=rootItem;
  ChooseCardsPromptResolver.prototype.resolvePrompt=chooseDonor;
  function restore(){
    if(PlayTrainerTactic.prototype.useTactic===rootItem)
      PlayTrainerTactic.prototype.useTactic=oldTrainer;
    if(ChooseCardsPromptResolver.prototype.resolvePrompt===chooseDonor)
      ChooseCardsPromptResolver.prototype.resolvePrompt=oldResolver;
    restoreParent();
    if(installed?.restore===restore)installed=null;
  }
  installed={seat,restore};
  return restore;
}
module.exports={
  MIMIKYU,DIALGA,COMPRESSOR,payableCompressorHandIndex,
  installMimikyuCompressorDonor
};
