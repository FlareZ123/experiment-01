'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(output,name));

/**
 * Score only public opponent attack sources and owner's own hand.
 * @param {object} state
 * @param {object} owner
 * @returns {object|null}
 */
function ownerVisibleCarmineThreat(state,owner){
  const {GamePhase}=load('game/store/state/state');
  const {TrainerCard}=load('game/store/card/trainer-card');
  if(state.phase!==GamePhase.PLAYER_TURN||
     state.prompts.some(p=>p.result===undefined)||
     owner.supporterTurn!==0||owner.cannotPlaySupporterCards||
     owner.deck.cards.length===0)return null;
  const index=owner.hand.cards.findIndex(c=>c.fullName==='Carmine TWM');
  if(index<0)return null;
  const card=owner.hand.cards[index];
  if(!card.canPlay(null,state,owner))return null;
  const active=owner.active.getPokemonCard();
  if(!active)return null;
  const remainingHP=active.hp-owner.active.damage;
  if(remainingHP<=0)return null;
  const other=state.players.find(p=>p.id!==owner.id);
  if(!other)return null;
  const attacker=other.active.getPokemonCard()?.name;
  const direct=attacker==='Gengar & Mimikyu-GX';
  const copied=attacker==='Mewtwo & Mew-GX'&&(
    other.bench.some(x=>x.getPokemonCard()?.name==='Gengar & Mimikyu-GX')||
    other.discard.cards.some(x=>x.name==='Gengar & Mimikyu-GX'));
  if(!direct&&!copied)return null;
  const trainerCount=owner.hand.cards.filter(c=>c instanceof TrainerCard).length;
  if(50*trainerCount<remainingHP)return null;
  return {handIndex:index,trainerCount,remainingHP,attacker,
    sourceCard:card.fullName,printedBase:50*trainerCount};
}

/**
 * @template T
 * @param {()=>T} execute
 * @returns {{result:T,decisions:object[]}}
 */
function withAntiPoltergeistCarminePolicy(execute){
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {PassTurnAction}=load('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const old=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof old?.value,'function');
  const decisions=[];
  function next(state){
    const baseline=old.value.call(this,state);
    if(!(baseline instanceof PassTurnAction))return baseline;
    const owner=state.players[state.activePlayer];
    if(!owner||owner.id!==this.client?.id)return baseline;
    const threat=ownerVisibleCarmineThreat(state,owner);
    if(!threat)return baseline;
    decisions.push({turn:state.turn,physicalSeat:state.activePlayer,...threat});
    return new PlayCardAction(owner.id,threat.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{...old,value:next});
  try{return {result:execute(),decisions};}
  finally{Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',old);}
}
module.exports={ownerVisibleCarmineThreat,withAntiPoltergeistCarminePolicy};
