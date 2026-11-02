'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withWallyPaperRecipientGuard,PAPER_DENIAL}=
  require('../simulation/twinleaf/agent18-wally-target-paper-guard.cjs');

class Store {
  constructor(){this.events=[];this.state={prompts:[]};}
  dispatch(action){this.events.push(action);return this.events.length;}
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChoosePokemonPrompt{
  constructor(id,name,message){
    this.id=id;this.result=undefined;
    this.sourceCard={fullName:name};this.message=message;
  }
  validate(result){return Array.isArray(result)&&result.length===1;}
}
const CardTag={POKEMON_EX:9};
const GameMessage={CHOOSE_POKEMON_TO_EVOLVE:10};
const deps={Store,ResolvePromptAction,CardTag,GameMessage};
const slot=(pokemon)=>({getPokemonCard(){return pokemon;}});
const pokemon=(ex)=>({hasTag(t){return ex&&t===CardTag.POKEMON_EX;}});
/** @param {string} trainer */
function setup(trainer='Wally ROS'){
  const s=new Store();
  s.state.prompts.push(new ChoosePokemonPrompt(1,trainer,
    GameMessage.CHOOSE_POKEMON_TO_EVOLVE));
  return s;
}

test('pinned Wally paper guard denies EX target without native mutation and restores prototype',()=>{
  const prior=Store.prototype.dispatch;
  const store=setup();
  const {result,audit}=withWallyPaperRecipientGuard(deps,()=>{
    assert.throws(()=>store.dispatch(new ResolvePromptAction(1,
      [slot(pokemon(true))])),e=>e?.code===PAPER_DENIAL);
    assert.equal(store.events.length,0);
    return store.dispatch(new ResolvePromptAction(1,[slot(pokemon(false))]));
  });
  assert.equal(result,1);
  assert.deepEqual([audit.scopedPrompts,audit.approved,audit.denied],[2,1,1]);
  assert.equal(Store.prototype.dispatch,prior);
});

test('non-Wally effects are untouched by the bounded paper hook',()=>{
  const prior=Store.prototype.dispatch;
  const store=setup('Other Supporter');
  const {result,audit}=withWallyPaperRecipientGuard(deps,()=>
    store.dispatch(new ResolvePromptAction(1,[slot(pokemon(true))])));
  assert.equal(result,1);
  assert.equal(audit.scopedPrompts,0);
  assert.equal(Store.prototype.dispatch,prior);
});

test('unverified recipient fails closed only for stamped Wally prompt',()=>{
  const store=setup();
  const {audit}=withWallyPaperRecipientGuard(deps,()=>{
    assert.throws(()=>store.dispatch(new ResolvePromptAction(1,[null])),
      e=>e?.code===PAPER_DENIAL);
    assert.equal(store.events.length,0);
  });
  assert.equal(audit.denied,1);
});

test('even a synchronous callback error restores the exact pre-existing dispatch',()=>{
  const prior=Store.prototype.dispatch;
  assert.throws(()=>withWallyPaperRecipientGuard(deps,()=>{
    throw Error('deliberate');
  }),/deliberate/);
  assert.equal(Store.prototype.dispatch,prior);
});
