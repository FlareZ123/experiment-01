'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION,
  locatePublicTarget,
  withNativeAttackDamageObserver
} = require('../simulation/twinleaf/agent5-native-attack-damage-observer.cjs');

class AddPlayerAction {}
class AttackAction {
  constructor(id, name) { this.id = id; this.name = name; }
}
class ResolvePromptAction {
  constructor(id, result) { this.id = id; this.result = result; }
}
class DealDamageEffect {
  constructor(target, damage) { this.target = target; this.damage = damage; }
}
class KnockOutEffect {
  constructor(player, prizeCount) { this.player = player; this.prizeCount = prizeCount; }
}
class ChoosePrizePrompt {
  constructor(player) {
    this.id = 1;
    this.playerId = player.id;
    this.message = 'CHOOSE_PRIZE_CARD';
    this.options = {count:1};
    this.result = undefined;
  }
}
class ChoosePokemonPrompt {
  constructor(player) {
    this.id = 2;
    this.playerId = player.id;
    this.message = 'CHOOSE_POKEMON_TO_PROMOTE';
    this.result = undefined;
  }
}

function pokemonSlot(name, hp = 100, damage = 0) {
  const card = name ? {fullName:name, hp} : null;
  return {
    damage,
    energies:{cards:[]},
    getPokemonCard:()=>card
  };
}
function emptySlot() {
  return {damage:0,energies:{cards:[]},getPokemonCard:()=>null};
}
function player(id, active, bench) {
  const prizes = Array.from({length:6},(_,i)=>({
    cards:[{id:id + '-prize-' + i}]
  }));
  return {
    id,active,bench,prizes,hand:{cards:[]},discard:{cards:[]},
    getPrizeLeft(){return this.prizes.filter(slot=>slot.cards.length>0).length;}
  };
}
function fixture({knockout=true,reject=false}={}) {
  const attacker = player('attacker',pokemonSlot('Tapu Lele-GX',220),[pokemonSlot('Marshadow',80)]);
  const defender = player('defender',pokemonSlot('Iron Thorns ex',220),[pokemonSlot('Iron Thorns ex',220)]);
  const prizeSlot=attacker.prizes[0];
  class Store {
    constructor(){
      this.reject=reject;
      this.state={turn:6,phase:'PLAYER_TURN',activePlayer:0,
        players:[attacker,defender],prompts:[]};
    }
    reduceEffect(state,effect){
      if(effect instanceof DealDamageEffect){
        effect.target.damage += effect.damage;
      }else if(effect instanceof KnockOutEffect){
        const victim=effect.player;
        const old=victim.active;
        const oldCard=old.getPokemonCard();
        victim.discard.cards.push(oldCard);
        victim.active=emptySlot();
        state.prompts.push(new ChoosePrizePrompt(attacker));
        state.prompts.push(new ChoosePokemonPrompt(victim));
      }
      return state;
    }
    dispatch(action){
      if(action instanceof AttackAction){
        if(this.reject)throw new Error('attack rejected');
        this.reduceEffect(this.state,new DealDamageEffect(defender.active,100));
        if(knockout)this.reduceEffect(this.state,new KnockOutEffect(defender,1));
      }else if(action instanceof ResolvePromptAction){
        const prompt=this.state.prompts.find(row=>row.id===action.id);
        assert.ok(prompt);
        prompt.result=action.result;
        if(prompt instanceof ChoosePrizePrompt){
          for(const slot of action.result){
            const cards=slot.cards.splice(0);
            attacker.hand.cards.push(...cards);
          }
        }else if(prompt instanceof ChoosePokemonPrompt){
          defender.active=action.result;
          defender.bench[0]=emptySlot();
        }
      }
      return true;
    }
  }
  return {Store,attacker,defender,prizeSlot};
}

test('records exact native damage effect and public before/after board',()=>{
  const env=fixture({knockout:false});
  const store=new env.Store();
  const oldDispatch=env.Store.prototype.dispatch;
  const oldReduce=env.Store.prototype.reduceEffect;
  const observed=withNativeAttackDamageObserver(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new AttackAction('attacker','Energy Drive'));
    return store;
  },{Store:env.Store});
  assert.equal(observed.audit.schema,VERSION);
  assert.equal(observed.audit.realStores,1);
  assert.equal(observed.audit.acceptedAttackActions,1);
  assert.equal(observed.audit.observedDamageEffects,1);
  assert.equal(observed.audit.observedDamagePipelineEffects,1);
  assert.equal(observed.audit.observedDamageCounterEffects,0);
  assert.equal(observed.audit.observedKnockOutEffects,0);
  assert.equal(observed.audit.attacks.length,1);
  const attack=observed.audit.attacks[0];
  assert.equal(attack.attackName,'Energy Drive');
  assert.equal(attack.turn,6);
  assert.equal(attack.effects[0].damage,100);
  assert.equal(attack.effects[0].target.seat,1);
  assert.equal(attack.effects[0].effectPlayerSeat,0);
  assert.equal(attack.effects[0].victimSeat,null);
  assert.equal(attack.effects[0].target.zone,'active');
  assert.equal(attack.effects[0].targetDamageBefore,0);
  assert.equal(attack.effects[0].targetDamageAfter,100);
  assert.equal(attack.settlement.complete,true);
  assert.strictEqual(env.Store.prototype.dispatch,oldDispatch);
  assert.strictEqual(env.Store.prototype.reduceEffect,oldReduce);
});

test('records KnockOutEffect, physical Prize-to-hand transfer and promotion',()=>{
  const env=fixture();
  const store=new env.Store();
  const prize=env.prizeSlot;
  const observed=withNativeAttackDamageObserver(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new AttackAction('attacker','Energy Drive'));
    store.dispatch(new ResolvePromptAction(1,[prize]));
    store.dispatch(new ResolvePromptAction(2,env.defender.bench[0]));
    return store;
  },{Store:env.Store});
  const attack=observed.audit.attacks[0];
  assert.equal(observed.audit.observedDamageEffects,1);
  assert.equal(observed.audit.observedDamagePipelineEffects,1);
  assert.equal(observed.audit.observedDamageCounterEffects,0);
  assert.equal(observed.audit.observedKnockOutEffects,1);
  assert.equal(attack.effects.find(x=>x.effectType==='KnockOutEffect').effectPlayerSeat,1);
  assert.equal(attack.effects.find(x=>x.effectType==='KnockOutEffect').victimSeat,1);
  assert.equal(attack.effects.find(x=>x.effectType==='KnockOutEffect').victimPokemonBefore,'Tapu Lele-GX');
  assert.equal(attack.effects.find(x=>x.effectType==='KnockOutEffect').victimDamageBefore,230);
  assert.equal(attack.effects.find(x=>x.effectType==='KnockOutEffect').prizeCount,1);
  assert.equal(attack.promptResolutions.length,2);
  assert.equal(attack.promptResolutions[0].promptType,'ChoosePrizePrompt');
  assert.equal(attack.promptResolutions[0].selectedPrizeCards,1);
  assert.equal(attack.promptResolutions[0].physicalPrizeCardsToOwnerHand,true);
  assert.equal(attack.promptResolutions[1].promptType,'ChoosePokemonPrompt');
  assert.equal(attack.promptResolutions[1].activeAfter,'Iron Thorns ex');
  assert.equal(attack.settlement.complete,true);
  assert.equal(env.attacker.getPrizeLeft(),5);
  assert.equal(env.attacker.hand.cards.length,1);
  assert.equal(env.defender.active.getPokemonCard().fullName,'Iron Thorns ex');
});

test('rejected attack remains rejected and observer restores both methods',()=>{
  const env=fixture({reject:true});
  const oldDispatch=env.Store.prototype.dispatch;
  const oldReduce=env.Store.prototype.reduceEffect;
  assert.throws(()=>withNativeAttackDamageObserver(()=>{
    const store=new env.Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new AttackAction('attacker','Energy Drive'));
  },{Store:env.Store}),/attack rejected/);
  assert.strictEqual(env.Store.prototype.dispatch,oldDispatch);
  assert.strictEqual(env.Store.prototype.reduceEffect,oldReduce);
});

test('target locator identifies only public active and bench slots',()=>{
  const env=fixture();
  const state={players:[env.attacker,env.defender]};
  assert.deepEqual(locatePublicTarget(state,env.defender.active),{
    seat:1,zone:'active',index:0,pokemon:'Iron Thorns ex'
  });
  assert.deepEqual(locatePublicTarget(state,env.defender.bench[0]),{
    seat:1,zone:'bench',index:0,pokemon:'Iron Thorns ex'
  });
  assert.equal(locatePublicTarget(state,{}),null);
});
