'use strict';
const assert=require('node:assert/strict');
/** @param {object} state @param {object} effect */
function publicEffectName(state,effect){
  assert.ok(state&&effect);
  return {
    effectType:effect.constructor?.name??'Unknown',
    attackName:effect.attack?.name??null,
    numericDamage:Number.isFinite(effect.damage)?effect.damage:null
  };
}
module.exports={publicEffectName};
