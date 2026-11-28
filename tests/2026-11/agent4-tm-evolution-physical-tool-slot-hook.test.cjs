'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  ENGINE_PIN,VERSION,withPinnedTmEvolutionPhysicalToolSlot
}=require('../../simulation/twinleaf/2026-11/agent4-tm-evolution-physical-tool-slot-hook.cjs');

// Native-shaped separate PokemonCard.tools / PokemonCardList.tools objects,
// AttackAction, ActionEnumerator and CheckPokemonAttacksEffect. These use
// exactly the pinned signatures/fields, but are NOT a real compiled Store.
class NativeCheckPokemonAttacksEffect{
  constructor(player){this.player=player;this.attacks=[];}
}
class NativeAttackAction{
  constructor(clientId,name){this.clientId=clientId;this.name=name;this.type='ATTACK_ACTION';}
}
class NativeActionEnumerator{
  enumerate(state,player,clientId){
    const card=player.active.getPokemonCard();
    return [
      ...card.attacks.map(attack=>new NativeAttackAction(clientId,attack.name)),
      {type:'PASS_TURN_ACTION',clientId}
    ];
  }
}
class NativeTmEvolution{
  constructor(){
    this.set='PAR';this.setNumber='178';
    this.attacks=[{name:'Evolution',cost:['COLORLESS']}];
    this.nativeOtherEffectVisits=0;
  }
  reduceEffect(store,state,effect){
    // Pinned PAR178 reducer's actual bug:
    if(effect instanceof NativeCheckPokemonAttacksEffect&&
        effect.player.active.getPokemonCard()?.tools.includes(this)&&
        !effect.attacks.includes(this.attacks[0])){
      effect.attacks.push(this.attacks[0]);
    }
    if(!(effect instanceof NativeCheckPokemonAttacksEffect))
      this.nativeOtherEffectVisits++;
    return state;
  }
}
const ORIGINAL_TOOL=Object.getOwnPropertyDescriptor(
  NativeTmEvolution.prototype,'reduceEffect');
const ORIGINAL_ENUM=Object.getOwnPropertyDescriptor(
  NativeActionEnumerator.prototype,'enumerate');
const CONDITIONS={ASLEEP:'ASLEEP',PARALYZED:'PARALYZED'};

function context(seat,{attached=true,blocked=false,printedTools=false,
  condition=null,printedEvolutionAttack=false}={}){
  const tm=new NativeTmEvolution();
  const pokemonCard={
    name:'Bunnelby',tools:printedTools?[tm]:[],
    attacks:printedEvolutionAttack?
      [{name:'Burrow'},{name:'Evolution'}]:[{name:'Burrow'}]
  };
  const player={
    id:seat+100,
    active:{
      getPokemonCard:()=>pokemonCard,
      tools:attached?[tm]:[],
      specialConditions:condition?[condition]:[]
    }
  };
  const state={activePlayer:seat,phase:'PLAYER_TURN'};
  const effect=new NativeCheckPokemonAttacksEffect(player);
  const store={blocked};
  const enumerator=new NativeActionEnumerator();
  const deps={
    enginePin:ENGINE_PIN,
    TechnicalMachineEvolution:NativeTmEvolution,
    CheckPokemonAttacksEffect:NativeCheckPokemonAttacksEffect,
    IS_TOOL_BLOCKED:store=>store.blocked,
    ActionEnumerator:NativeActionEnumerator,AttackAction:NativeAttackAction,
    SpecialCondition:CONDITIONS
  };
  return {tm,player,store,state,effect,enumerator,deps};
}

function attackNames(c){
  return c.enumerator.enumerate(c.state,c.player,c.player.id)
    .filter(a=>a.type==='ATTACK_ACTION').map(a=>a.name);
}
function assertRestored(){
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    NativeTmEvolution.prototype,'reduceEffect'),ORIGINAL_TOOL);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    NativeActionEnumerator.prototype,'enumerate'),ORIGINAL_ENUM);
}

for(const seat of [0,1]){
  test('seat '+seat+': rooted TM attack absent before hook; included and admitted inside hook',()=>{
    const c=context(seat);
    assert.deepEqual(attackNames(c),['Burrow']);
    c.tm.reduceEffect(c.store,c.state,c.effect);
    assert.deepEqual(c.effect.attacks,[]);
    const before=NativeTmEvolution.prototype.reduceEffect;
    const originalEnum=NativeActionEnumerator.prototype.enumerate;
    const value=withPinnedTmEvolutionPhysicalToolSlot(()=>{
      assert.notStrictEqual(NativeTmEvolution.prototype.reduceEffect,before);
      assert.notStrictEqual(NativeActionEnumerator.prototype.enumerate,originalEnum);
      assert.deepEqual(attackNames(c),['Burrow','Evolution']);
      assert.strictEqual(c.tm.reduceEffect(c.store,c.state,c.effect),c.state);
      assert.strictEqual(c.effect.attacks[0],c.tm.attacks[0]);
      c.tm.reduceEffect(c.store,c.state,c.effect);
      return 'physical-source';
    },c.deps);
    assert.equal(value.result,'physical-source');
    assert.equal(value.audit.added,1);
    assert.equal(value.audit.rootCandidatesAdded,1);
    assert.equal(value.audit.alreadyPresent,1);
    assert.equal(value.audit.nativeStoreGames,0);
    assert.equal(value.audit.qualifiedGames,0);
    assert.equal(value.audit.version,VERSION);
    assertRestored();
    assert.deepEqual(attackNames(c),['Burrow'],
      'root enumerator is restored, no global leak');
  });

  test('seat '+seat+': physically unattached TM creates neither candidate nor reducer attack',()=>{
    const c=context(seat,{attached:false});
    const value=withPinnedTmEvolutionPhysicalToolSlot(()=>{
      assert.deepEqual(attackNames(c),['Burrow']);
      c.tm.reduceEffect(c.store,c.state,c.effect);
    },c.deps);
    assert.equal(value.audit.rootNoTool,1);
    assert.equal(value.audit.unattached,1);
    assert.deepEqual(c.effect.attacks,[]);
  });

  test('seat '+seat+': blocked Tool root candidate still rejected by native reducer',()=>{
    const c=context(seat,{blocked:true});
    const value=withPinnedTmEvolutionPhysicalToolSlot(()=>{
      // ActionEnumerator is *legal-ish* and cannot see Store's lock;
      // caller's real Simulator must preflight-reject this candidate.
      assert.deepEqual(attackNames(c),['Burrow','Evolution']);
      c.tm.reduceEffect(c.store,c.state,c.effect);
    },c.deps);
    assert.equal(value.audit.blocked,1);
    assert.deepEqual(c.effect.attacks,[]);
  });

  test('seat '+seat+': old PokemonCard.tools cache cannot spoof a physical attachment',()=>{
    const c=context(seat,{attached:false,printedTools:true});
    c.tm.reduceEffect(c.store,c.state,c.effect);
    assert.equal(c.effect.attacks.length,1,
      'pinned buggy predicate is reproducible');
    c.effect.attacks.length=0;
    const value=withPinnedTmEvolutionPhysicalToolSlot(()=>{
      assert.deepEqual(attackNames(c),['Burrow']);
      c.tm.reduceEffect(c.store,c.state,c.effect);
    },c.deps);
    assert.equal(value.audit.unattached,1);
    assert.deepEqual(c.effect.attacks,[]);
  });

  test('seat '+seat+': asleep/paralyzed active cannot enumerate Tool attack',()=>{
    for(const condition of [CONDITIONS.ASLEEP,CONDITIONS.PARALYZED]){
      const c=context(seat,{condition});
      const value=withPinnedTmEvolutionPhysicalToolSlot(
        ()=>attackNames(c),c.deps);
      // Original fake enumerator does not filter; the hook only guarantees
      // it does not add Evolution on top of what pinned enumerator produced.
      assert.deepEqual(value.result,['Burrow']);
      assert.equal(value.audit.rootCannotAttackCondition,1);
    }
  });

  test('seat '+seat+': root no duplicate if attack already present',()=>{
    const c=context(seat,{printedEvolutionAttack:true});
    const value=withPinnedTmEvolutionPhysicalToolSlot(
      ()=>attackNames(c),c.deps);
    assert.deepEqual(value.result,['Burrow','Evolution']);
    assert.equal(value.audit.rootCandidatesAdded,0);
    assert.equal(value.audit.rootCandidatesAlreadyPresent,1);
  });

  test('seat '+seat+': unrelated reducer event still uses upstream',()=>{
    const c=context(seat);
    const value=withPinnedTmEvolutionPhysicalToolSlot(
      ()=>c.tm.reduceEffect(c.store,c.state,{kind:'EndTurnEffect'}),c.deps);
    assert.equal(value.audit.passthrough,1);
    assert.equal(c.tm.nativeOtherEffectVisits,1);
  });

  test('seat '+seat+': both prototype patches restore after throw and async misuse',()=>{
    const c=context(seat);
    assert.throws(()=>withPinnedTmEvolutionPhysicalToolSlot(()=>{
      attackNames(c);
      c.tm.reduceEffect(c.store,c.state,c.effect);
      throw new Error('forced-native-abort');
    },c.deps),/forced-native-abort/);
    assertRestored();
    assert.throws(()=>withPinnedTmEvolutionPhysicalToolSlot(
      ()=>Promise.resolve(1),c.deps
    ),/requires synchronous/);
    assertRestored();
  });
}

test('non-pinned upstream version fails closed before touching either prototype',()=>{
  const c=context(0);
  assert.throws(()=>withPinnedTmEvolutionPhysicalToolSlot(
    ()=>42,{...c.deps,enginePin:'future-upstream-commit'}
  ),/unreviewed Twinleaf engine pin/);
  assertRestored();
});
