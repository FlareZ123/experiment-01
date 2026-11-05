'use strict';

const assert=require('node:assert/strict');
const VERSION='agent37-seat-scoped-proposal-quota-neutrality-v1';

/**
 * Original intervention principle: Agent20's Store-confirmed Supporter
 * proposal-purity hook (research branch, 2026-11-03).
 * This factor variant changes a native proposal only for selected physical
 * seats. Nothing is applied to the upstream engine or opponent hidden state.
 * @template T
 * @param {()=>T} execute
 * @param {{Store:Function,PlaySupporterTactic:Function,PlayCardAction:Function,
 * TrainerCard:Function,TrainerType:object,GamePhase:object,correctSeats:(0|1)[]}} deps
 * @returns {{result:T,audit:object}}
 */
function withSeatScopedSupporterPurity(execute,deps){
  assert.equal(typeof execute,'function');
  const {Store,PlaySupporterTactic,PlayCardAction,TrainerCard,
    TrainerType,GamePhase,correctSeats}=deps;
  assert.ok(Array.isArray(correctSeats)&&
    correctSeats.every(seat=>seat===0||seat===1)&&
    new Set(correctSeats).size===correctSeats.length);
  const oldTactic=Object.getOwnPropertyDescriptor(
    PlaySupporterTactic.prototype,'useTactic');
  const oldStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldTactic?.value,'function');
  assert.equal(typeof oldStore?.value,'function');
  const byAction=new WeakMap();
  const audit={
    version:VERSION,correctSeats:[...correctSeats],
    realActorTacticCalls:0,quotaCorrections:0,
    realStoreAccepted:0,realStoreRejected:0,
    selected:[],competitiveQualifiedGames:0
  };
  let live=null;
  function tactic(state,player,...args){
    const genuine=live&&state===live.state&&
      state.phase===GamePhase.PLAYER_TURN&&
      correctSeats.includes(state.activePlayer)&&
      state.players[state.activePlayer]===player&&
      !state.prompts.some(prompt=>prompt.result===undefined);
    if(!genuine)return oldTactic.value.call(this,state,player,...args);
    audit.realActorTacticCalls++;
    const before=player.supporterTurn;
    const proposal=oldTactic.value.call(this,state,player,...args);
    const candidate=proposal instanceof PlayCardAction&&
      Number.isSafeInteger(proposal.handIndex)?
      player.hand.cards[proposal.handIndex]:null;
    if(before!==0||player.supporterTurn!==state.turn||
      !(candidate instanceof TrainerCard)||
      candidate.trainerType!==TrainerType.SUPPORTER)return proposal;
    player.supporterTurn=before;
    audit.quotaCorrections++;
    const row={seat:state.activePlayer,turn:state.turn,
      card:candidate.fullName,handIndex:proposal.handIndex,
      proposalQuotaBefore:before,proposalQuotaAfter:state.turn,
      dispatched:'not-yet',storeQuotaAfter:null};
    audit.selected.push(row);
    byAction.set(proposal,row);
    return proposal;
  }
  function storeDispatch(action,...args){
    const row=this===live?byAction.get(action):null;
    try{
      const result=oldStore.value.call(this,action,...args);
      if(!live&&action?.constructor?.name==='AddPlayerAction'&&
        this.state.players.length===1&&this.state.players[0].id===101)
        live=this;
      if(row){
        row.dispatched='real-Store-accepted';
        row.storeQuotaAfter=this.state.players[row.seat].supporterTurn;
        audit.realStoreAccepted++;
      }
      return result;
    }catch(error){
      if(row){
        row.dispatched='real-Store-rejected';
        row.error=String(error?.message??error);
        audit.realStoreRejected++;
      }
      throw error;
    }
  }
  Object.defineProperty(PlaySupporterTactic.prototype,'useTactic',
    {...oldTactic,value:tactic});
  Object.defineProperty(Store.prototype,'dispatch',
    {...oldStore,value:storeDispatch});
  try{
    return {result:execute(),audit};
  }catch(error){
    error.agent37SeatFactorAudit=audit;
    throw error;
  }finally{
    Object.defineProperty(Store.prototype,'dispatch',oldStore);
    Object.defineProperty(PlaySupporterTactic.prototype,'useTactic',oldTactic);
  }
}
module.exports={VERSION,withSeatScopedSupporterPurity};
