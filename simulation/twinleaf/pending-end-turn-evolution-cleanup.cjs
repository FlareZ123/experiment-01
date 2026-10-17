'use strict';
const assert=require('node:assert/strict');

/**
 * Reversible experiment for queued attack effects whose actual target evolves.
 * Normal evolution removes existing attack effects on the evolving Pokemon.
 * The pinned Player.removePokemonEffects resets flags but does not prune the
 * delayed target entries; this hook only prunes entries referencing that exact
 * PokemonCardList object.
 *
 * @param {{Player:Function}} types
 */
function installPendingEndTurnEvolutionCleanup(types) {
  const desc=Object.getOwnPropertyDescriptor(types.Player.prototype,
    'removePokemonEffects');
  assert.equal(typeof desc?.value,'function');
  let removed=0;
  const events=[];
  const wrapped=function(target) {
    const result=desc.value.call(this,target);
    const queue=this.pendingEndOfTurnEffects||[];
    const dropped=queue.filter(e=>e.target===target);
    if(dropped.length) {
      this.pendingEndOfTurnEffects=queue.filter(e=>e.target!==target);
      removed+=dropped.length;
      events.push({playerId:this.id,count:dropped.length,
        attacks:dropped.map(e=>e.attack?.name||null)});
    }
    return result;
  };
  Object.defineProperty(types.Player.prototype,'removePokemonEffects',
    {...desc,value:wrapped});
  return {
    evidence:()=>({removed,events:[...events]}),
    restore:()=>{
      assert.equal(types.Player.prototype.removePokemonEffects,wrapped);
      Object.defineProperty(types.Player.prototype,'removePokemonEffects',desc);
    }
  };
}

/** @template T @param {{Player:Function}} types @param {()=>T} work */
function withPendingEndTurnEvolutionCleanup(types,work) {
  const installed=installPendingEndTurnEvolutionCleanup(types);
  try {
    const result=work();
    return {result,...installed.evidence()};
  } finally {
    installed.restore();
  }
}
module.exports={installPendingEndTurnEvolutionCleanup,
  withPendingEndTurnEvolutionCleanup};
