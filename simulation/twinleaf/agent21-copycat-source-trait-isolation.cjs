'use strict';

const path = require('node:path');

const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * During Mimikyu's Copycat attack, the copied attack's source Pokémon
 * contributes its attack effect. Its Pokémon-level powers (notably
 * Ω Barrage) do not become powers of Mimikyu. This reversible hook suppresses
 * only the source's Barrage flag while the native Copycat reducer runs.
 *
 * It does not change the source attack, its GX/copy metadata, attack payment,
 * or any other source power. The original power object is restored even if
 * the Store rejects the copied effect.
 *
 * @param {{onIsolation?:(event:object)=>void,onObserve?:(event:object)=>void}} [options] Optional test observers.
 * @returns {() => void} Restore the pinned reducer.
 */
function installMimikyuCopycatSourceTraitIsolationHook({onIsolation,onObserve}={}) {
  if (installed) return installed.restore;

  const { Mimikyu } = require(path.join(output,
    'sets/08-sun-and-moon/set-guardians-rising/mimikyu'));
  const { AttackEffect } = require(path.join(output,
    'game/store/effects/game-effects'));
  const { StateUtils } = require(path.join(output,'game/store/state-utils'));
  const original = Mimikyu.prototype.reduceEffect;

  /** @param {object} store @param {object} state @param {object} effect */
  function patchedReduceEffect(store,state,effect) {
    onObserve?.({
      effectType:effect?.constructor?.name??null,
      attackName:effect?.attack?.name??null,
      instanceOfAttackEffect:effect instanceof AttackEffect,
      receiverName:this.name??null,
      receiverFullName:this.fullName??null,
      sourcePokemonName:effect?.source?.getPokemonCard?.()?.name??null,
      sourcePokemonFullName:effect?.source?.getPokemonCard?.()?.fullName??null
    });
    if (!(effect instanceof AttackEffect)
        || effect.attack !== this.attacks[1]
        || effect.source?.getPokemonCard() !== this) {
      return original.call(this,store,state,effect);
    }

    const opponent=StateUtils.getOpponent(state,effect.player);
    const previous=state.playerLastAttack?.[opponent.id];
    const sourceCard=previous?.sourceCard;
    const barragePowers=Array.isArray(sourceCard?.powers)?
      sourceCard.powers.filter(power=>power.barrage===true):[];
    if(barragePowers.length===0)
      return original.call(this,store,state,effect);

    const originalValues=barragePowers.map(power=>power.barrage);
    onIsolation?.({sourceCardName:sourceCard.name??null,
      sourceCardFullName:sourceCard.fullName??null,
      previousAttackName:previous?.attack?.name??null,
      barragePowerCount:barragePowers.length});
    for(const power of barragePowers)power.barrage=false;
    try {
      return original.call(this,store,state,effect);
    } finally {
      barragePowers.forEach((power,index)=>{
        power.barrage=originalValues[index];
      });
    }
  }

  Mimikyu.prototype.reduceEffect=patchedReduceEffect;
  const restore=()=>{
    Mimikyu.prototype.reduceEffect=original;
    installed=null;
  };
  installed={restore};
  return restore;
}

module.exports={installMimikyuCopycatSourceTraitIsolationHook};
