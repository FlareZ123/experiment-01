'use strict';
const assert=require('node:assert/strict');

/**
 * Reversible experimental fix for delayed attack effects that remain in the
 * defending player's pendingEndOfTurnEffects after the target leaves Active.
 * A Pokémon moving to the Bench loses attack effects under the paper rules.
 *
 * This handles the direct Player.switchPokemon path. Devolution, evolution,
 * recovery and other state transitions are not yet audited.
 *
 * @template T
 * @param {{Store:Function,Player:Function}} types
 * @param {()=>T} work
 * @returns {{result:T,removedFromRoot:number,removedFromSimulatedStores:number,rootEvents:object[]}}
 */
function withPendingEndTurnSwitchCleanup(types,work) {
  const {Store,Player}=types;
  const storeDesc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const playerDesc=Object.getOwnPropertyDescriptor(Player.prototype,'switchPokemon');
  assert.equal(typeof storeDesc?.value,'function');
  assert.equal(typeof playerDesc?.value,'function');
  let root=null,removedFromRoot=0,removedFromSimulatedStores=0;
  const rootEvents=[];
  const dispatch=function(...args) {
    if(root===null && args[0]?.constructor?.name==='AddPlayerAction') root=this;
    return storeDesc.value.apply(this,args);
  };
  const switchPokemon=function(target,store,state) {
    const originalActive=this.active;
    const benchIndex=this.bench.indexOf(target);
    const result=playerDesc.value.call(this,target,store,state);
    if(benchIndex<0 || originalActive===this.active ||
      !Array.isArray(this.pendingEndOfTurnEffects)) return result;
    const toDrop=this.pendingEndOfTurnEffects.filter(effect=>effect.target===originalActive);
    if(toDrop.length===0) return result;
    this.pendingEndOfTurnEffects=this.pendingEndOfTurnEffects.filter(effect=>
      effect.target!==originalActive);
    if(store===root) {
      removedFromRoot+=toDrop.length;
      rootEvents.push({playerId:this.id,benchIndex,
        effectsRemoved:toDrop.map(effect=>({
          type:effect.type,attack:effect.attack?.name??null,
          source:effect.sourceCard?.fullName??null
        }))});
    } else {
      removedFromSimulatedStores+=toDrop.length;
    }
    return result;
  };
  Object.defineProperty(Store.prototype,'dispatch',{...storeDesc,value:dispatch});
  Object.defineProperty(Player.prototype,'switchPokemon',{...playerDesc,value:switchPokemon});
  let result;
  try {result=work();}
  finally {
    Object.defineProperty(Player.prototype,'switchPokemon',playerDesc);
    Object.defineProperty(Store.prototype,'dispatch',storeDesc);
  }
  return {result,removedFromRoot,removedFromSimulatedStores,rootEvents};
}
module.exports={withPendingEndTurnSwitchCleanup};
