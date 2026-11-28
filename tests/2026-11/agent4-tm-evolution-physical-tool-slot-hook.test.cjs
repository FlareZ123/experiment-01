'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  ENGINE_PIN,VERSION,withPinnedTmEvolutionPhysicalToolSlot
}=require('../../simulation/twinleaf/2026-11/agent4-tm-evolution-physical-tool-slot-hook.cjs');

// A minimal native-shaped tool/slot/CheckPokemonAttacksEffect composition.
// The contract matches the pinned source location of the three decisive
// fields and the reducer dispatch, not a real Store or compiled Twinleaf.
// The hook must pass an independent *real Store* witness before admission.
class NativeCheckPokemonAttacksEffect {
  constructor(player){this.player=player;this.attacks=[];}
}
class NativeTmEvolution {
  constructor(){
    this.set='PAR';this.setNumber='178';
    this.attacks=[{name:'Evolution',cost:['COLORLESS']}];
    this.nativeOtherEffectVisits=0;
  }
  reduceEffect(store,state,effect){
    // Exact pinned source's wrong physical containment:
    if(effect instanceof NativeCheckPokemonAttacksEffect &&
       effect.player.active.getPokemonCard()?.tools.includes(this) &&
       !effect.attacks.includes(this.attacks[0])){
      effect.attacks.push(this.attacks[0]);
    }
    if(!(effect instanceof NativeCheckPokemonAttacksEffect))
      this.nativeOtherEffectVisits++;
    return state;
  }
}
const ORIGINAL=Object.getOwnPropertyDescriptor(
  NativeTmEvolution.prototype,'reduceEffect');

function context(seat,{
  attached=true,blocked=false,printedTools=false
}={}){
  const tm=new NativeTmEvolution();
  const pokemonCard={name:'Bunnelby',tools:printedTools?[tm]:[],
    attacks:[{name:'Burrow'}]};
  const player={
    id:seat+100,active:{
      getPokemonCard:()=>pokemonCard,
      tools:attached?[tm]:[]
    }
  };
  const state={activePlayer:seat,phase:'PLAYER_TURN'};
  const effect=new NativeCheckPokemonAttacksEffect(player);
  const store={blocked};
  const deps={
    enginePin:ENGINE_PIN,
    TechnicalMachineEvolution:NativeTmEvolution,
    CheckPokemonAttacksEffect:NativeCheckPokemonAttacksEffect,
    IS_TOOL_BLOCKED:store=>store.blocked
  };
  return {tm,store,state,effect,deps};
}

for(const seat of [0,1]){
  test('seat '+seat+': correct physical Tool gains genuine TM attack in exact source enumeration',()=>{
    const c=context(seat);
    assert.equal(c.tm.reduceEffect(c.store,c.state,c.effect),c.state);
    assert.deepEqual(c.effect.attacks,[],
      'unpatched pinned array mismatch must be reproduced first');
    const before=NativeTmEvolution.prototype.reduceEffect;
    const wrapped=withPinnedTmEvolutionPhysicalToolSlot(()=>{
      assert.notStrictEqual(NativeTmEvolution.prototype.reduceEffect,before);
      const out=c.tm.reduceEffect(c.store,c.state,c.effect);
      assert.strictEqual(out,c.state);
      assert.strictEqual(c.effect.attacks[0],c.tm.attacks[0]);
      c.tm.reduceEffect(c.store,c.state,c.effect);
      return 'genuine-object';
    },c.deps);
    assert.equal(wrapped.result,'genuine-object');
    assert.equal(wrapped.audit.added,1);
    assert.equal(wrapped.audit.alreadyPresent,1);
    assert.equal(wrapped.audit.nativeStoreGames,0);
    assert.equal(wrapped.audit.qualifiedGames,0);
    assert.equal(wrapped.audit.version,VERSION);
    assert.deepEqual(
      Object.getOwnPropertyDescriptor(NativeTmEvolution.prototype,'reduceEffect'),
      ORIGINAL,'hook must restore entire original prototype descriptor'
    );
  });

  test('seat '+seat+': physically unattached Tool cannot create Evolution attack',()=>{
    const c=context(seat,{attached:false});
    const result=withPinnedTmEvolutionPhysicalToolSlot(
      ()=>c.tm.reduceEffect(c.store,c.state,c.effect),c.deps
    );
    assert.equal(result.audit.unattached,1);
    assert.deepEqual(c.effect.attacks,[]);
  });

  test('seat '+seat+': active disabled Tool cannot grant Evolution attack',()=>{
    const c=context(seat,{blocked:true});
    const result=withPinnedTmEvolutionPhysicalToolSlot(
      ()=>c.tm.reduceEffect(c.store,c.state,c.effect),c.deps
    );
    assert.equal(result.audit.blocked,1);
    assert.deepEqual(c.effect.attacks,[]);
  });

  test('seat '+seat+': old PokémonCard.tools cache does not grant attack if no physical Tool',()=>{
    const c=context(seat,{attached:false,printedTools:true});
    const original=c.tm.reduceEffect(c.store,c.state,c.effect);
    assert.strictEqual(original,c.state);
    assert.equal(c.effect.attacks.length,1,
      'the pinned old predicate incorrectly accepts PokémonCard.tools');
    c.effect.attacks.length=0;
    const result=withPinnedTmEvolutionPhysicalToolSlot(
      ()=>c.tm.reduceEffect(c.store,c.state,c.effect),c.deps
    );
    assert.deepEqual(c.effect.attacks,[]);
    assert.equal(result.audit.unattached,1);
  });

  test('seat '+seat+': unrelated reducer effect passes through original',()=>{
    const c=context(seat);
    const other={kind:'EndTurnEffect'};
    const result=withPinnedTmEvolutionPhysicalToolSlot(
      ()=>c.tm.reduceEffect(c.store,c.state,other),c.deps
    );
    assert.equal(result.audit.passthrough,1);
    assert.equal(c.tm.nativeOtherEffectVisits,1);
  });

  test('seat '+seat+': throw or async misuse restores prototype exactly',()=>{
    const c=context(seat);
    assert.throws(()=>withPinnedTmEvolutionPhysicalToolSlot(()=>{
      c.tm.reduceEffect(c.store,c.state,c.effect);
      throw new Error('abort-store');
    },c.deps),/abort-store/);
    assert.deepEqual(
      Object.getOwnPropertyDescriptor(NativeTmEvolution.prototype,'reduceEffect'),
      ORIGINAL
    );
    assert.throws(()=>withPinnedTmEvolutionPhysicalToolSlot(
      ()=>Promise.resolve(1),c.deps
    ),/requires synchronous/);
    assert.deepEqual(
      Object.getOwnPropertyDescriptor(NativeTmEvolution.prototype,'reduceEffect'),
      ORIGINAL
    );
  });
}

test('unknown engine pin rejects before patching',()=>{
  const c=context(0);
  assert.throws(()=>withPinnedTmEvolutionPhysicalToolSlot(
    ()=>42,{...c.deps,enginePin:'future-commit'}
  ),/unreviewed Twinleaf engine pin/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    NativeTmEvolution.prototype,'reduceEffect'),ORIGINAL);
});
