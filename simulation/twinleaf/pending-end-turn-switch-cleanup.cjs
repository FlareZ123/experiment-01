'use strict';
const assert=require('node:assert/strict');

/**
 * Install a reversible paper-rules experiment: discard queued delayed attack
 * effects targeting the former Active when it moves to the Bench.
 *
 * The pinned engine preserves the queue for Pale Moon-GX across retreat.
 * This hook covers Player.switchPokemon and does not claim other transitions.
 * The first Store AddPlayerAction identifies the authentic game Store.
 *
 * @param {{Store:Function,Player:Function}} types Pinned compiled constructors.
 * @returns {{restore:()=>void,evidence:()=>{removedFromRoot:number,removedFromSimulatedStores:number,rootEvents:object[]}}}
 */
function installPendingEndTurnSwitchCleanup(types) {
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
  return {
    evidence:()=>({removedFromRoot,removedFromSimulatedStores,rootEvents:[...rootEvents]}),
    restore:()=>{
      assert.equal(Player.prototype.switchPokemon,switchPokemon,
        'Pending end-turn cleanup lost Player.switchPokemon ownership');
      assert.equal(Store.prototype.dispatch,dispatch,
        'Pending end-turn cleanup lost Store.dispatch ownership');
      Object.defineProperty(Player.prototype,'switchPokemon',playerDesc);
      Object.defineProperty(Store.prototype,'dispatch',storeDesc);
    }
  };
}

/**
 * Callback-scoped form used by the existing frozen source replay experiment.
 * All public diagnostics and existing source semantics are preserved.
 *
 * @template T
 * @param {{Store:Function,Player:Function}} types
 * @param {()=>T} work
 * @returns {{result:T,removedFromRoot:number,removedFromSimulatedStores:number,rootEvents:object[]}}
 */
function withPendingEndTurnSwitchCleanup(types,work) {
  const installed=installPendingEndTurnSwitchCleanup(types);
  try {
    const result=work();
    return {result,...installed.evidence()};
  } finally {
    installed.restore();
  }
}
module.exports={installPendingEndTurnSwitchCleanup,withPendingEndTurnSwitchCleanup};
