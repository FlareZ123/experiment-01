'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent1-original-rank11-late-own-visible-source-roots-v1';

/**
 * Detached owner-visible decision context for posthoc analysis ONLY.
 * No opponent private cards, own remaining deck or Prize identities.
 *
 * @param {object} state Genuine pre-dispatch Twinleaf Store state.
 * @param {0|1} seat The original physical source seat.
 * @returns {object} Source-own/public-opponent snapshot.
 */
function sourceOwnVisibleSnapshot(state,seat){
  assert.ok(seat===0||seat===1);
  const own=state.players[seat];
  const opponent=state.players[1-seat];
  const pokemon=slot=>slot?.getPokemonCard?.()??null;
  const active=pokemon(own.active);
  const info=slot=>{
    const card=pokemon(slot);
    if(!card)return null;
    return {
      printing:card.fullName,
      energyCards:slot.energies?.cards?.map(c=>c.fullName)??[],
      toolCards:slot.tools?.map(c=>c.fullName)??[],
      damage:slot.damage??0
    };
  };
  return {
    sourceSeat:seat,turn:state.turn,
    sourceHand:own.hand.cards.map(c=>c.fullName),
    sourceActive:info(own.active),
    sourceActiveNativeAttackCosts:active?.attacks?.map(a=>({
      name:a.name,cost:[...(a.cost??[])],damage:a.damage??null
    }))??[],
    sourceBench:own.bench.map(info),
    opponentActive:info(opponent.active),
    sourceRemainingPrizes:own.prizes.filter(p=>p.cards.length>0).length,
    recipientRemainingPrizes:opponent.prizes.filter(p=>p.cards.length>0).length,
    paperClockCertified:false
  };
}

/**
 * Passive source own-hand/public-board snapshot at real owner decisions:
 * start of each requested source turn and immediately before source Pass.
 * Pure observation, installed reversibly. Never feeds an actor.
 *
 * @template T
 * @param {()=>T} execute Genuine pinned Store runner.
 * @param {{seat?:0|1,Store?:Function,startTurn?:number,endTurn?:number}} [options]
 * @returns {{result:T,audit:object}}
 */
function withLateSourceOwnState(execute,options={}){
  assert.equal(typeof execute,'function');
  const seat=options.seat??0;
  const start=options.startTurn??29;
  const end=options.endTurn??45;
  assert.ok(seat===0||seat===1);
  assert.ok(Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&
    start>0&&end>=start);
  const Store=options.Store??require(path.join(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const firstByTurn=new Map();
  const passes=[];
  function dispatch(action,...args){
    const state=this.state;
    const turn=state?.turn;
    const eligible=turn>=start&&turn<=end&&
      state?.activePlayer===seat&&
      Array.isArray(state?.prompts)&&
      !state.prompts.some(prompt=>prompt.result===undefined)&&
      state.players?.length===2;
    if(eligible){
      if(!firstByTurn.has(turn))firstByTurn.set(turn,
        sourceOwnVisibleSnapshot(state,seat));
      if(action?.constructor?.name==='PassTurnAction')
        passes.push(sourceOwnVisibleSnapshot(state,seat));
    }
    return original.value.apply(this,[action,...args]);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:dispatch});
  try{
    return {
      result:execute(),
      audit:{
        version:VERSION,
        seat,firstByTurn:[...firstByTurn.values()].sort((a,b)=>a.turn-b.turn),
        beforePass:passes,
        paperClockCertified:false,
        informationPolicy:'posthoc source own hand and own/public boards only',
        sourcePlayerDecisionUnaffected:true
      }
    };
  }finally{
    assert.equal(Store.prototype.dispatch,dispatch,
      'Original pinned Store dispatch unexpectedly overwritten');
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

module.exports={VERSION,sourceOwnVisibleSnapshot,withLateSourceOwnState};
