'use strict';

// Research-owned reversible correction for one pinned printing/modifier.
// Do not modify vendor/twinleaf. This is not a general attack damage engine.
const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=file=>require(path.join(output,file));
const VERSION='agent7-tinkaton-svp-press-dte-pinned-hook-v1';

/**
 * Correct the printed Double Turbo -20 for Tinkaton ex SVP's custom direct
 * Pulverizing Press reducer, whose original path bypasses DealDamageEffect.
 * Keep all other unmodified printed attacks on the original engine path.
 *
 * @param {object} manager Initialized pinned Twinleaf CardManager.
 * @returns {()=>void} Restore exact original reducer; call before next test.
 */
function installTinkatonDteHook(manager){
  const sample=manager.getCardByName('Tinkaton ex SVP');
  assert.ok(sample,'Pinned Tinkaton ex SVP must exist');
  // CardManager.getCardByName returns Object.create(poolCard); its immediate
  // prototype is one pool instance, not the shared Tinkatonex class prototype.
  const prototype=Object.getPrototypeOf(Object.getPrototypeOf(sample));
  assert.equal(prototype.constructor.name,'Tinkatonex');
  const previous=prototype.reduceEffect;
  assert.equal(typeof previous,'function');
  const {WAS_ATTACK_USED,IS_SPECIAL_ENERGY_BLOCKED}=
    load('game/store/prefabs/prefabs');
  const {ApplyWeaknessEffect,AfterDamageEffect}=
    load('game/store/effects/attack-effects');
  const {StateUtils}=load('game/store/state-utils');
  prototype.reduceEffect=function(store,state,effect){
    if(!WAS_ATTACK_USED(effect,1,this)){
      return previous.call(this,store,state,effect);
    }
    const attached=effect.player.active.cards.filter(card=>
      card.name==='Double Turbo Energy');
    const live=attached.filter(card=>
      !IS_SPECIAL_ENERGY_BLOCKED(store,state,effect.player,card,
        effect.player.active)).length;
    if(live===0)return previous.call(this,store,state,effect);

    const modified=Math.max(0,140-20*live);
    const applyWeakness=new ApplyWeaknessEffect(effect,modified);
    state=store.reduceEffect(state,applyWeakness);
    const damage=applyWeakness.damage;
    effect.damage=0;
    if(damage>0){
      StateUtils.getOpponent(state,effect.player).active.damage+=damage;
      state=store.reduceEffect(state,new AfterDamageEffect(effect,damage));
    }
    return state;
  };
  return ()=>{prototype.reduceEffect=previous;};
}

module.exports={VERSION,installTinkatonDteHook};
