'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withPaperTapuCure}=require('../simulation/twinleaf/agent15-tapu-cure-paper-hook.cjs');

class AddPlayerAction {}
class ResolvePromptAction {constructor(id,result){this.id=id;this.result=result;}}
class ChoosePokemonPrompt {
  constructor(playerId,message,playerType,slots,options){
    Object.assign(this,{playerId,message,playerType,slots,options});
  }
}
class HealEffect {constructor(owner,target,amount){Object.assign(this,{owner,target,amount});}}
class TapuLeleGX {
  constructor(){this.fullName='Tapu Lele-GX GRI';this.attacks=[{},{}];}
  reduceEffect(store,state,effect){state.nativeCalls++;return state;}
}
class Store {
  constructor(){this.state={prompts:[],nativeCalls:0,healed:[]};this.callbacks=new Map();}
  dispatch(action){
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(x=>x.id===action.id);
      prompt.result=action.result;
      this.callbacks.get(action.id)(action.result);
    }
    return this.state;
  }
  prompt(state,prompt,callback){
    prompt.id=state.prompts.length+1;
    state.prompts.push(prompt);
    this.callbacks.set(prompt.id,callback);
    return state;
  }
  reduceEffect(state,effect){state.healed.push(effect);return state;}
}
const deps={Store,TapuLeleGX,ChoosePokemonPrompt,HealEffect,
  prefabs:{WAS_ATTACK_USED:(effect,index,card)=>effect.attack===card.attacks[index],
    BLOCK_IF_GX_ATTACK_USED:owner=>{if(owner.usedGX)throw Error('GX_ALREADY_USED');}},
  GameMessage:{CHOOSE_POKEMON_TO_HEAL:'heal'},
  targetTypes:{PlayerType:{BOTTOM_PLAYER:'bottom'},SlotType:{BENCH:'bench',ACTIVE:'active'}}};
function fixture(n=4){
  const card=new TapuLeleGX();
  const bench=Array.from({length:n},()=>({card:true,damage:0,
    getPokemonCard(){return this.card;}}));
  const owner={id:4,usedGX:false,bench,
    active:{getPokemonCard:()=>card}};
  const store=new Store();
  store.dispatch(new AddPlayerAction());
  return {card,bench,owner,store,effect:{player:owner,attack:card.attacks[1]}};
}

test('zero-damage 4-Bench attack presents exactly two Bench targets',()=>{
  const old=TapuLeleGX.prototype.reduceEffect;
  const res=withPaperTapuCure(()=>{
    const f=fixture();
    f.card.reduceEffect(f.store,f.store.state,f.effect);
    const p=f.store.state.prompts[0];
    assert.deepEqual(p.slots,['bench']);
    assert.deepEqual(p.options,{min:2,max:2,allowCancel:false,blocked:[]});
    f.store.dispatch(new ResolvePromptAction(p.id,[f.bench[1],f.bench[2]]));
    assert.equal(f.owner.usedGX,true);
    assert.deepEqual(f.store.state.healed.map(e=>e.target),[f.bench[1],f.bench[2]]);
    return 9;
  },deps);
  assert.equal(res.result,9);
  assert.equal(res.audit.correctedAttackDeclarations,1);
  assert.equal(res.audit.validatedTargetReplies,1);
  assert.equal(res.audit.paperGameQualified,false);
  assert.strictEqual(TapuLeleGX.prototype.reduceEffect,old);
});

test('reject Active, duplicate and short answers without spending GX',()=>{
  const res=withPaperTapuCure(()=>{
    const f=fixture();f.card.reduceEffect(f.store,f.store.state,f.effect);
    const id=f.store.state.prompts[0].id;
    for(const bad of [[f.owner.active,f.bench[0]],[f.bench[0],f.bench[0]],[f.bench[0]]]){
      assert.throws(()=>f.store.dispatch(new ResolvePromptAction(id,bad)),
        /PAPER_TAPU_CURE_INVALID_BENCH_TARGETS/);
      assert.equal(f.owner.usedGX,false);
    }
    return true;
  },deps);
  assert.equal(res.audit.rejectedTargetReplies,3);
});

test('one or zero occupied Bench follows available-target rule, still spends GX',()=>{
  const res=withPaperTapuCure(()=>{
    const one=fixture(1);
    one.card.reduceEffect(one.store,one.store.state,one.effect);
    assert.equal(one.store.state.prompts[0].options.min,1);
    one.store.dispatch(new ResolvePromptAction(1,[one.bench[0]]));
  },deps);
  assert.deepEqual(res.audit.expectedBenchTargetCounts,[1]);
  const zero=withPaperTapuCure(()=>{
    const f=fixture(0);
    f.card.reduceEffect(f.store,f.store.state,f.effect);
    assert.equal(f.store.state.prompts.length,0);
    assert.equal(f.owner.usedGX,true);
  },deps);
  assert.deepEqual(zero.audit.expectedBenchTargetCounts,[0]);
});

test('original non-Tapu, other attack and unowned clone Store are untouched',()=>{
  const result=withPaperTapuCure(()=>{
    const f=fixture();const clone=new Store();
    f.card.reduceEffect(clone,clone.state,f.effect);
    f.card.reduceEffect(f.store,f.store.state,{player:f.owner,attack:f.card.attacks[0]});
    const unrelated=new TapuLeleGX();unrelated.fullName='Tapu Lele-GX SUM';
    unrelated.reduceEffect(f.store,f.store.state,{player:f.owner,attack:unrelated.attacks[1]});
    assert.equal(f.store.state.prompts.length,0);
    assert.equal(f.store.state.nativeCalls,2);
    assert.equal(clone.state.nativeCalls,1);
  },deps);
  assert.equal(result.audit.correctedAttackDeclarations,0);
});

test('GX spent negative and synchronous exceptions always restore prototypes',()=>{
  const before=Store.prototype.dispatch;
  const old=TapuLeleGX.prototype.reduceEffect;
  assert.throws(()=>withPaperTapuCure(()=>{
    const f=fixture();f.owner.usedGX=true;
    f.card.reduceEffect(f.store,f.store.state,f.effect);
  },deps),/GX_ALREADY_USED/);
  assert.strictEqual(Store.prototype.dispatch,before);
  assert.strictEqual(TapuLeleGX.prototype.reduceEffect,old);
});
