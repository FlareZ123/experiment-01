'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Suggest a printed Poffin only from the actor's own hand and public field.
 * This is an intentionally constrained mechanical test, not an all-game policy.
 * It never asks whether Oddish is physically in the hidden deck or in Prizes.
 *
 * @param {object} state Pinned State.
 * @param {object} owner The actual acting source owner.
 * @param {0|1} sourceSeat Physical rank-15 seat.
 * @param {number} turnPhase Pinned PLAYER_TURN enum.
 * @returns {number} Poffin owner-hand index or -1.
 */
function paidTmPoffinHandIndex(state,owner,sourceSeat,turnPhase){
  if(state.activePlayer!==sourceSeat||state.phase!==turnPhase||
      state.prompts.some(p=>p.result===undefined))return -1;
  if(owner.active.getPokemonCard()?.fullName!=='Bunnelby PRC')return -1;
  if(!owner.active.tools.some(t=>t.fullName==='Technical Machine: Evolution PAR')||
      owner.active.energies.cards.length===0)return -1;
  if(owner.bench.filter(slot=>!slot.getPokemonCard()).length===0)return -1;
  if(owner.bench.some(slot=>['Oddish UNB','Gloom UNB'].includes(
    slot.getPokemonCard()?.fullName)))return -1;
  return owner.hand.cards.findIndex(c=>c.fullName==='Buddy-Buddy Poffin TEF');
}

/**
 * Offer one native, strict-validated, actor-owned Poffin play at the
 * original paid-Bunnelby-TM decision point, while leaving all following
 * prompt choices to the existing pinned bot. A successful returned choice
 * must still be independently witnessed as a genuine root dispatch.
 *
 * @template T
 * @param {()=>T} execute Original-deal match execution.
 * @param {0|1} sourceSeat Physical source player seat.
 * @returns {{result:T,audit:object}}
 */
function withRank15PaidTmPoffin(execute,sourceSeat){
  assert.equal(typeof execute,'function');
  assert.ok(sourceSeat===0||sourceSeat===1);
  const {SimpleTacticsAi}=require(path.join(OUTPUT,
    'simple-bot/simple-tactics-ai'));
  const {PlayCardAction,PlayerType,SlotType}=require(path.join(OUTPUT,
    'game/store/actions/play-card-action'));
  const {GamePhase}=require(path.join(OUTPUT,'game/store/state/state'));
  const descriptor=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof descriptor?.value,'function');
  const expectedClientId=sourceSeat===0?101:202;
  const attempts=[];
  let offered=false;
  function choosePoffin(state){
    if(offered||this.client?.id!==expectedClientId)return descriptor.value.call(this,state);
    const owner=state.players[sourceSeat];
    const handIndex=paidTmPoffinHandIndex(
      state,owner,sourceSeat,GamePhase.PLAYER_TURN);
    if(handIndex<0)return descriptor.value.call(this,state);
    // This legality test may use the pinned Simulator. The attempt log is
    // corroborative only, never the evidence for a real root PlayCardAction.
    const action=new PlayCardAction(owner.id,handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    offered=true;
    const valid=this.isValidAction(state,action);
    attempts.push({
      turn:state.turn,handIndex,valid,
      active:owner.active.getPokemonCard()?.fullName,
      ownerHand:owner.hand.cards.map(c=>c.fullName),
      freeBench:owner.bench.filter(slot=>!slot.getPokemonCard()).length,
      candidateAction:'PlayCardAction Buddy-Buddy Poffin TEF',
      scope:'Candidate bot decision; root Store ledger must confirm a play'
    });
    return valid?action:descriptor.value.call(this,state);
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...descriptor,value:choosePoffin
  });
  try {
    return {
      result:execute(),
      audit:{
        schema:'rank15-retrospective-paid-tm-poffin-owner-action-v1',
        sourceSeat,attempts,
        method:'One owner-visible Poffin option, strict validator, natural subsequent prompts',
        competitivePolicyQualified:false
      }
    };
  }finally{
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',descriptor);
  }
}

module.exports={paidTmPoffinHandIndex,withRank15PaidTmPoffin};
