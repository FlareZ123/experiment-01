'use strict';

const assert = require('node:assert/strict');

/** @param {object} player Source's public board only. */
function visibleBunnelbyBoard(player) {
  return {
    active:player.active.getPokemonCard()?.fullName??null,
    activeToolNames:player.active.tools.map(x=>x.fullName),
    activeEnergyCount:player.active.energies.cards.length,
    bench:player.bench.map(x=>x.getPokemonCard()?.fullName??null)
  };
}

/**
 * Observe actual root player prompt answers after TM Evolution's first attack.
 * All game-state information recorded is public or pertains to an authentic
 * prompt that is already addressed to the observed player.
 *
 * @template T
 * @param {Function} Store Pinned Store constructor.
 * @param {0|1} ownerSeat Source player seat.
 * @param {()=>T} execute Unchanged source-dealt match.
 * @returns {{result:T,events:object[],rootActionCount:number}}
 */
function withRank15BarragePromptWitness(Store,ownerSeat,execute) {
  assert.equal(typeof execute,'function');
  assert.ok(ownerSeat===0||ownerSeat===1);
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const events=[];
  let root=null,ordinal=0;
  function dispatch(action,...args) {
    const type=action?.constructor?.name??'UnknownAction';
    if(root===null&&type==='AddPlayerAction')root=this;
    const actual=this===root;
    const before=this.state;
    const owner=actual?before?.players?.[ownerSeat]:null;
    const prompt=owner?before.prompts.find(p=>p.result===undefined):null;
    const beforeBoard=owner?visibleBunnelbyBoard(owner):null;
    const qualifies=actual&&owner&&before.turn===16 &&
      beforeBoard.active==='Bunnelby PRC' &&
      beforeBoard.bench.filter(x=>x==='Gloom UNB').length===2 &&
      ['ResolvePromptAction','AttackAction','PassTurnAction'].includes(type);
    const isOwned=qualifies&&prompt?.playerId===owner.id;
    const response=type==='ResolvePromptAction'&&isOwned?(() => {
      const v=action.result;
      if(v===null||['boolean','number','string'].includes(typeof v))return v;
      if(v?.name)return v.name;
      if(Array.isArray(v))return v.map(x=>x.fullName??x.name??null);
      return '[structured response]';
    })():null;
    const returned=descriptor.value.call(this,action,...args);
    if(actual)ordinal++;
    if(qualifies){
      const next=this.state;
      events.push({
        rootOrdinal:ordinal,turnBefore:before.turn,turnAfter:next.turn,
        actionType:type,actorIsOwner:action.playerId===owner.id,
        promptType:prompt?.constructor?.name??null,
        ownerPrompt:Boolean(isOwned),
        promptMessage:isOwned?prompt.message??null:null,
        ownerResponse:response,
        nextPendingPrompts:next.prompts.filter(p=>p.result===undefined)
          .map(p=>({type:p.constructor.name,belongsToOwner:p.playerId===owner.id})),
        boardBefore:beforeBoard,
        boardAfter:visibleBunnelbyBoard(next.players[ownerSeat])
      });
    }
    return returned;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:dispatch});
  try{return {result:execute(),events,rootActionCount:ordinal};}
  finally{Object.defineProperty(Store.prototype,'dispatch',descriptor);}
}
module.exports={visibleBunnelbyBoard,withRank15BarragePromptWitness};
