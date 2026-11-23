'use strict';

const assert = require('node:assert/strict');

function firstString(values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function describeEffect(card, effect) {
  const sourceCard = effect?.trainerCard ?? card ?? effect?.sourceCard ??
    effect?.card ?? null;
  const effectName = firstString([
    effect?.attack?.name,
    effect?.power?.name,
    effect?.trainerCard?.name,
    card?.name,
    effect?.sourceCard?.name,
    effect?.card?.name,
    effect?.constructor?.name
  ]);
  return {
    sourceKind: 'card-effect',
    sourceCard,
    effectName,
    effectType: effect?.constructor?.name ?? null
  };
}

function installPromptProvenanceHook(store) {
  assert.ok(store && typeof store === 'object');
  assert.equal(typeof store.callReduceEffect, 'function',
    'pinned Store.callReduceEffect hook is unavailable');
  assert.equal(typeof store.prompt, 'function',
    'pinned Store.prompt hook is unavailable');

  const originalCallReduceEffect = store.callReduceEffect;
  const originalPrompt = store.prompt;
  const stack = [];
  // A native Trainer can suspend its reducer in a prompt and resume a
  // generator from the prompt callback. That callback executes outside
  // callReduceEffect, but new prompts created there still belong to the
  // original card effect (not to the engine).
  const continuationStack = [];
  const provenance = new WeakMap();
  let restored = false;

  function callReduceEffectHook(card, storeLike, state, effect) {
    const current = describeEffect(card, effect);
    stack.push(current);
    try {
      return originalCallReduceEffect.call(this, card, storeLike, state, effect);
    } finally {
      stack.pop();
    }
  }

  function promptHook(state, prompts, then) {
    const promptList = prompts instanceof Array ? prompts : [prompts];
    // Actual reducer frames outrank a parent prompt's continuation: a card
    // effect invoked by that continuation must retain its own provenance.
    const current = stack.length ? stack[stack.length - 1] :
      continuationStack.length ? continuationStack[continuationStack.length - 1] : null;
    // Never attach a source to synthetic prompts produced by native
    // calculatingPlayability. Propagate only trusted synchronous native
    // continuations, without exposing source-card objects to the worker.
    const tracking = this.calculatingPlayability !== true;
    const nativeContinuation = tracking && current && typeof then === 'function'
      ? function(...args) {
        continuationStack.push(current);
        try {
          return then.apply(this, args);
        } finally {
          assert.strictEqual(continuationStack.pop(), current,
            'native prompt provenance continuation stack is unbalanced');
        }
      }
      : then;
    const result = originalPrompt.call(this, state, prompts, nativeContinuation);
    if (!tracking) return result;
    for (const prompt of promptList) {
      if (!prompt || typeof prompt !== 'object') continue;
      const sourceCard = current?.sourceCard ?? null;
      const effectName = current?.effectName ?? null;
      if (sourceCard && effectName) {
        provenance.set(prompt, Object.freeze({
          sourceKind: 'card-effect',
          sourceCard,
          effectName,
          effectType: current?.effectType ?? null
        }));
      }
    }
    return result;
  }

  store.callReduceEffect = callReduceEffectHook;
  store.prompt = promptHook;

  return {
    getPromptProvenance(prompt) {
      return prompt && typeof prompt === 'object'
        ? provenance.get(prompt) ?? null
        : null;
    },
    restore() {
      if (restored) return;
      if (store.callReduceEffect === callReduceEffectHook)
        store.callReduceEffect = originalCallReduceEffect;
      if (store.prompt === promptHook)
        store.prompt = originalPrompt;
      restored = true;
    },
    get activeEffectDepth() {
      return stack.length;
    },
    get restored() {
      return restored;
    }
  };
}

module.exports = {
  firstString,
  describeEffect,
  installPromptProvenanceHook
};
