'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,ENGINE_PIN,BANDING_PRINTING,withPaperRegidragoDialgaShred}=
  require('../../simulation/twinleaf/agent21-regidrago-dialga-shred-paper-hook.cjs');

class DealDamageEffect {
  constructor(base,damage) {
    this.player=base.player;
    this.opponent=base.opponent;
    this.attack=base.attack;
    this.source=base.source;
    this.target=base.opponent.active;
    this.damage=damage;
  }
}
class ApplyWeaknessEffect {
  constructor(base,damage) {
    this.source=base.source;
    this.target=base.opponent.active;
    this.damage=damage;
  }
}
class AfterDamageEffect {
  constructor(base,damage) {
    this.source=base.source;
    this.target=base.opponent.active;
    this.damage=damage;
  }
}
class DialgaGX {
  constructor(){
    this.id=100;
    this.attacks=[
      {name:'Overclock',damage:0},
      {name:'Shred',damage:80},
      {name:'Timeless-GX',damage:150}
    ];
  }
  reduceEffect(store,state,effect) {
    state.nativeFallback=(state.nativeFallback??0)+1;
    if(effect.attack===this.attacks[2])effect.player.usedGX=true;
    return state;
  }
}
const effects={DealDamageEffect,ApplyWeaknessEffect,AfterDamageEffect};
const prefabs={WAS_ATTACK_USED:(effect,index,card)=>
  effect.attack===card.attacks[index]};
const StateUtils={getOpponent:(state,p)=>state.players.find(x=>x!==p)};
function fixture({seat=0,band=false,toolBlocked=false,weakness=1,
  sourceReduction=0,sourceBonus=0,postWeaknessReduction=0}={}) {
  const dialga=new DialgaGX();
  const opponent={active:{damage:0,weakness,
    damagePreventedByDefense:true, getPokemonCard:()=>({name:'Girafarig'})}};
  const owner={active:null,movedToActiveThisTurn:[],usedGX:false};
  const source={
    getPokemonCard:()=>dialga,tools:[],
    attackDamageReductionNextTurn:sourceReduction,
    outgoingAttackDamageBonusNextTurn:sourceBonus,
    attackDamageReductionAfterWeaknessNextTurn:postWeaknessReduction
  };
  if(band) {
    const muscleBand={
      fullName:'Muscle Band XY',
      reduceEffect(store,state,e) {
        if(!toolBlocked&&e instanceof DealDamageEffect &&
          e.source.tools.includes(this)&&e.target===e.opponent.active&&
          e.damage>0)e.damage+=20;
        return state;
      }
    };
    source.tools.push(muscleBand);
  }
  owner.active=source;
  const state={players:seat===0?[owner,opponent]:[opponent,owner],
    nativeFallback:0,afterDamage:[]};
  const store={reduceEffect(state,e) {
    if(e instanceof ApplyWeaknessEffect)e.damage*=e.target.weakness;
    if(e instanceof AfterDamageEffect)state.afterDamage.push(e.damage);
    return state;
  }};
  const effect={player:owner,opponent,source,
    attack:dialga.attacks[1],damage:80};
  return {dialga,owner,opponent,source,state,store,effect};
}
function wrap(callback) {
  return withPaperRegidragoDialgaShred(callback,{DialgaGX,effects,prefabs,StateUtils});
}
function run(options) {
  const f=fixture(options);
  const original=DialgaGX.prototype.reduceEffect;
  wrap(()=>f.dialga.reduceEffect(f.store,f.state,f.effect));
  assert.equal(DialgaGX.prototype.reduceEffect,original);
  assert.equal(f.effect.damage,0);
  return {damage:f.opponent.active.damage,events:f.state.afterDamage,
    delegated:f.state.nativeFallback};
}

test('pinned printing, baseline Shred and two seats',()=>{
  assert.equal(VERSION,'agent21-regidrago-dialga-shred-paper-damage-v1');
  assert.equal(ENGINE_PIN,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(BANDING_PRINTING,'Muscle Band XY');
  for(const seat of [0,1])
    assert.deepEqual(run({seat}),{damage:80,events:[80],delegated:0});
});
test('all-nine-field Muscle Band attachment gives +20 to active target',()=>{
  for(const seat of [0,1]){
    assert.deepEqual(run({seat,band:true}),
      {damage:100,events:[100],delegated:0});
    assert.equal(run({seat,band:true,toolBlocked:true}).damage,80);
  }
});
test('copycat Regidrago source with cloned Shred uses its own attached Tool',()=>{
  for(const seat of [0,1]){
    const f=fixture({seat,band:true});
    const regidrago={id:909,name:'Regidrago VSTAR',attacks:
      f.dialga.attacks.map(a=>({...a}))};
    f.source.getPokemonCard=()=>regidrago;
    f.effect.attack=regidrago.attacks[1];
    const original=DialgaGX.prototype.reduceEffect;
    const result=wrap(()=>DialgaGX.prototype.reduceEffect.call(
      regidrago,f.store,f.state,f.effect));
    assert.equal(result,f.state);
    assert.equal(f.opponent.active.damage,100);
    assert.equal(f.effect.damage,0);
    assert.equal(DialgaGX.prototype.reduceEffect,original);
  }
});
test('attack-source modifiers are before weakness, defending protections bypassed',()=>{
  const r=run({band:true,sourceReduction:40,sourceBonus:20,
    weakness:2,postWeaknessReduction:10});
  assert.deepEqual(r,{damage:150,events:[150],delegated:0});
  assert.deepEqual(run({band:true,sourceReduction:500}),
    {damage:0,events:[],delegated:0});
});
test('Timeless-GX and Overclock use original reducer untouched',()=>{
  const f=fixture({band:true});
  const original=DialgaGX.prototype.reduceEffect;
  f.effect.attack=f.dialga.attacks[2];f.effect.damage=150;
  wrap(()=>f.dialga.reduceEffect(f.store,f.state,f.effect));
  assert.equal(f.owner.usedGX,true);
  assert.equal(f.effect.damage,150);
  f.effect.attack=f.dialga.attacks[0];f.effect.damage=0;
  wrap(()=>f.dialga.reduceEffect(f.store,f.state,f.effect));
  assert.equal(f.state.nativeFallback,2);
  assert.equal(DialgaGX.prototype.reduceEffect,original);
});
test('source cannot be fabricated; no opponent damage on invalid actor',()=>{
  const f=fixture({band:true});
  f.source.getPokemonCard=()=>null;
  assert.throws(()=>wrap(()=>f.dialga.reduceEffect(
    f.store,f.state,f.effect)),/actual attacking Pokémon/);
  assert.equal(f.opponent.active.damage,0);
});
test('reversible prototype after normal work, throws, and async return',()=>{
  const original=Object.getOwnPropertyDescriptor(
    DialgaGX.prototype,'reduceEffect');
  assert.equal(wrap(()=>42),42);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    DialgaGX.prototype,'reduceEffect'),original);
  assert.throws(()=>wrap(()=>{throw Error('fixture failure')}),/fixture failure/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    DialgaGX.prototype,'reduceEffect'),original);
  assert.throws(()=>wrap(()=>Promise.resolve(1)),/Do not await/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    DialgaGX.prototype,'reduceEffect'),original);
});
test('other attached Tools never receive speculative value',()=>{
  const f=fixture();
  f.source.tools=[{fullName:'Tool Unknown QRS',reduceEffect(){
    throw Error('must never execute');
  }}];
  wrap(()=>f.dialga.reduceEffect(f.store,f.state,f.effect));
  assert.equal(f.opponent.active.damage,80);
});
