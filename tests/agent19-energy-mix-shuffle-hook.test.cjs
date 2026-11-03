'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,withPaperMewEnergyMixShuffle}=
  require('../simulation/twinleaf/agent19-energy-mix-shuffle-hook.cjs');

class FakeAttackEffect{
  constructor(player,attack){this.player=player;this.attack=attack;}
}
class FakeAttachEnergyPrompt{
  constructor(player){this.playerId=player.id;this.cardList=player.deck;
    this.options={min:0,max:1};}
}
class FakeShuffleDeckPrompt{
  constructor(playerId){this.playerId=playerId;}
}
class FakeStore{
  constructor(){this.prompts=[];}
  prompt(state,prompt,callback){this.prompts.push({prompt,callback});return state;}
}
class FakeMewV{
  constructor(){this.attacks=[{name:'Energy Mix'},{name:'Psychic Leap'}];}
  reduceEffect(store,state,effect){
    if(effect instanceof FakeAttackEffect&&effect.attack===this.attacks[0])
      return store.prompt(state,new FakeAttachEnergyPrompt(effect.player),
        transfers=>{state.transfers=transfers;return state;});
    return state;
  }
}
const dependencies={MewV:FakeMewV,AttackEffect:FakeAttackEffect,
  AttachEnergyPrompt:FakeAttachEnergyPrompt,
  ShuffleDeckPrompt:FakeShuffleDeckPrompt};
const player=()=>({id:33,deck:{cards:[{id:1},{id:2},{id:3}],
  applyOrder(order){this.cards=order.map(i=>this.cards[i]);}}});

test('appends one real shuffle prompt after successful Energy Mix attachment callback',()=>{
  const original=FakeMewV.prototype.reduceEffect;
  const packet=withPaperMewEnergyMixShuffle(()=>{
    const owner=player(),state={},store=new FakeStore(),mew=new FakeMewV();
    const originalPrompt=store.prompt;
    mew.reduceEffect(store,state,new FakeAttackEffect(owner,mew.attacks[0]));
    assert.strictEqual(store.prompt,originalPrompt);
    assert.equal(store.prompts.length,1);
    assert.ok(store.prompts[0].prompt instanceof FakeAttachEnergyPrompt);
    store.prompts[0].callback([{card:owner.deck.cards[0],to:'fusion'}]);
    assert.equal(store.prompts.length,2);
    assert.ok(store.prompts[1].prompt instanceof FakeShuffleDeckPrompt);
    assert.deepEqual(state.transfers,[{card:owner.deck.cards[0],to:'fusion'}]);
    store.prompts[1].callback([2,0,1]);
    assert.deepEqual(owner.deck.cards.map(x=>x.id),[3,1,2]);
    return owner.deck.cards.map(x=>x.id);
  },dependencies);
  assert.deepEqual(packet.result,[3,1,2]);
  assert.deepEqual(packet.audit,{version:VERSION,energyMixEffects:1,
    attachedPrompts:1,shufflePromptsCreated:1,shufflePromptsSettled:1,
    correctedNativeGameQualified:false});
  assert.strictEqual(FakeMewV.prototype.reduceEffect,original);
});

test('an optional zero-energy selection still requires a shuffle',()=>{
  const packet=withPaperMewEnergyMixShuffle(()=>{
    const owner=player(),store=new FakeStore(),mew=new FakeMewV();
    mew.reduceEffect(store,{},new FakeAttackEffect(owner,mew.attacks[0]));
    store.prompts[0].callback([]);
    assert.equal(store.prompts.length,2);
    store.prompts[1].callback([0,1,2]);
    return owner.deck.cards.map(x=>x.id);
  },dependencies);
  assert.equal(packet.audit.shufflePromptsSettled,1);
  assert.deepEqual(packet.result,[1,2,3]);
});

test('copied source reducer invoked with another Pokemon receiver receives shuffle',()=>{
  const packet=withPaperMewEnergyMixShuffle(()=>{
    const owner=player(),store=new FakeStore(),mew=new FakeMewV();
    const copycat={attacks:[...mew.attacks]};
    FakeMewV.prototype.reduceEffect.call(copycat,store,{},
      new FakeAttackEffect(owner,copycat.attacks[0]));
    store.prompts[0].callback([]);
    return store.prompts[1].prompt instanceof FakeShuffleDeckPrompt;
  },dependencies);
  assert.equal(packet.result,true);
  assert.equal(packet.audit.shufflePromptsCreated,1);
});

test('other attacks are unchanged; hook restores on native errors',()=>{
  const owner=player(),store=new FakeStore(),mew=new FakeMewV();
  const original=FakeMewV.prototype.reduceEffect;
  assert.throws(()=>withPaperMewEnergyMixShuffle(()=>{
    mew.reduceEffect(store,{},new FakeAttackEffect(owner,mew.attacks[1]));
    assert.equal(store.prompts.length,0);
    throw Error('native failure');
  },dependencies),/native failure/);
  assert.strictEqual(FakeMewV.prototype.reduceEffect,original);
  assert.equal(Object.prototype.hasOwnProperty.call(store,'prompt'),false);
});

test('fail closed if changed upstream Energy Mix no longer produces native attach prompt',()=>{
  class ChangedMewV extends FakeMewV{
    reduceEffect(){return {};}
  }
  assert.throws(()=>withPaperMewEnergyMixShuffle(()=>{
    const owner=player(),store=new FakeStore(),mew=new ChangedMewV();
    mew.reduceEffect(store,{},new FakeAttackEffect(owner,mew.attacks[0]));
  },{...dependencies,MewV:ChangedMewV}),
  {code:'PAPER_MEW_ENERGY_MIX_PROMPT_CAPTURE_FAILED'});
});
