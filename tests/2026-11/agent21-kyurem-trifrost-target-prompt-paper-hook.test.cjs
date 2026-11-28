'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,ENGINE_PIN,liveOpposingSlots,constrainTrifrostPrompt,
  withPaperKyuremTrifrostTargets
}=require('../../simulation/twinleaf/agent21-kyurem-trifrost-target-prompt-paper-hook.cjs');

const GameMessage={CHOOSE_POKEMON_TO_DAMAGE:314,
  CHOOSE_OTHER_POKEMON:315};
const PlayerType={TOP_PLAYER:0,BOTTOM_PLAYER:1};
const SlotType={ACTIVE:1,BENCH:2};
class ChoosePokemonPrompt {
  constructor(playerId,message,playerType,slots,options={}){
    this.playerId=playerId;
    this.message=message;
    this.playerType=playerType;
    this.slots=slots;
    this.options={min:1,max:1,allowCancel:true,blocked:[],...options};
  }
  getPerspectivePlayerId(){return this.playerId}
  validate(result,state){
    if(result===null)return this.options.allowCancel;
    if(!Array.isArray(result)||result.length<this.options.min||
       result.length>this.options.max)return false;
    return result.every(slot=>slot.cards.length>0)&&
      !result.some(slot=>this.options.blocked.includes(slot));
  }
}
class Kyurem {
  constructor(){
    this.attacks=[{name:'Trifrost',damage:0}];
    this.id=14;
  }
  reduceEffect(store,state,effect){
    state.nativeCallCount=(state.nativeCallCount??0)+1;
    if(effect.attack!==this.attacks[0])return state;
    store.reduceEffect(state,{type:'DISCARD_ALL_ENERGY'});
    return store.prompt(state,new ChoosePokemonPrompt(
      effect.player.id,GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
      PlayerType.TOP_PLAYER,[SlotType.ACTIVE,SlotType.BENCH],
      {min:1,max:3,allowCancel:false}),
      targets=>{state.damageTargets=targets});
  }
}
const prefabs={WAS_ATTACK_USED:(effect,index,card)=>
  effect.attack===card.attacks[index]};
const injected={Kyurem,prefabs,ChoosePokemonPrompt,GameMessage,PlayerType,SlotType};
const slot=(name,present=true)=>({
  name,cards:present?[{name}]:[],
  getPokemonCard(){return present?this.cards[0]:undefined}
});
function fixture({seat=0,opponentCount=3,ownBench=1}={}){
  const own={id:100,active:slot('Kyurem'),
    bench:Array.from({length:ownBench},(_,i)=>slot('own-'+i))};
  const op={id:200,active:slot('opponent-active'),
    bench:Array.from({length:Math.max(0,opponentCount-1)},(_,i)=>
      slot('opponent-bench-'+i))};
  const state={players:seat===0?[own,op]:[op,own],
    activePlayer:seat,nativeCallCount:0,damageTargets:[]};
  const captured=[];
  const store={
    reduceEffect(state,effect) {
      if(effect.type==='DISCARD_ALL_ENERGY')state.didDiscard=true;
      return state;
    },
    prompt(state,prompt,callback) {
      captured.push({prompt,callback});return state;
    }
  };
  const card=new Kyurem();
  const effect={player:own,opponent:op,
    attack:card.attacks[0],source:own.active};
  return {own,op,state,store,card,effect,captured};
}
function withHook(work){
  return withPaperKyuremTrifrostTargets(work,injected);
}
function fire(f){
  const beforePrompt=f.store.prompt,proto=Kyurem.prototype.reduceEffect;
  const returned=withHook(()=>f.card.reduceEffect(
    f.store,f.state,f.effect));
  assert.equal(returned,f.state);
  assert.equal(f.store.prompt,beforePrompt);
  assert.equal(Kyurem.prototype.reduceEffect,proto);
  assert.equal(f.captured.length,1);
  return f.captured[0].prompt;
}

test('version, pin and compulsory rulebook count in both physical seats',()=>{
  assert.equal(VERSION,'agent21-kyurem-trifrost-three-distinct-opponent-targets-v1');
  assert.equal(ENGINE_PIN,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  for(const seat of [0,1])for(const count of [1,2,3,4,6]){
    const f=fixture({seat,opponentCount:count});
    const prompt=fire(f);
    assert.equal(prompt.options.min,Math.min(3,count));
    assert.equal(prompt.options.max,Math.min(3,count));
    assert.equal(prompt.options.allowCancel,false);
    assert.equal(f.state.nativeCallCount,1);
    assert.equal(f.state.didDiscard,true);
  }
});
test('three available: two targets invalid, three distinct eligible valid',()=>{
  const f=fixture();
  const p=fire(f);
  const [a,b,c]=liveOpposingSlots(f.op);
  assert.equal(p.validate([a,b],f.state),false);
  assert.equal(p.validate([a,b,c],f.state),true);
  assert.equal(p.validate([a,b,c,a],f.state),false);
});
test('duplicate and forged own target are rejected despite correct count',()=>{
  for(const seat of [0,1]){
    const f=fixture({seat,opponentCount:4,ownBench:2});
    const p=fire(f);
    const [a,b,c]=liveOpposingSlots(f.op);
    assert.equal(p.validate([a,b,b],f.state),false);
    assert.equal(p.validate([a,b,f.own.active],f.state),false);
    assert.equal(p.validate([a,b,f.own.bench[0]],f.state),false);
    assert.equal(p.validate([c,a,b],f.state),true);
    assert.equal(p.validate(null,f.state),false);
  }
});
test('two remaining opposing Pokémon must both be targeted',()=>{
  const f=fixture({opponentCount:2});
  const p=fire(f);
  const [a,b]=liveOpposingSlots(f.op);
  assert.equal(p.validate([a],f.state),false);
  assert.equal(p.validate([a,b],f.state),true);
  assert.equal(p.validate([a,a],f.state),false);
  assert.equal(p.validate([a,b,b],f.state),false);
});
test('native validator constraints still apply to blocked/empty slots',()=>{
  const f=fixture({opponentCount:3});
  const p=fire(f),[a,b,c]=liveOpposingSlots(f.op);
  p.options.blocked=[b];
  assert.equal(p.validate([a,b,c],f.state),false);
  p.options.blocked=[];
  c.cards.length=0;
  assert.equal(p.validate([a,b,c],f.state),false);
});
test('Regidrago copied Trifrost uses copied temporary attack identity',()=>{
  for(const seat of [0,1]){
    const f=fixture({seat,opponentCount:4});
    const regidrago={name:'Regidrago VSTAR',
      attacks:[{name:'Trifrost',damage:0}]};
    f.effect.attack=regidrago.attacks[0];
    const p=withHook(()=>{
      const saved=f.card.attacks;
      regidrago.attacks=[...saved.map(a=>({...a}))];
      f.effect.attack=regidrago.attacks[0];
      const original=f.card.reduceEffect;
      try{return original.call(regidrago,f.store,f.state,f.effect)}
      finally{regidrago.attacks=[{name:'Apex Dragon',damage:0}]}
    });
    assert.equal(p,f.state);
    assert.equal(f.captured.length,1);
    assert.equal(f.captured[0].prompt.options.min,3);
  }
});
test('non-Trifrost attacks and prompt interface preserve original behavior',()=>{
  const f=fixture();
  f.effect.attack={name:'other attack',damage:10};
  withHook(()=>f.card.reduceEffect(f.store,f.state,f.effect));
  assert.equal(f.state.nativeCallCount,1);
  assert.equal(f.captured.length,0);
  assert.equal(f.store.prompt instanceof Function,true);
});
test('other prompts created while original Trifrost resolves are untouched',()=>{
  const f=fixture();
  const originalPrompt=f.store.prompt;
  f.store.reduceEffect=function(state,effect) {
    const other=new ChoosePokemonPrompt(100,GameMessage.CHOOSE_OTHER_POKEMON,
      PlayerType.BOTTOM_PLAYER,[SlotType.BENCH],{min:1,max:2});
    this.prompt(state,other,()=>{});
    return state;
  };
  const nativePrompt=f.store.prompt;
  withHook(()=>f.card.reduceEffect(f.store,f.state,f.effect));
  assert.equal(f.store.prompt,nativePrompt);
  assert.equal(f.captured.length,2);
  const irrelevant=f.captured[0].prompt;
  const corrected=f.captured[1].prompt;
  assert.equal(irrelevant.options.min,1);
  assert.equal(irrelevant.options.max,2);
  assert.equal(corrected.options.min,3);
  assert.equal(corrected.options.max,3);
});
test('untrusted changed pinned prompt contract fails closed and restores Store',()=>{
  const f=fixture(),first=f.store.prompt;
  const original=Kyurem.prototype.reduceEffect;
  const originalPromptValidator=ChoosePokemonPrompt.prototype.validate;
  // Simulate an incompatible pinned Kyurem revision BEFORE installing hook,
  // so its original reducer emits a changed target prompt signature.
  const incompatible=function(store,state,effect){
    return store.prompt(state,new ChoosePokemonPrompt(effect.player.id,
      GameMessage.CHOOSE_POKEMON_TO_DAMAGE,PlayerType.TOP_PLAYER,
      [SlotType.ACTIVE,SlotType.BENCH],
      {min:0,max:3,allowCancel:false}),()=>{});
  };
  Kyurem.prototype.reduceEffect=incompatible;
  try {
    assert.throws(()=>withHook(()=>
      f.card.reduceEffect(f.store,f.state,f.effect)),
      /expected 1,got 0/);
    assert.equal(Kyurem.prototype.reduceEffect,incompatible);
    assert.equal(f.store.prompt,first);
    assert.equal(ChoosePokemonPrompt.prototype.validate,originalPromptValidator);
  } finally {
    Kyurem.prototype.reduceEffect=original;
  }
});
test('exception and async returns restore Kyurem prototype',()=>{
  const original=Object.getOwnPropertyDescriptor(
    Kyurem.prototype,'reduceEffect');
  assert.throws(()=>withHook(()=>{throw new Error('fixture fault')}),
    /fixture fault/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Kyurem.prototype,'reduceEffect'),original);
  assert.throws(()=>withHook(()=>Promise.resolve(2)),/Do not await/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Kyurem.prototype,'reduceEffect'),original);
});
