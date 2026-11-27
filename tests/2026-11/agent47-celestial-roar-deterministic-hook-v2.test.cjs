'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withDeterministicCelestialRoar,VERSION}=
  require('../../simulation/twinleaf/agent47-celestial-roar-deterministic-hook-v2.cjs');
class EnergyCard{constructor(printing,energyType){this.printing=printing;this.energyType=energyType;}}
class CardList{constructor(cards=[]){this.cards=[...cards];}}
class RegidragoV{reduceEffect(store,state,effect){store.unhandled++;return state;}}
const EnergyType={BASIC:'BASIC',SPECIAL:'SPECIAL'};
const original=RegidragoV.prototype.reduceEffect;
function create(initial){
 const player={id:'actor',deck:new CardList(initial),discard:new CardList(),active:new CardList()};
 const store={prompt:()=>{throw new Error('no native prompt must be requested')},unhandled:0,transitions:[]};
 const state={players:[player]};
 const deps={RegidragoV,energyCard:{EnergyCard},cardList:{CardList},cardTypes:{EnergyType},
   prefabs:{WAS_ATTACK_USED:(effect,index,card)=>index===0&&effect.attack==='Celestial Roar'&&effect.card===card,
   MOVE_CARDS:(store,state,from,to,options)=>{
     const actual=options.count===undefined?options.cards:[...from.cards].slice(0,options.count);
     for(const card of actual){const i=from.cards.indexOf(card);assert.notEqual(i,-1);from.cards.splice(i,1);to.cards.push(card);}
     store.transitions.push(actual.map(x=>x.printing??x));
   }}};
 return {player,store,state,deps};
}
function run(initial){const x=create(initial);const card=new RegidragoV();const {result,audit}=withDeterministicCelestialRoar(
 ()=>card.reduceEffect(x.store,x.state,{player:x.player,attack:'Celestial Roar',card}),x.deps);
 assert.strictEqual(result,x.state);assert.strictEqual(RegidragoV.prototype.reduceEffect,original);
 return {...x,audit};}
test('mixed top3: both Basic Grass and special Double Dragon attach, non-Energy discards, no prompt',()=>{
 const grass=new EnergyCard('Grass Energy MEE 9',EnergyType.BASIC),
   dde=new EnergyCard('Double Dragon Energy ROS 97',EnergyType.SPECIAL),
   item='Quick Ball FST 237',last='Regidrago VSTAR SIT 136';
 const x=run([grass,item,dde,last]);
 assert.deepEqual(x.player.deck.cards,[last]);
 assert.deepEqual(x.player.active.cards,[grass,dde]);
 assert.deepEqual(x.player.discard.cards,[item]);
 assert.equal(x.audit.attachedBasic,1);assert.equal(x.audit.attachedSpecial,1);
 assert.equal(x.audit.discardedNonEnergy,1);assert.equal(x.audit.completeSettlements,1);
 assert.equal(x.audit.nativePromptsCreated,0);
});
test('three non-Energy cards all reach discard; partial deck never invents attachments',()=>{
 const x=run(['a','b','c']);
 assert.deepEqual(x.player.deck.cards,[]);assert.deepEqual(x.player.active.cards,[]);
 assert.deepEqual(x.player.discard.cards,['a','b','c']);
 assert.equal(x.audit.topCardsMoved,3);assert.equal(x.audit.attachedSpecial,0);
 const y=run([new EnergyCard('Double Dragon Energy ROS 97',EnergyType.SPECIAL)]);
 assert.equal(y.audit.topCardsMoved,1);assert.equal(y.player.active.cards.length,1);
});
test('non-Celestial-Roar attack falls through original reducer exactly',()=>{
 const x=create(['item']);const card=new RegidragoV();
 const res=withDeterministicCelestialRoar(()=>card.reduceEffect(x.store,x.state,{player:x.player,attack:'Dragon Laser',card}),x.deps);
 assert.equal(x.store.unhandled,1);assert.equal(res.audit.attacksIntercepted,0);
 assert.strictEqual(RegidragoV.prototype.reduceEffect,original);
});
test('exception and asynchronous attempt both restore original prototype',()=>{
 const x=create(['item']);
 assert.throws(()=>withDeterministicCelestialRoar(()=>{throw new Error('store');},x.deps),/store/);
 assert.strictEqual(RegidragoV.prototype.reduceEffect,original);
 assert.throws(()=>withDeterministicCelestialRoar(()=>Promise.resolve(1),x.deps),/synchronous/);
 assert.strictEqual(RegidragoV.prototype.reduceEffect,original);
 assert.equal(VERSION,'agent47-paper-celestial-roar-deterministic-energy-v2');
});
