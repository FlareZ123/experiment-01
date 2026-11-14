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
    const result = originalPrompt.call(this, state, prompts, then);
    if (this.calculatingPlayability) return result;
    const current = stack.length ? stack[stack.length - 1] : null;
    for (const prompt of promptList) {
      if (!prompt || typeof prompt !== 'object') continue;
      const sourceCard = prompt.sourceCard ?? current?.sourceCard ?? null;
      const effectName = firstString([
        current?.effectName,
        sourceCard?.name,
        sourceCard?.fullName,
        prompt?.constructor?.name
      ]);
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
    }
  };
}

module.exports = {
  firstString,
  describeEffect,
  installPromptProvenanceHook
};
