'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {withPaperDuskullDiscardOption}=
  require('../simulation/twinleaf/agent25-rank31-paper-duskull-discard-hook.cjs');

class FakePokemonCard{
  constructor(name){this.name=name;}
}
class FakeDuskull{
  reduceEffect(){return 'unmodified-parent';}
}
class FakeDuskullPRE extends FakeDuskull{
  constructor(){
    super();
    this.fullName='Duskull PRE';
    this.name='Duskull';
    this.attacks=[{name:'Come and Get You'},{name:'Mumble'}];
  }
}
class FakeChooseCardsPrompt{
  constructor(player,message,discard,filter,options){
    Object.assign(this,{player,message,discard,filter,options});
  }
}
const prefabs={
  WAS_ATTACK_USED:(effect,index,pokemon)=>
    effect.attack===pokemon.attacks[index],
  MOVE_CARDS:(_store,state,from,to,{cards})=>{
    for(const card of cards){
      const i=from.cards.indexOf(card);
      assert.ok(i>=0);
      from.cards.splice(i,1);
      to.cards.push(card);
    }
  }
};
const deps={
  DuskullPRE:FakeDuskullPRE,prefabs,
  pokemon:{PokemonCard:FakePokemonCard},
  types:{SuperType:{POKEMON:'POKEMON'}},
  prompts:{ChooseCardsPrompt:FakeChooseCardsPrompt},
  messages:{GameMessage:{CHOOSE_CARD_TO_PUT_ONTO_BENCH:'BENCH'}}
};
function staged(count=0,open=2){
  const pokemon=new FakeDuskullPRE();
  const discard={cards:Array.from({length:count},()=>new FakePokemonCard('Duskull'))};
  const player={hand:{cards:[]},discard,bench:Array.from(
    {length:open},()=>({cards:[],pokemonPlayedTurn:null}))};
  const state={turn:26};
  const effect={attack:pokemon.attacks[0],player,
    source:{getPokemonCard:()=>pokemon}};
  const store={prompt(_state,prompt,callback){
    this.pending={prompt,callback};
    return state;
  }};
  return {pokemon,discard,player,state,effect,store};
}
test('paper Duskull has zero eligible discard targets and still may attack',()=>{
  const x=staged(0);
  const initial=Object.getOwnPropertyDescriptor(
    FakeDuskullPRE.prototype,'reduceEffect');
  const run=withPaperDuskullDiscardOption(
    ()=>x.pokemon.reduceEffect(x.store,x.state,x.effect),{deps});
  assert.equal(run.result,x.state);
  assert.equal(run.audit.noTargetNoop,1);
  assert.equal(run.audit.prompts,0);
  assert.equal(x.store.pending,undefined);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeDuskullPRE.prototype,'reduceEffect'),initial);
});
test('paper Duskull uses discard, never erroneously demands hand Duskull',()=>{
  const x=staged(1,2);
  const run=withPaperDuskullDiscardOption(()=>{
    assert.equal(x.pokemon.reduceEffect(x.store,x.state,x.effect),x.state);
    assert.equal(x.store.pending.prompt.options.min,0);
    assert.equal(x.store.pending.prompt.options.max,1);
    assert.equal(x.store.pending.prompt.discard,x.discard);
    x.store.pending.callback([x.discard.cards[0]]);
    return x.player.bench[0].cards.length;
  },{deps});
  assert.equal(run.result,1);
  assert.equal(run.audit.invoked,1);
  assert.equal(run.audit.selectedCount,1);
  assert.equal(x.discard.cards.length,0);
  assert.equal(x.player.bench[0].pokemonPlayedTurn,26);
});
test('paper Duskull permits declining all eligible Bench targets',()=>{
  const x=staged(2,3);
  const run=withPaperDuskullDiscardOption(()=>{
    x.pokemon.reduceEffect(x.store,x.state,x.effect);
    assert.equal(x.store.pending.prompt.options.min,0);
    assert.equal(x.store.pending.prompt.options.max,2);
    x.store.pending.callback([]);
    return x.discard.cards.length;
  },{deps});
  assert.equal(run.result,2);
  assert.equal(run.audit.selectedCount,0);
});
test('paper Duskull does not affect Mumble or other printings',()=>{
  const x=staged(1,2);
  const run=withPaperDuskullDiscardOption(()=>{
    assert.equal(x.pokemon.reduceEffect(
      x.store,x.state,{...x.effect,attack:x.pokemon.attacks[1]}),
      'unmodified-parent');
    x.pokemon.fullName='Duskull SFA';
    assert.equal(x.pokemon.reduceEffect(x.store,x.state,x.effect),
      'unmodified-parent');
    return true;
  },{deps});
  assert.equal(run.audit.invoked,0);
});
