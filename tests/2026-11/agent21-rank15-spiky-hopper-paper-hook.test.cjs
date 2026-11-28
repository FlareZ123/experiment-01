'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION, ENGINE_PIN, resolvePaperSpikyHopper,
  withPaperRank15SpikyHopper
} = require('../../simulation/twinleaf/agent21-rank15-spiky-hopper-paper-hook.cjs');

class DealDamageEffect {
  constructor(base, damage) {
    this.source=base.source;
    this.target=base.opponent.active;
    this.player=base.player;
    this.opponent=base.opponent;
    this.attack=base.attack;
    this.damage=damage;
  }
}
class ApplyWeaknessEffect {
  constructor(base, damage) {
    this.source=base.source;
    this.target=base.opponent.active;
    this.damage=damage;
  }
}
class AfterDamageEffect {
  constructor(base, damage) {
    this.source=base.source;
    this.target=base.opponent.active;
    this.damage=damage;
  }
}
class MegaLopunnyex {
  constructor() {
    this.attacks=[{name:'Gale Thrust',damage:60},
      {name:'Spiky Hopper',damage:160}];
  }
  reduceEffect(store,state,effect) {
    state.originalAttackCount=(state.originalAttackCount??0)+1;
    if(effect.attack===this.attacks[0] &&
       effect.player.movedToActiveThisTurn?.includes(this.id))
      effect.damage+=170;
    return state;
  }
}
const prefabs={
  WAS_ATTACK_USED:(effect,index,card)=>effect.attack===card.attacks[index]
};
const attacks={DealDamageEffect,ApplyWeaknessEffect,AfterDamageEffect};
const StateUtils={
  getOpponent:(state,player)=>state.players.find(p=>p!==player)
};

function fixture({
  seat=0,powerful=false,belt=false,defenderV=false,
  energyBlocked=false,toolBlocked=false,weakness=1,
  attackerReduction=0,attackerBonus=0,afterReduction=0,
  defendingPrevention=false
}={}) {
  const card=new MegaLopunnyex();
  card.id=202;
  const defender={
    damage:0,damagePreventedByActiveEffect:defendingPrevention,
    weakness, isV:defenderV, getPokemonCard(){
      return {name:defenderV?'Shadow Rider Calyrex V':'Budew'};
    }
  };
  const owner={active:null,movedToActiveThisTurn:[]};
  const opponent={active:defender};
  const source={
    cards:[],tools:[],energies:{cards:[]},
    getPokemonCard:()=>card,
    attackDamageReductionNextTurn:attackerReduction,
    outgoingAttackDamageBonusNextTurn:attackerBonus,
    attackDamageReductionAfterWeaknessNextTurn:afterReduction
  };
  if(powerful) {
    const energy={
      fullName:'Powerful Colorless Energy DAA',
      reduceEffect(st,s,e){
        if(!energyBlocked&&e instanceof DealDamageEffect &&
           e.source.cards.includes(this))e.damage+=20;
        return s;
      }
    };
    source.cards.push(energy);source.energies.cards.push(energy);
  }
  if(belt) {
    const tool={
      fullName:'Choice Belt PAL',
      reduceEffect(st,s,e){
        if(!toolBlocked&&defender.isV&&e instanceof DealDamageEffect &&
           e.source.tools.includes(this))e.damage+=30;
        return s;
      }
    };
    source.tools.push(tool);source.cards.push(tool);
  }
  owner.active=source;
  const state={
    players:seat===0?[owner,opponent]:[opponent,owner],
    activePlayer:seat,afterDamageEvents:[],originalAttackCount:0
  };
  const store={
    reduceEffect(s,e){
      if(e instanceof ApplyWeaknessEffect)e.damage*=e.target.weakness;
      if(e instanceof AfterDamageEffect)s.afterDamageEvents.push(e.damage);
      return s;
    }
  };
  const effect={
    player:owner,opponent,source,
    attack:card.attacks[1],damage:160
  };
  return {card,owner,opponent,source,state,store,effect,defender};
}
function inHook(fn){
  return withPaperRank15SpikyHopper(fn,{
    MegaLopunnyex,attacks,prefabs,StateUtils
  });
}
function run(options) {
  const f=fixture(options);
  const original=MegaLopunnyex.prototype.reduceEffect;
  const output=inHook(()=>{
    const result=f.card.reduceEffect(f.store,f.state,f.effect);
    assert.equal(result,f.state);
    return {damage:f.defender.damage,mutatedEffectDamage:f.effect.damage,
      afterDamageEvents:f.state.afterDamageEvents.slice(),
      defaultCalls:f.state.originalAttackCount};
  });
  assert.equal(MegaLopunnyex.prototype.reduceEffect,original);
  return output;
}

test('single printed rank15 attack uses 160; no additional damage or duplicate',()=>{
  assert.equal(VERSION,'agent21-rank15-spiky-hopper-paper-damage-v1');
  assert.equal(ENGINE_PIN,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  for(const seat of [0,1])
    assert.deepEqual(run({seat}),{
      damage:160,mutatedEffectDamage:0,
      afterDamageEvents:[160],defaultCalls:0
    });
});

test('Powerful Colorless Energy and Choice Belt stack only when effective',()=>{
  for(const seat of [0,1]) {
    assert.equal(run({seat,powerful:true}).damage,180);
    assert.equal(run({seat,belt:true,defenderV:true}).damage,190);
    assert.equal(run({seat,powerful:true,belt:true,defenderV:true}).damage,210);
    assert.equal(run({seat,powerful:true,belt:true,defenderV:false}).damage,180);
  }
});

test('native modifier reducers retain independent suppression filters',()=>{
  assert.equal(run({powerful:true,belt:true,defenderV:true,
    energyBlocked:true}).damage,190);
  assert.equal(run({powerful:true,belt:true,defenderV:true,
    toolBlocked:true}).damage,180);
  assert.equal(run({powerful:true,belt:true,defenderV:true,
    toolBlocked:true,energyBlocked:true}).damage,160);
});

test('source attack modifiers precede Weakness; defending prevention ignored',()=>{
  const a=run({powerful:true,weakness:2,attackerReduction:40,
    attackerBonus:15,afterReduction:10,defendingPrevention:true});
  assert.equal(a.damage,(180-40+15)*2-10);
  assert.deepEqual(a.afterDamageEvents,[300]);
  assert.equal(run({attackerReduction:500}).damage,0);
  assert.deepEqual(run({attackerReduction:500}).afterDamageEvents,[]);
});

test('unrelated Gale Thrust and nonmatching effects delegate unchanged',()=>{
  const f=fixture({powerful:true});
  f.effect.attack=f.card.attacks[0];f.effect.damage=60;
  f.owner.movedToActiveThisTurn=[101]; // Buneary moved, Mega did not.
  inHook(()=>f.card.reduceEffect(f.store,f.state,f.effect));
  assert.equal(f.effect.damage,60);
  assert.equal(f.state.originalAttackCount,1);
  f.owner.movedToActiveThisTurn=[202]; // Mega itself moved after evolution.
  inHook(()=>f.card.reduceEffect(f.store,f.state,f.effect));
  assert.equal(f.effect.damage,230);
  assert.equal(f.state.originalAttackCount,2);
});

test('delegated copied Spiky Hopper uses the actual copying attacker attachments',()=>{
  for(const seat of [0,1]){
    const f=fixture({seat,powerful:true,belt:true,defenderV:true});
    const copyingPokemon={
      id:404,name:'Copycat attacker',
      attacks:f.card.attacks.map(attack=>({...attack}))
    };
    // Twinleaf copy-attack-delegation calls source reduceEffect with
    // the actual copycat as "this" and temporary cloned attack objects.
    f.source.getPokemonCard=()=>copyingPokemon;
    f.effect.attack=copyingPokemon.attacks[1];
    const original=MegaLopunnyex.prototype.reduceEffect;
    const state=inHook(()=>MegaLopunnyex.prototype.reduceEffect.call(
      copyingPokemon,f.store,f.state,f.effect));
    assert.equal(state,f.state);
    assert.equal(f.defender.damage,210);
    assert.equal(f.effect.damage,0);
    assert.equal(MegaLopunnyex.prototype.reduceEffect,original);
  }
});

test('same source with no original attacker object fails closed without damage',()=>{
  const f=fixture({powerful:true});
  f.source.getPokemonCard=()=>null;
  assert.throws(()=>inHook(()=>
    f.card.reduceEffect(f.store,f.state,f.effect)),
    /source must be the current/);
  assert.equal(f.defender.damage,0);
});

test('temporary prototype is restored on work exception and async return',()=>{
  const before=Object.getOwnPropertyDescriptor(
    MegaLopunnyex.prototype,'reduceEffect');
  assert.throws(()=>inHook(()=>{throw new Error('injected fixture error')}),
    /injected fixture error/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    MegaLopunnyex.prototype,'reduceEffect'),before);
  assert.throws(()=>inHook(()=>Promise.resolve('unsafe')),/Do not await/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    MegaLopunnyex.prototype,'reduceEffect'),before);
});

test('unmodelled named attachments are not automatically counted as bonuses',()=>{
  const f=fixture({});
  f.source.energies.cards.push({
    fullName:'Other Energy ABC',reduceEffect(){throw Error('unexpected')}
  });
  f.source.tools.push({fullName:'Other Tool ABC',
    reduceEffect(){throw Error('unexpected')}});
  inHook(()=>f.card.reduceEffect(f.store,f.state,f.effect));
  assert.equal(f.defender.damage,160);
});
