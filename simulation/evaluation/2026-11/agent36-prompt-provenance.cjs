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
  // Store.prompt continuation callbacks may enqueue a second owner choice
  // after the original card reduceEffect returns (Quick Ball: discard, search).
  // Preserve origin in a host-only lexical callback scope, not in prompt data.
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
    const current = stack.length ? stack[stack.length - 1] :
      continuationStack.length ? continuationStack[continuationStack.length - 1] : null;
    // Only card-originated continuations inherit provenance; an engine-only
    // callback must not acquire provenance from a forged prompt.sourceCard.
    const wrappedThen = !this.calculatingPlayability &&
      current?.sourceCard && current?.effectName && typeof then === 'function'
      ? function cardEffectContinuation(...args) {
          continuationStack.push(current);
          try {
            return then.apply(this, args);
          } finally {
            continuationStack.pop();
          }
        } : then;
    const result = originalPrompt.call(this, state, prompts, wrappedThen);
    if (this.calculatingPlayability) return result;
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
