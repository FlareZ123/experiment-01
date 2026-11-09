'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withPlayabilityOrphanPromptCustody}=require(
  '../../simulation/twinleaf/agent3-playability-prompt-custody-hook.cjs');

/** A minimal faithful Store-like playability side-effect fixture. */
class Store{
  constructor(calculate){
    this.state={turn:23,prompts:[]};
    this.promptItems=[];
    this.impl=calculate;
  }
  calculatePlayability(state){return this.impl.call(this,state);}
}
function prompt(id,name='ChoosePokemonPrompt'){
  return {id,result:undefined,
    constructor:{name},sourceCard:{name:'Guzma'}};
}

test('prunes only an orphan introduced during speculative playability',()=>{
  const original=Store.prototype.calculatePlayability;
  const live=prompt(1),fake=prompt(2);
  const store=new Store(function(state){
    state.prompts.push(fake);
    this.promptItems.push({ids:[2]});
    this.promptItems.pop();
    return state;
  });
  store.state.prompts.push(live);
  store.promptItems.push({ids:[1]});
  const output=withPlayabilityOrphanPromptCustody(()=>(
    store.calculatePlayability(store.state)),{Store});
  assert.deepEqual(store.state.prompts,[live]);
  assert.equal(output.audit.removedOrphanedUnresolved,1);
  assert.equal(output.audit.byKind.ChoosePokemonPrompt,1);
  assert.strictEqual(Store.prototype.calculatePlayability,original);
});

test('retains a new live prompt that has matching native callback',()=>{
  const newPrompt=prompt(3);
  const store=new Store(function(state){
    state.prompts.push(newPrompt);
    this.promptItems.push({ids:[3]});
    return state;
  });
  const outcome=withPlayabilityOrphanPromptCustody(()=>(
    store.calculatePlayability(store.state)),{Store});
  assert.deepEqual(store.state.prompts,[newPrompt]);
  assert.equal(outcome.audit.removedOrphanedUnresolved,0);
  assert.equal(outcome.audit.retainedRegistered,1);
});

test('never retroactively alters a preexisting unresolved prompt',()=>{
  const oldOrphan=prompt(4);
  const store=new Store(state=>state);
  store.state.prompts.push(oldOrphan);
  const result=withPlayabilityOrphanPromptCustody(()=>(
    store.calculatePlayability(store.state)),{Store});
  assert.deepEqual(store.state.prompts,[oldOrphan]);
  assert.equal(result.audit.unregisteredAlreadyExisting,1);
  assert.equal(result.audit.removedOrphanedUnresolved,0);
});

test('restores native method even if the genuine workload fails',()=>{
  const previous=Store.prototype.calculatePlayability;
  const store=new Store(()=>{throw new Error('real failure');});
  assert.throws(()=>withPlayabilityOrphanPromptCustody(()=>(
    store.calculatePlayability(store.state)),{Store}),/real failure/);
  assert.strictEqual(Store.prototype.calculatePlayability,previous);
});
