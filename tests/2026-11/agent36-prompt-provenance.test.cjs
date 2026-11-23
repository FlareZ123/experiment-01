'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { installPromptProvenanceHook } = require('../../simulation/evaluation/2026-11/agent36-prompt-provenance.cjs');

class ChooseCardsPrompt {
  constructor(playerId) {
    this.playerId = playerId;
    this.sourceCard = null;
  }
}

function fakeStore() {
  return {
    calculatingPlayability: false,
    prompt(state, prompts) {
      const list = prompts instanceof Array ? prompts : [prompts];
      for (const prompt of list) {
        prompt.id = state.prompts.length + 1;
        state.prompts.push(prompt);
      }
      return state;
    },
    callReduceEffect(card, store, state, effect) {
      return card.reduceEffect(store, state, effect);
    }
  };
}

test('prompt provenance hook captures the card/effect stack without serializing engine objects', () => {
  const store = fakeStore();
  const originalCall = store.callReduceEffect;
  const originalPrompt = store.prompt;
  const hook = installPromptProvenanceHook(store);
  const state = { prompts: [] };
  const sourceCard = {
    name: 'Mimikyu',
    fullName: 'Mimikyu — Copycat',
    reduceEffect(storeLike, currentState) {
      storeLike.prompt(currentState, new ChooseCardsPrompt('p0'), () => {});
      return currentState;
    }
  };
  store.callReduceEffect(sourceCard, store, state, {
    constructor: { name: 'AttackEffect' },
    attack: { name: 'Copycat' }
  });
  const prompt = state.prompts[0];
  const provenance = hook.getPromptProvenance(prompt);
  assert.equal(provenance.sourceKind, 'card-effect');
  assert.equal(provenance.sourceCard, sourceCard);
  assert.equal(provenance.effectName, 'Copycat');
  assert.equal(provenance.effectType, 'AttackEffect');
  assert.equal(hook.activeEffectDepth, 0);
  assert.equal(JSON.stringify(prompt).includes('Mimikyu'), false,
    'host provenance must not be attached to the serializable prompt object');
  hook.restore();
  assert.equal(hook.restored,true);
  assert.equal(store.callReduceEffect, originalCall);
  assert.equal(store.prompt, originalPrompt);
});

test('prompt provenance hook ignores fake prompts from playability calculations', () => {
  const store = fakeStore();
  const hook = installPromptProvenanceHook(store);
  const state = { prompts: [] };
  const card = {
    name: 'Hidden Ability Card',
    fullName: 'Hidden Ability Card',
    reduceEffect(storeLike, currentState) {
      storeLike.prompt(currentState, new ChooseCardsPrompt('p0'), () => {});
      return currentState;
    }
  };
  store.calculatingPlayability = true;
  store.callReduceEffect(card, store, state, {
    constructor: { name: 'PowerEffect' },
    power: { name: 'Search' }
  });
  assert.equal(hook.getPromptProvenance(state.prompts[0]), null);
  hook.restore();
});


test('prompt.sourceCard cannot forge provenance outside an active card-effect stack',()=>{
  const store=fakeStore();
  const hook=installPromptProvenanceHook(store);
  const state={prompts:[]};
  const prompt=new ChooseCardsPrompt('p0');
  prompt.sourceCard={
    name:'Forged Source',
    fullName:'Forged Source (SET X)'
  };
  store.prompt(state,prompt,()=>{});
  assert.equal(hook.getPromptProvenance(prompt),null);
  assert.equal(hook.activeEffectDepth,0);
  hook.restore();
  assert.equal(hook.restored,true);
});


test('card-effect provenance survives two asynchronous native continuation prompts without escaping the callback',()=>{
  const continuations=new Map();
  const store=fakeStore();
  const originalPrompt=store.prompt;
  store.prompt=function(state,prompts,then){
    const result=originalPrompt.call(this,state,prompts,then);
    const list=prompts instanceof Array?prompts:[prompts];
    for(const prompt of list)if(typeof then==='function')continuations.set(prompt,then);
    return result;
  };
  const hook=installPromptProvenanceHook(store);
  const state={prompts:[]};
  const source={
    name:'Quick Ball',fullName:'Quick Ball FST',
    reduceEffect(storeLike,state){
      storeLike.prompt(state,new ChooseCardsPrompt('p0'),()=>{
        storeLike.prompt(state,new ChooseCardsPrompt('p0'),()=>{
          storeLike.prompt(state,new ChooseCardsPrompt('p0'),()=>{});
        });
      });
      return state;
    }
  };
  store.callReduceEffect(source,store,state,{
    constructor:{name:'TrainerEffect'},trainerCard:source
  });
  assert.equal(state.prompts.length,1);
  assert.equal(hook.getPromptProvenance(state.prompts[0]).sourceCard,source);
  assert.equal(hook.activeEffectDepth,0);
  continuations.get(state.prompts[0])([]);
  assert.equal(state.prompts.length,2);
  assert.equal(hook.getPromptProvenance(state.prompts[1]).sourceCard,source);
  assert.equal(hook.getPromptProvenance(state.prompts[1]).effectName,'Quick Ball');
  continuations.get(state.prompts[1])([]);
  assert.equal(state.prompts.length,3);
  assert.equal(hook.getPromptProvenance(state.prompts[2]).sourceCard,source);
  assert.equal(hook.activeEffectDepth,0);
  const unrelated=new ChooseCardsPrompt('p0');
  unrelated.sourceCard=source;
  store.prompt(state,unrelated,()=>{});
  assert.equal(hook.getPromptProvenance(unrelated),null,
    'card-originated continuation scope may not leak into unrelated engine prompts');
  hook.restore();
});

test('nested independent card effect supersedes continuation provenance only for its own prompt',()=>{
  const continuations=new Map();
  const store=fakeStore();
  const originalPrompt=store.prompt;
  store.prompt=function(state,prompt,then){
    const result=originalPrompt.call(this,state,prompt,then);
    continuations.set(prompt,then);
    return result;
  };
  const hook=installPromptProvenanceHook(store);
  const state={prompts:[]};
  const inner={
    name:'Inner Trainer',fullName:'Inner Trainer TEST',
    reduceEffect(storeLike,state){
      storeLike.prompt(state,new ChooseCardsPrompt('p0'),()=>{});
      return state;
    }
  };
  const outer={
    name:'Outer Trainer',fullName:'Outer Trainer TEST',
    reduceEffect(storeLike,state){
      storeLike.prompt(state,new ChooseCardsPrompt('p0'),()=>{
        storeLike.callReduceEffect(inner,storeLike,state,{
          constructor:{name:'TrainerEffect'},trainerCard:inner
        });
        storeLike.prompt(state,new ChooseCardsPrompt('p0'),()=>{});
      });
      return state;
    }
  };
  store.callReduceEffect(outer,store,state,{
    constructor:{name:'TrainerEffect'},trainerCard:outer
  });
  continuations.get(state.prompts[0])([]);
  assert.deepEqual(state.prompts.map(prompt=>
    hook.getPromptProvenance(prompt)?.sourceCard),[outer,inner,outer]);
  hook.restore();
});
