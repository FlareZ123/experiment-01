'use strict';
const assert=require('node:assert/strict');

const VERSION='agent34-grI-energy-drive-paper-bypass-v1';
const PHASES=new Set(['ApplyWeaknessEffect','ApplyResistanceEffect']);

/**
 * Reversible, source-exact correction of the pinned native Energy Drive
 * Weakness/Resistance omission. Uses the observed real native damage reducer
 * phase, not numeric post-damage rollback, and preserves all existing printed
 * Energy-card arithmetic. Does not mutate the upstream submodule.
 *
 * The caller must provide the actual Store that owns the physical attack.
 * Every speculative/cloned Store, different printing and different attack
 * is deliberately excluded.
 *
 * @param {{Store:Function,rootStore:object}} types
 * @returns {{restore:()=>void,evidence:()=>object}}
 */
function installEnergyDrivePaperBypass(types){
  const {Store,rootStore}=types;
  assert.equal(typeof Store?.prototype?.reduceEffect,'function');
  assert.ok(rootStore instanceof Store);
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'reduceEffect');
  assert.equal(typeof prior?.value,'function');
  const events=[];
  function corrected(state,effect){
    const phase=effect?.constructor?.name;
    const context=effect?.attackEffect;
    const eligible=this===rootStore&&PHASES.has(phase)&&
      context?.attack?.name==='Energy Drive'&&
      context?.source?.getPokemonCard?.()?.fullName==='Tapu Lele-GX GRI';
    if(!eligible)return prior.value.call(this,state,effect);
    const saved={
      directWeakness:effect.ignoreWeakness,
      directResistance:effect.ignoreResistance,
      attackWeakness:context.ignoreWeakness,
      attackResistance:context.ignoreResistance
    };
    const applied={
      effectClass:phase,attackName:context.attack.name,
      sourcePrinting:context.source.getPokemonCard().fullName,
      ownerSeat:state.players.findIndex(p=>p===context.player),
      originallyIgnoredWeakness:saved.attackWeakness===true,
      originallyIgnoredResistance:saved.attackResistance===true
    };
    effect.ignoreWeakness=true;
    effect.ignoreResistance=true;
    context.ignoreWeakness=true;
    context.ignoreResistance=true;
    try{
      return prior.value.call(this,state,effect);
    }finally{
      effect.ignoreWeakness=saved.directWeakness;
      effect.ignoreResistance=saved.directResistance;
      context.ignoreWeakness=saved.attackWeakness;
      context.ignoreResistance=saved.attackResistance;
      events.push(applied);
    }
  }
  Object.defineProperty(Store.prototype,'reduceEffect',{...prior,value:corrected});
  let restored=false;
  return {
    evidence:()=>({version:VERSION,events:events.map(x=>({...x})),
      interceptedNativeDamagePhases:events.length,
      paperCheckedByPrintedSource:true,
      competitiveGameQualified:false}),
    restore:()=>{
      assert.equal(restored,false,'Hook already restored');
      assert.strictEqual(Store.prototype.reduceEffect,corrected);
      Object.defineProperty(Store.prototype,'reduceEffect',prior);
      restored=true;
    }
  };
}

/**
 * Scoped default-off hook for an actual pinned Store game.
 * @template T
 * @param {()=>T} execute
 * @param {{Store:Function,rootStore:object}} types
 * @returns {{result:T,audit:object}}
 */
function withEnergyDrivePaperBypass(execute,types){
  const hook=installEnergyDrivePaperBypass(types);
  try{
    const result=execute();
    return {result,audit:hook.evidence()};
  }finally{
    hook.restore();
  }
}
module.exports={VERSION,installEnergyDrivePaperBypass,withEnergyDrivePaperBypass};
