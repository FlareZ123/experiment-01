'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent7-native-terminal-physical-predicates-v1';

/** @param {object} state Actual native Store.state (counts and public Pokémon). */
function physicalTerminalSnapshot(state){
  return {
    phase:state?.phase??null,turn:state?.turn??null,
    activePlayerSeat:state?.activePlayer??null,winnerSeat:state?.winner??null,
    sides:(state?.players??[]).map((p,seat)=>({
      seat,id:p.id,
      prizesRemaining:p.prizes.filter(s=>s.cards.length>0).length,
      deckRemaining:p.deck.cards.length,
      handCount:p.hand.cards.length,
      activePrinting:p.active.getPokemonCard()?.fullName??null,
      benchedPrintings:p.bench.map(s=>s.getPokemonCard()?.fullName??null),
      pokemonInPlay:Number(Boolean(p.active.getPokemonCard()))+
        p.bench.filter(s=>Boolean(s.getPokemonCard())).length
    }))
  };
}

/**
 * Reversible observer, recording the exact first real native FINISHED
 * transition and physical board/deck state. No decisions or effects change.
 * No claim of specific native terminal cause without native rule trace.
 *
 * @template T
 * @param {()=>T} execute Genuine synchronous pinned engine matches.
 * @param {{Store?:Function,GamePhase?:object}} [deps] Unit seam.
 * @returns {{result:T,audit:object}}
 */
function withNativeTerminalPhysicalPredicates(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const Phase=deps.GamePhase??require(path.join(base,'game/store/state/state')).GamePhase;
  const old=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof old?.value,'function');
  const gameIds=new WeakMap(),seen=new Set(),events=[];
  let nativeGames=0;
  function observed(action,...args){
    const kind=action?.constructor?.name??null;
    if(kind==='AddPlayerAction'&&!gameIds.has(this))
      gameIds.set(this,nativeGames++);
    const index=gameIds.get(this);
    const before=index!==undefined&&this.state?.phase!==Phase.FINISHED?
      physicalTerminalSnapshot(this.state):null;
    let success=false;
    try{
      const result=old.value.call(this,action,...args);
      success=true;
      return result;
    }finally{
      if(before&&this.state?.phase===Phase.FINISHED&&!seen.has(index)){
        seen.add(index);
        const after=physicalTerminalSnapshot(this.state);
        const winner=after.winnerSeat,loser=winner===0?1:winner===1?0:null;
        const losing=loser===null?null:after.sides[loser];
        const winning=winner===null?null:after.sides[winner];
        events.push({
          schema:VERSION,gameOrdinal:index,action:kind,
          actionOwnerId:action?.id??action?.clientId??null,
          nativeDispatchCompleted:success,before,after,
          compatibleTerminalPredicates:{
            winnerAllPrizesTaken:winning?.prizesRemaining===0,
            losingSideHasNoPokemon:losing?.pokemonInPlay===0,
            losingSideDeckEmpty:losing?.deckRemaining===0
          },
          exactEngineTerminalRuleEstablished:false,
          competitiveGameQualified:false
        });
      }
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...old,value:observed});
  try{
    const result=execute();
    return {result,audit:{schema:VERSION,observedGames:nativeGames,
      nativeTerminalTransitions:events.length,events,
      passive:true,competitiveGameQualified:false}};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observed);
    Object.defineProperty(Store.prototype,'dispatch',old);
  }
}
module.exports={VERSION,physicalTerminalSnapshot,
  withNativeTerminalPhysicalPredicates};
