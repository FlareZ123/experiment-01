'use strict';
const assert=require('node:assert/strict');

const VERSION='agent22-live-source-owner-turn-snapshot-v1';

/**
 * Record only real active-owner root starts, from one authenticated Store.
 * Uses the original live Store state reference; cannot observe detached
 * predictive states. Reads own private hand/discard and opponent public Prize
 * counts, never opponent hand/deck or own face-down Prize identities.
 *
 * @template T
 * @param {()=>T} work
 * @param {{Store:Function,SimpleTacticsAi:Function,GamePhase:object,
 *   sourceSeat:0|1}} deps
 * @returns {{result:T,audit:object}}
 */
function withLiveOwnerRootStarts(work,deps){
  assert.equal(typeof work,'function');
  const {Store,SimpleTacticsAi,GamePhase,sourceSeat}=deps;
  assert.ok(sourceSeat===0||sourceSeat===1);
  const oldDispatch=Store.prototype.dispatch;
  const oldDecode=SimpleTacticsAi.prototype.decodeNextAction;
  assert.equal(typeof oldDispatch,'function');
  assert.equal(typeof oldDecode,'function');
  let live=null;
  const seen=new Set(),snapshots=[];
  Store.prototype.dispatch=function(action,...rest){
    const result=oldDispatch.call(this,action,...rest);
    if(!live&&action.constructor.name==='AddPlayerAction'&&
       this.state.players.length===1&&this.state.players[0].id===101)
      live=this;
    return result;
  };
  SimpleTacticsAi.prototype.decodeNextAction=function(state,...rest){
    const player=state?.players?.[sourceSeat];
    const eligible=live&&state===live.state&&player&&
      this.client?.id===player.id&&state.activePlayer===sourceSeat&&
      state.phase===GamePhase.PLAYER_TURN&&
      !state.prompts.some(prompt=>prompt.result===undefined)&&
      !seen.has(state.turn);
    if(eligible){
      seen.add(state.turn);
      const opponent=state.players[1-sourceSeat];
      snapshots.push(Object.freeze({
        turn:state.turn,sourceSeat,
        handPrintings:Object.freeze(player.hand.cards.map(c=>c.fullName)),
        ownDiscardPrintings:Object.freeze(player.discard.cards.map(
          c=>c.fullName)),
        ownPrizesRemaining:player.prizes.filter(p=>p.cards.length>0).length,
        opponentPrizesRemaining:opponent.prizes.filter(
          p=>p.cards.length>0).length,
        opponentActivePrinting:opponent.active.getPokemonCard()?.fullName??null
      }));
    }
    return oldDecode.call(this,state,...rest);
  };
  try{
    const result=work();
    return {result,audit:Object.freeze({
      version:VERSION,authenticatedLiveStore:live!==null,
      snapshots:Object.freeze(snapshots)
    })};
  }finally{
    Store.prototype.dispatch=oldDispatch;
    SimpleTacticsAi.prototype.decodeNextAction=oldDecode;
  }
}

module.exports={VERSION,withLiveOwnerRootStarts};
