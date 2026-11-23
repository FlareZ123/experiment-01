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

test('Quick Ball discard callback inherits trusted card source for its second deck-search prompt', () => {
  const store = fakeStore();
  const callbacks = [];
  const nativePrompt = store.prompt;
  store.prompt = function(state, prompts, then) {
    callbacks.push(then);
    return nativePrompt.call(this, state, prompts);
  };
  const hook = installPromptProvenanceHook(store);
  const state = { prompts: [] };
  const quickBall = {
    name: 'Quick Ball',
    fullName: 'Quick Ball FST',
    reduceEffect(nativeStore, gameState) {
      // The pinned Quick Ball reducer suspends a generator while the player
      // chooses a discard, then resumes it from that prompt's callback.
      const flow = (function*() {
        yield nativeStore.prompt(gameState, new ChooseCardsPrompt('p0'), () => flow.next());
        yield nativeStore.prompt(gameState, new ChooseCardsPrompt('p0'), () => {});
      })();
      flow.next();
      return gameState;
    }
  };
  store.callReduceEffect(quickBall, store, state, {
    constructor: { name: 'PlayItemEffect' },
    trainerCard: quickBall
  });
  assert.equal(callbacks.length, 1);
  const first = hook.getPromptProvenance(state.prompts[0]);
  assert.strictEqual(first.sourceCard, quickBall);
  assert.equal(first.effectName, 'Quick Ball');
  assert.equal(hook.activeEffectDepth, 0);
  callbacks[0]([]);
  assert.equal(callbacks.length, 2);
  const second = hook.getPromptProvenance(state.prompts[1]);
  assert.strictEqual(second.sourceCard, quickBall);
  assert.equal(second.effectName, 'Quick Ball');
  assert.equal(second.effectType, 'PlayItemEffect');
  assert.equal(hook.activeEffectDepth, 0);
  assert.equal(JSON.stringify(state.prompts).includes('Quick Ball'), false);
  hook.restore();
});

test('prompt continuation keeps a nested distinct card reducer source and rejects forged orphan source', () => {
  const store = fakeStore();
  const callbacks = [];
  const promptBeforeHook = store.prompt;
  store.prompt = function(state, prompts, then) {
    callbacks.push(then);
    return promptBeforeHook.call(this, state, prompts);
  };
  const hook = installPromptProvenanceHook(store);
  const state = { prompts: [] };
  const nestedCard = {
    name: 'Nested Card', fullName: 'Nested Card ABC',
    reduceEffect(s, state) { return s.prompt(state, new ChooseCardsPrompt('p0'), () => {}); }
  };
  const parent = {
    name: 'Parent Card', fullName: 'Parent Card ABC',
    reduceEffect(s, state) {
      return s.prompt(state, new ChooseCardsPrompt('p0'), function() {
        s.callReduceEffect(nestedCard, s, state, {
          constructor: { name: 'PowerEffect' }, power: { name: 'Nested Power' }
        });
        s.prompt(state, new ChooseCardsPrompt('p0'), () => {});
      });
    }
  };
  store.callReduceEffect(parent, store, state, {
    constructor: { name: 'TrainerEffect' }, trainerCard: parent
  });
  callbacks[0]([]);
  assert.equal(state.prompts.length, 3);
  assert.strictEqual(hook.getPromptProvenance(state.prompts[1]).sourceCard, nestedCard);
  assert.equal(hook.getPromptProvenance(state.prompts[1]).effectName, 'Nested Power');
  assert.strictEqual(hook.getPromptProvenance(state.prompts[2]).sourceCard, parent);
  assert.equal(hook.activeEffectDepth, 0);
  const orphan = new ChooseCardsPrompt('p0');
  orphan.sourceCard = parent;
  store.prompt(state, orphan, () => {});
  assert.equal(hook.getPromptProvenance(orphan), null,
    'orphan prompt.sourceCard cannot inherit a closed continuation');
  hook.restore();
});

test('throwing continuations unwind source stack; playability prompts cannot propagate trusted source', () => {
  const store = fakeStore();
  const callbacks = [];
  const nativePrompt = store.prompt;
  store.prompt = function(state, prompts, then) {
    callbacks.push(then);
    return nativePrompt.call(this, state, prompts);
  };
  const hook = installPromptProvenanceHook(store);
  const state = { prompts: [] };
  const card = {
    name:'Source',fullName:'Source ABC',
    reduceEffect(s, state) {
      s.prompt(state, new ChooseCardsPrompt('p0'), () => { throw new Error('continuation failure'); });
    }
  };
  store.callReduceEffect(card, store, state, { constructor:{name:'TrainerEffect'} });
  assert.throws(() => callbacks[0](null), /continuation failure/);
  const afterFailure = new ChooseCardsPrompt('p0');
  store.prompt(state, afterFailure, () => {});
  assert.equal(hook.getPromptProvenance(afterFailure), null);
  store.calculatingPlayability = true;
  store.callReduceEffect(card, store, state, { constructor:{name:'TrainerEffect'} });
  store.calculatingPlayability = false;
  assert.equal(hook.getPromptProvenance(state.prompts.at(-1)), null);
  hook.restore();
});


test('native Store trainerPromptSources ID stamp recovers a detached Trainer continuation without trusting prompt.sourceCard',()=>{
  const store=fakeStore();
  store.trainerPromptSources=new Map();
  store.resolvingTrainer=undefined;
  const nativePrompt=store.prompt;
  store.prompt=function(state,prompts,then){
    const result=nativePrompt.call(this,state,prompts,then);
    if(!this.calculatingPlayability&&this.resolvingTrainer){
      const list=prompts instanceof Array?prompts:[prompts];
      for(const prompt of list){
        this.trainerPromptSources.set(prompt.id,this.resolvingTrainer);
        prompt.sourceCard=this.resolvingTrainer.trainerCard;
      }
    }
    return result;
  };
  const hook=installPromptProvenanceHook(store);
  const state={prompts:[]};
  const trainer={name:'Mysterious Treasure',fullName:'Mysterious Treasure FLI'};
  // Simulate a native prompt from a Trainer continuation whose research JS
  // effect/continuation stack is empty but the pinned Store's own provenance
  // is present. This does not infer source from an earlier prompt.
  store.resolvingTrainer={player:{id:'p0'},trainerCard:trainer};
  const valid=new ChooseCardsPrompt('p0');
  store.prompt(state,valid,()=>{});
  assert.equal(hook.getPromptProvenance(valid)?.sourceCard,trainer);
  assert.equal(hook.getPromptProvenance(valid)?.effectName,'Mysterious Treasure');
  assert.equal(hook.getPromptProvenance(valid)?.effectType,'TrainerEffect');
  assert.equal(hook.activeEffectDepth,0);
  store.resolvingTrainer=undefined;

  const forged=new ChooseCardsPrompt('p0');
  forged.sourceCard=trainer;
  store.prompt(state,forged,()=>{});
  assert.equal(hook.getPromptProvenance(forged),null,
    'a forged sourceCard without an ID-bound native Store stamp is not trusted');

  const mismatched=new ChooseCardsPrompt('p0');
  store.resolvingTrainer={player:{id:'p0'},trainerCard:trainer};
  const conflicting={name:'Impostor',fullName:'Impostor XXX'};
  const normalNativePrompt=store.prompt;
  store.prompt=function(state,prompt,then){
    const result=normalNativePrompt.call(this,state,prompt,then);
    prompt.sourceCard=conflicting;
    return result;
  };
  // The research wrapper captured the original native prompt dispatcher; a
  // separate sourceCard change here cannot rewire its ID-bound trusted map.
  store.prompt(state,mismatched,()=>{});
  assert.equal(hook.getPromptProvenance(mismatched)?.sourceCard,trainer,
    'native stamp is read at registration, not later spoofed field mutations');
  store.resolvingTrainer=undefined;

  const inner={name:'Nested Power',fullName:'Nested Power TEST',
    reduceEffect(s,state){s.prompt(state,new ChooseCardsPrompt('p0'),()=>{});}};
  store.resolvingTrainer={player:{id:'p0'},trainerCard:trainer};
  store.callReduceEffect(inner,store,state,{
    constructor:{name:'PowerEffect'},power:{name:'Nested Power'}
  });
  const nested=state.prompts.at(-1);
  assert.strictEqual(hook.getPromptProvenance(nested)?.sourceCard,inner,
    'actual nested card reducer outranks ambient Trainer stamp');
  store.resolvingTrainer=undefined;
  hook.restore();
});
