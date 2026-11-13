'use strict';

const path=require('node:path');
const OUTPUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const {installUnderworldMimikyuFocus}=
  require('./agent46-underworld-mimikyu-energy-focus.cjs');
const {facingVisibleRegidrago}=
  require('./agent46-mimikyu-fog-search-setup.cjs');
const {mimikyuCopycatReadiness}=
  require('../agent50-mimikyu-copycat-readiness.cjs');
const MIMIKYU='Mimikyu GRI';
let installed=null;

/**
 * Act only on owner-visible hand/bench and public opponent last attack.
 * @param {object} state Native State.
 * @param {object} player Acting candidate.
 * @param {0|1} seat Original rank1 physical seat.
 * @returns {{index:number,slot:object}|null}
 */
function ownedMimikyu(state,player,seat){
  if(state.players[seat]?.id!==player.id||
    !facingVisibleRegidrago(state,player))return null;
  const index=player.bench.findIndex(slot=>
    slot.getPokemonCard()?.fullName===MIMIKYU);
  return index<0?null:{index,slot:player.bench[index]};
}

/** @param {object} state @param {object} player @returns {boolean} */
function lastOpponentApex(state,player){
  const opponent=state.players.find(p=>p.id!==player.id);
  return Boolean(opponent&&
    state.playerLastAttack?.[opponent.id]?.attack?.name==='Apex Dragon');
}

/**
 * Reversible minimal owner policy to pay actual normal Psychic attachment,
 * choose native forced KO replacement or a legally evaluated normal retreat.
 * No direct mutation of game state or opponent hidden information.
 *
 * @param {{seat:0|1,onEvent?:(event:object)=>void}} options
 * @returns {()=>void}
 */
function installMimikyuFundAndPromote({seat,onEvent}){
  if(![0,1].includes(seat))throw new RangeError('Physical seat must be 0 or 1');
  if(installed){
    if(installed.seat!==seat)throw new Error('Conflicting Mimikyu fund owner seat');
    return installed.restore;
  }
  const restoreUnderworld=installUnderworldMimikyuFocus({seat,onEvent});
  const {PlayCardAction,PlayerType,SlotType}=require(path.join(OUTPUT,
    'game/store/actions/play-card-action'));
  const {RetreatAction}=require(path.join(OUTPUT,
    'game/store/actions/game-actions'));
  const {ResolvePromptAction}=require(path.join(OUTPUT,
    'game/store/actions/resolve-prompt-action'));
  const {EnergyCard}=require(path.join(OUTPUT,
    'game/store/card/energy-card'));
  const {EnergyType,CardType}=require(path.join(OUTPUT,
    'game/store/card/card-types'));
  const {AttachEnergyTactic}=require(path.join(OUTPUT,
    'simple-bot/simple-tactics/attach-energy-tactic'));
  const {RetreatTactic}=require(path.join(OUTPUT,
    'simple-bot/simple-tactics/retreat-tactic'));
  const {ChoosePokemonPromptResolver}=require(path.join(OUTPUT,
    'simple-bot/prompt-resolver/choose-pokemon-prompt-resolver'));
  const formerAttach=AttachEnergyTactic.prototype.useTactic;
  const formerRetreat=RetreatTactic.prototype.useTactic;
  const formerChoose=ChoosePokemonPromptResolver.prototype.resolvePrompt;

  function note(kind,state,player,details={}){
    if(onEvent)onEvent({kind,seat,turn:state.turn,
      ownerHandNames:player.hand.cards.map(x=>x.fullName),...details});
  }
  function ownerManualPsychic(state,player){
    const found=ownedMimikyu(state,player,seat);
    if(!found||mimikyuCopycatReadiness(state,player,seat,
        {slot:'bench',index:found.index}).status!=='not-payable'||
      player.energyPlayedTurn>=state.turn)
      return formerAttach.call(this,state,player);
    const i=player.hand.cards.findIndex(c=>c instanceof EnergyCard&&
      c.energyType===EnergyType.BASIC&&
      c.provides.includes(CardType.PSYCHIC));
    if(i<0)return formerAttach.call(this,state,player);
    const target={player:PlayerType.BOTTOM_PLAYER,
      slot:SlotType.BENCH,index:found.index};
    note('proposed-manual-psychic-to-mimikyu',state,player,
      {recipientBenchIndex:found.index,handIndex:i});
    return new PlayCardAction(player.id,i,target);
  }
  function chooseCopycatOnPromotion(state,player,prompt){
    const found=ownedMimikyu(state,player,seat);
    if(found&&mimikyuCopycatReadiness(state,player,seat,
        {slot:'bench',index:found.index}).status==='payable'&&
      lastOpponentApex(state,player)&&
      prompt?.playerId===player.id&&
      prompt?.constructor?.name==='ChoosePokemonPrompt'&&
      prompt.message==='CHOOSE_NEW_ACTIVE_POKEMON'&&
      prompt.slots?.includes(SlotType.BENCH)&&
      prompt.validate([found.slot],state)){
      note('proposed-funded-mimikyu-ko-promotion',state,player,
        {recipientBenchIndex:found.index,promptId:prompt.id});
      return new ResolvePromptAction(prompt.id,[found.slot]);
    }
    return formerChoose.call(this,state,player,prompt);
  }
  function promoteCopycatByRetreat(state,player){
    const found=ownedMimikyu(state,player,seat);
    if(!found||mimikyuCopycatReadiness(state,player,seat,
        {slot:'bench',index:found.index}).status!=='payable'||
      !lastOpponentApex(state,player)||
      player.retreatedTurn===state.turn||
      player.active.getPokemonCard()?.fullName===MIMIKYU)
      return formerRetreat.call(this,state,player);
    const action=new RetreatAction(player.id,found.index);
    const legalScore=this.evaluateAction(state,player.id,action);
    if(legalScore!==undefined){
      note('proposed-funded-mimikyu-retreat',state,player,
        {recipientBenchIndex:found.index});
      return action;
    }
    return formerRetreat.call(this,state,player);
  }
  AttachEnergyTactic.prototype.useTactic=ownerManualPsychic;
  ChoosePokemonPromptResolver.prototype.resolvePrompt=chooseCopycatOnPromotion;
  RetreatTactic.prototype.useTactic=promoteCopycatByRetreat;
  function restore(){
    if(AttachEnergyTactic.prototype.useTactic===ownerManualPsychic)
      AttachEnergyTactic.prototype.useTactic=formerAttach;
    if(ChoosePokemonPromptResolver.prototype.resolvePrompt===chooseCopycatOnPromotion)
      ChoosePokemonPromptResolver.prototype.resolvePrompt=formerChoose;
    if(RetreatTactic.prototype.useTactic===promoteCopycatByRetreat)
      RetreatTactic.prototype.useTactic=formerRetreat;
    restoreUnderworld();
    if(installed?.restore===restore)installed=null;
  }
  installed={seat,restore};
  return restore;
}
module.exports={MIMIKYU,ownedMimikyu,lastOpponentApex,
  installMimikyuFundAndPromote};
