'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {PutCountersEffect,PutDamageEffect}=
  require(path.join(ROOT,'game/store/effects/attack-effects'));

const VERSION='agent1-electro-rain-paper-damage-replacement-v1';

/**
 * Repair precisely the source-printed UNM Alolan Raichu's Electro Rain
 * callback, which dispatches a PutCountersEffect despite its printed text
 * instructing attack DAMAGE. Use the same real Store action engine for the
 * replacement PutDamageEffect. Ability locks, Stadiums, damage prevention
 * and reductions remain subject to actual native reducers.
 *
 * This research hook corrects one known mismatch. It does NOT certify all
 * native card text, Energy payment, damage modifiers or copying semantics.
 *
 * @template T
 * @param {()=>T} execute
 * @param {{Store?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withElectroRainPaperDamage(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.join(ROOT,'game/store/store')).Store;
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'reduceEffect');
  assert.equal(typeof descriptor?.value,'function');
  const audit={
    version:VERSION,
    printedCard:'Alolan Raichu UNM',
    printedAttack:'Electro Rain',
    correctedAttackDamageEffects:0,
    offeredNominalDamage:0,
    actualDamageCounterDelta:0,
    actualNativePrevented:0,
    nativeEffectReductionErrors:0,
    replacements:[],
    paperMatchCertified:false
  };
  /** @param {object} state @param {object} effect */
  function reduction(state,effect,...rest){
    if(!(effect instanceof PutCountersEffect)||
      effect.attack?.name!=='Electro Rain'||
      effect.source?.getPokemonCard()?.fullName!=='Alolan Raichu UNM')
      return descriptor.value.call(this,state,effect,...rest);
    const damage=new PutDamageEffect(effect.attackEffect,effect.damage);
    damage.target=effect.target;
    damage.source=effect.source;
    const base=effect.attackEffect;
    assert.ok(base,'Real native Electro Rain must retain an AttackEffect');
    const originalWeakness=base.ignoreWeakness;
    const originalResistance=base.ignoreResistance;
    base.ignoreWeakness=true;
    base.ignoreResistance=true;
    const oldDamage=effect.target.damage;
    audit.correctedAttackDamageEffects++;
    audit.offeredNominalDamage+=effect.damage;
    try{
      const result=descriptor.value.call(this,state,damage,...rest);
      const delta=effect.target.damage-oldDamage;
      audit.actualDamageCounterDelta+=delta;
      if(delta===0)audit.actualNativePrevented++;
      audit.replacements.push({printedDamage:effect.damage,appliedDamage:delta,
        nativePreventDefault:damage.preventDefault===true});
      return result;
    }catch(error){
      audit.nativeEffectReductionErrors++;
      throw error;
    }finally{
      base.ignoreWeakness=originalWeakness;
      base.ignoreResistance=originalResistance;
    }
  }
  Object.defineProperty(Store.prototype,'reduceEffect',{...descriptor,value:reduction});
  try{return {result:execute(),audit};}
  finally{Object.defineProperty(Store.prototype,'reduceEffect',descriptor);}
}

module.exports={VERSION,withElectroRainPaperDamage};
