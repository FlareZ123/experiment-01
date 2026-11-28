'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,ENGINE_PIN,withPaperGirafarigGetLost,
  constrainGetLostPrompt
}=require('../../simulation/twinleaf/agent21-girafarig-get-lost-compulsory-selection-paper-hook.cjs');

const GameMessage={CHOOSE_CARD_TO_DISCARD:11,OTHER:12};
class ChooseCardsPrompt {
  constructor(player,message,cards,filter,options){
    this.player=player;this.playerId=player.id;this.message=message;
    this.cards=cards;this.filter=filter;
    this.options={min:0,max:cards.cards.length,allowCancel:true,
      blocked:[],...options};
  }
  getPerspectivePlayerId(){return this.playerId}
  validate(result){
    if(result===null)return this.options.allowCancel;
    if(!Array.isArray(result)||result.length<this.options.min||
       result.length>this.options.max)return false;
    return result.every(card=>this.cards.cards.includes(card));
  }
}
class Girafarig {
  constructor(){
    this.id=94;
    this.attacks=[{name:'Get Lost',damage:0},
      {name:'Mind Shock',damage:70}];
  }
  reduceEffect(store,state,effect){
    state.originalCalls=(state.originalCalls??0)+1;
    if(effect.attack!==this.attacks[0])return state;
    return store.prompt(state,new ChooseCardsPrompt(
      effect.player,GameMessage.CHOOSE_CARD_TO_DISCARD,
      effect.opponent.discard,{}, {min:2,max:2}),chosen=>{
        if(chosen)for(const card of chosen){
          const idx=effect.opponent.discard.cards.indexOf(card);
          if(idx>=0){
            effect.opponent.discard.cards.splice(idx,1);
            effect.opponent.lostzone.cards.push(card);
          }
        }
      });
  }
}
const prefabs={WAS_ATTACK_USED:(effect,index,card)=>
  effect.attack===card.attacks[index]};
const injected={Girafarig,prefabs,ChooseCardsPrompt,GameMessage};
const card=id=>({id,name:'Dragon '+id});
function fixture({seat=0,discardCount=2}={}){
  const owner={id:101},opponent={id:202,
    discard:{cards:Array.from({length:discardCount},(_,i)=>card(i+1))},
    lostzone:{cards:[]}};
  const state={players:seat===0?[owner,opponent]:[opponent,owner],
    originalCalls:0};
  const attacker=new Girafarig();
  const effect={player:owner,opponent,attack:attacker.attacks[0]};
  const recorded=[];
  const store={prompt(state,prompt,callback) {
    recorded.push({prompt,callback});return state;
  }};
  return {owner,opponent,state,attacker,effect,store,recorded};
}
function withHook(fn){return withPaperGirafarigGetLost(fn,injected)}
function run(f){
  const original=f.store.prompt,cardProto=Girafarig.prototype.reduceEffect;
  assert.equal(withHook(()=>f.attacker.reduceEffect(
    f.store,f.state,f.effect)),f.state);
  assert.equal(f.store.prompt,original);
  assert.equal(Girafarig.prototype.reduceEffect,cardProto);
  assert.equal(f.recorded.length,1);
  return f.recorded[0];
}

test('pin, exact mandatory target count on zero to four discard cards',()=>{
  assert.equal(VERSION,'agent21-girafarig-get-lost-mandatory-distinct-targets-v1');
  assert.equal(ENGINE_PIN,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  for(const seat of [0,1])for(const n of [0,1,2,3,4]){
    const f=fixture({seat,discardCount:n});
    const p=run(f).prompt;
    assert.equal(p.options.min,Math.min(2,n));
    assert.equal(p.options.max,Math.min(2,n));
    assert.equal(p.options.allowCancel,false);
    assert.equal(f.state.originalCalls,1);
  }
});
test('two existing: one or zero selected invalid, distinct two valid',()=>{
  const f=fixture({discardCount:3});
  const p=run(f).prompt,[a,b]=f.opponent.discard.cards;
  assert.equal(p.validate([],f.state),false);
  assert.equal(p.validate([a],f.state),false);
  assert.equal(p.validate([a,b],f.state),true);
  assert.equal(p.validate(null,f.state),false);
});
test('one existing: one mandatory; two or cancellation illegal',()=>{
  const f=fixture({discardCount:1}),p=run(f).prompt;
  const [a]=f.opponent.discard.cards;
  assert.equal(p.validate([a]),true);
  assert.equal(p.validate([]),false);
  assert.equal(p.validate([a,a]),false);
  assert.equal(p.validate(null),false);
});
test('zero existing: empty selection valid, null cancellation still illegal',()=>{
  const f=fixture({discardCount:0}),p=run(f).prompt;
  assert.equal(p.validate([]),true);
  assert.equal(p.validate(null),false);
});
test('duplicate and forged cards rejected despite matching requested count',()=>{
  const f=fixture({discardCount:3});
  const p=run(f).prompt,[a,b]=f.opponent.discard.cards;
  assert.equal(p.validate([a,a]),false);
  assert.equal(p.validate([a,{id:999,name:'impostor'}]),false);
  assert.equal(p.validate([a,b]),true);
});
test('post-hook prompt instance callback still resolves two actual Lost Zone cards',()=>{
  for(const seat of [0,1]){
    const f=fixture({seat,discardCount:3});
    const {prompt,callback}=run(f);
    const [a,b]=f.opponent.discard.cards;
    assert.equal(prompt.validate([a,b]),true);
    callback([a,b]);
    assert.deepEqual(f.opponent.lostzone.cards,[a,b]);
    assert.equal(f.opponent.discard.cards.length,1);
  }
});
test('Mind Shock and unrelated attack prompts preserve native reducer',()=>{
  const f=fixture();
  f.effect.attack=f.attacker.attacks[1];
  withHook(()=>f.attacker.reduceEffect(f.store,f.state,f.effect));
  assert.equal(f.state.originalCalls,1);
  assert.equal(f.recorded.length,0);
});
test('incompatible source prompt signature fails closed and restores method',()=>{
  const f=fixture(),native=Girafarig.prototype.reduceEffect;
  const first=f.store.prompt;
  const incompatible=function(store,state,effect) {
    return store.prompt(state,new ChooseCardsPrompt(
      effect.player,GameMessage.CHOOSE_CARD_TO_DISCARD,
      effect.opponent.discard,{}, {min:1,max:2}),()=>{});
  };
  Girafarig.prototype.reduceEffect=incompatible;
  try{
    assert.throws(()=>withHook(()=>
      f.attacker.reduceEffect(f.store,f.state,f.effect)),
      /expected 2,got 1/);
    assert.equal(f.store.prompt,first);
    assert.equal(Girafarig.prototype.reduceEffect,incompatible);
  }finally{Girafarig.prototype.reduceEffect=native}
});
test('other public discard prompt not altered if it has another message',()=>{
  const f=fixture();
  const native=f.store.prompt;
  f.store.prompt=function(state,prompt,callback) {
    const secondary=new ChooseCardsPrompt(f.owner,GameMessage.OTHER,
      f.opponent.discard,{}, {min:0,max:1});
    this.recordedSecondary=secondary;
    return native.call(this,state,prompt,callback);
  };
  const original=f.store.prompt;
  run(f);
  assert.equal(f.store.prompt,original);
  assert.equal(f.store.recordedSecondary.options.min,0);
});
test('no stale hook or Store method after exception and async return',()=>{
  const descriptor=Object.getOwnPropertyDescriptor(
    Girafarig.prototype,'reduceEffect');
  assert.throws(()=>withHook(()=>{throw Error('test fault')}),
    /test fault/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Girafarig.prototype,'reduceEffect'),descriptor);
  assert.throws(()=>withHook(()=>Promise.resolve('invalid')),
    /Do not await/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Girafarig.prototype,'reduceEffect'),descriptor);
});
