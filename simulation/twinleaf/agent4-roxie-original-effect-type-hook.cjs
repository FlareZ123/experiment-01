'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p @returns {any} */
const native=p=>require(path.join(output,p));

/**
 * The pinned Roxie CEC+Koffing CEC path creates DiscardCardsEffect via
 * Object.create(DiscardCardsEffect.prototype), leaving constructor-only
 * effect.type undefined. Pinned Store auto-log calls effect.type.startsWith
 * before card execution and crashes. This reversible, exact-card-only
 * research adapter restores the omitted native enum type to the existing
 * Roxie-created event without changing its player, cards or target.
 * @template T
 * @param {()=>T} execute
 * @returns {T}
 */
function withRoxieTrainerDiscardType(execute){
  assert.equal(typeof execute,'function');
  const {Store}=native('game/store/store');
  const {DiscardCardsEffect,AttackEffects}=
    native('game/store/effects/attack-effects');
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'reduceEffect');
  assert.equal(typeof prior?.value,'function');
  function correctedReduce(state,effect,...args){
    if(effect instanceof DiscardCardsEffect&&
       effect.type===undefined&&
       effect.attackEffect?.trainerCard?.name==='Roxie'){
      effect.type=AttackEffects.DISCARD_CARD_EFFECT;
    }
    return prior.value.call(this,state,effect,...args);
  }
  Object.defineProperty(Store.prototype,'reduceEffect',
    {...prior,value:correctedReduce});
  try{return execute();}
  finally{
    assert.strictEqual(Store.prototype.reduceEffect,correctedReduce);
    Object.defineProperty(Store.prototype,'reduceEffect',prior);
  }
}
module.exports={withRoxieTrainerDiscardType};
