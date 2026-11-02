'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,withElectroRainPaperDamage}=require('../simulation/twinleaf/agent1-electro-rain-damage-hook.cjs');

test('reversible hook exposes explicit version and entrypoint',()=>{
  assert.equal(VERSION,'agent1-electro-rain-paper-damage-replacement-v1');
  assert.equal(typeof withElectroRainPaperDamage,'function');
});

test('Store hook translates native Electro Rain counter into attack damage',()=>{
  const {AttackEffect}=require('../vendor/twinleaf/ptcg-server/output/game/store/effects/game-effects');
  const {PutCountersEffect,PutDamageEffect}=require('../vendor/twinleaf/ptcg-server/output/game/store/effects/attack-effects');
  const {AlolanRaichu}=require('../vendor/twinleaf/ptcg-server/output/sets/08-sun-and-moon/set-unified-minds/alolan-raichu');
  const source={getPokemonCard:()=>({fullName:'Alolan Raichu UNM'})};
  const base=new AttackEffect({active:source},{},new AlolanRaichu().attacks[0]);
  const counter=new PutCountersEffect(base,30);
  counter.target={damage:0};
  class Store{reduceEffect(state,effect){assert.ok(effect instanceof PutDamageEffect);effect.target.damage+=effect.damage;return state;}}
  const original=Store.prototype.reduceEffect;
  const testStore=new Store();
  const outcome=withElectroRainPaperDamage(()=>testStore.reduceEffect({},counter),{Store});
  assert.equal(outcome.audit.correctedAttackDamageEffects,1);
  assert.equal(outcome.audit.actualDamageCounterDelta,30);
  assert.equal(Store.prototype.reduceEffect,original);
  assert.equal(base.ignoreWeakness,false);
});
