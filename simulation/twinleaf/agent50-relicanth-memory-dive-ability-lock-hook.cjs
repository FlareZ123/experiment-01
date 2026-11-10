'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));

/**
 * Scoped paper fidelity correction for TEF84 Relicanth Memory Dive. The pinned
 * implementation checks Ability lock in its CheckTableStateEffect branch but
 * omits that check in its CheckPokemonAttacksEffect branch, incorrectly
 * granting prior-evolution attacks while its Basic Ability is suppressed.
 *
 * @template T
 * @param {()=>T} execute Synchronous, explicitly scoped experiment.
 * @param {object} [injected] Test dependencies, optional.
 * @returns {{result:T,audit:{blocked:number,allowed:number,restored:boolean}}}
 */
function withMemoryDiveLockGuard(execute,injected={}){
  assert.equal(typeof execute,'function');
  const Relicanth=injected.Relicanth??native(
    'sets/10-scarlet-and-violet/set-temporal-forces/relicanth').Relicanth;
  const CheckPokemonAttacksEffect=injected.CheckPokemonAttacksEffect??native(
    'game/store/effects/check-effects').CheckPokemonAttacksEffect;
  const IS_ABILITY_BLOCKED=injected.IS_ABILITY_BLOCKED??native(
    'game/store/prefabs/prefabs').IS_ABILITY_BLOCKED;
  const original=Object.getOwnPropertyDescriptor(Relicanth.prototype,'reduceEffect');
  assert.equal(typeof original?.value,'function');
  let blocked=0,allowed=0,restored=false;
  Object.defineProperty(Relicanth.prototype,'reduceEffect',{
    ...original,
    value:function(store,state,effect){
      if(effect instanceof CheckPokemonAttacksEffect){
        if(IS_ABILITY_BLOCKED(store,state,effect.player,this,
            this.powers?.find(p=>p.name==='Memory Dive'))){
          blocked++;
          return state;
        }
        allowed++;
      }
      return original.value.apply(this,arguments);
    }
  });
  let result;
  try{result=execute();}
  finally{
    Object.defineProperty(Relicanth.prototype,'reduceEffect',original);
    restored=Object.getOwnPropertyDescriptor(
      Relicanth.prototype,'reduceEffect').value===original.value;
  }
  return {result,audit:{blocked,allowed,restored}};
}

module.exports={withMemoryDiveLockGuard};
