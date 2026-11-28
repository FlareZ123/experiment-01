'use strict';

/*
 * Pinned Twinleaf a9905a76 paper Expanded repair for Dialga-GX UPR100
 * Shred copied by Regidrago VSTAR (source ranks 10/12/13/14/18/20/21/27/32).
 * The original direct/shred 80 damage bypasses DealDamageEffect, and with it
 * the +20 of all nine source lists' attached Muscle Band XY121.
 *
 * Reversible, synchronous, opt-in, exact printed source/attack and fixed
 * modifier repair. No upstream files or canonical V3 fixtures are modified.
 * Full native Store execution is a distinct review/admission requirement.
 */

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent21-regidrago-dialga-shred-paper-damage-v1';
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const BANDING_PRINTING='Muscle Band XY';

function nonnegative(value,label) {
  assert.ok(Number.isFinite(value)&&value>=0,
    label+' must be finite and nonnegative');
  return value;
}

/**
 * Called only for native DialgaGX Shred (index 1). Also works when Twinleaf
 * copy-attack-delegation binds the source card's reduceEffect to a Regidrago
 * copycat: source/attached Tool are those of the ACTUAL Active attacker.
 */
function resolvePaperDialgaShred(card,store,state,effect,api) {
  const source=effect.source;
  assert.equal(source?.getPokemonCard?.(),card,
    'Dialga Shred source must match the actual attacking Pokémon');
  assert.equal(source,effect.player.active);
  const opponent=api.StateUtils.getOpponent(state,effect.player);
  assert.equal(opponent,effect.opponent);

  // Do not dispatch this as an actual damage effect: the native generic
  // damage path would re-apply target-side reductions and immunities Shred
  // explicitly ignores. Only the attached Muscle Band's own native reducer
  // is invoked on an effect probe, preserving Jamming Tower/Tool suppression.
  const probe=new api.DealDamageEffect(effect,
    nonnegative(effect.damage,'native Shred base damage'));
  assert.equal(probe.target,opponent.active);

  for(const tool of source.tools ?? []) {
    if(tool?.fullName===BANDING_PRINTING)
      state=tool.reduceEffect(store,state,probe);
  }

  let damage=nonnegative(probe.damage,'attacker Tool-modified damage');
  damage=Math.max(0,damage-nonnegative(
    source.attackDamageReductionNextTurn??0,'attacker pre-Weakness reduction'));
  damage+=nonnegative(
    source.outgoingAttackDamageBonusNextTurn??0,'attacker outgoing bonus');

  const weaken=new api.ApplyWeaknessEffect(effect,damage);
  state=store.reduceEffect(state,weaken);
  damage=nonnegative(weaken.damage,'native Weakness/Resistance result');
  damage=Math.max(0,damage-nonnegative(
    source.attackDamageReductionAfterWeaknessNextTurn??0,
    'attacker post-Weakness reduction'));

  // Native Shred already avoids the generic attack-damage path.
  effect.damage=0;
  if(damage>0) {
    opponent.active.damage+=damage;
    state=store.reduceEffect(state,new api.AfterDamageEffect(effect,damage));
  }
  return state;
}

/** Reversible one-synchronous-Store scope; never cross a Promise boundary. */
function withPaperRegidragoDialgaShred(work,injected={}) {
  assert.equal(typeof work,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(output,name));
  const DialgaGX=injected.DialgaGX ??
    load('sets/08-sun-and-moon/set-ultra-prism/dialga-gx').DialgaGX;
  const effects=injected.effects ?? load('game/store/effects/attack-effects');
  const prefabs=injected.prefabs ?? load('game/store/prefabs/prefabs');
  const api={
    DealDamageEffect:effects.DealDamageEffect,
    ApplyWeaknessEffect:effects.ApplyWeaknessEffect,
    AfterDamageEffect:effects.AfterDamageEffect,
    StateUtils:injected.StateUtils??load('game/store/state-utils').StateUtils
  };
  for(const k of ['DealDamageEffect','ApplyWeaknessEffect','AfterDamageEffect'])
    assert.equal(typeof api[k],'function','Pinned missing class '+k);
  assert.equal(typeof prefabs.WAS_ATTACK_USED,'function');
  const proto=DialgaGX?.prototype;
  const before=Object.getOwnPropertyDescriptor(proto??{},'reduceEffect');
  assert.equal(typeof before?.value,'function');
  assert.ok(before.writable||before.configurable,
    'Pinned Dialga reducer cannot be reversibly replaced');
  Object.defineProperty(proto,'reduceEffect',{
    ...before,value:function paperDialgaShred(store,state,effect) {
      if(!prefabs.WAS_ATTACK_USED(effect,1,this))
        return before.value.call(this,store,state,effect);
      return resolvePaperDialgaShred(this,store,state,effect,api);
    }
  });
  try{
    const value=work();
    assert.ok(!value||typeof value.then!=='function',
      'Do not await work inside temporary native-card hook');
    return value;
  } finally{
    Object.defineProperty(proto,'reduceEffect',before);
  }
}
module.exports={
  VERSION,ENGINE_PIN,BANDING_PRINTING,
  resolvePaperDialgaShred,withPaperRegidragoDialgaShred
};
