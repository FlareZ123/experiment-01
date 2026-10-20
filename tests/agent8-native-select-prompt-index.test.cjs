'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {assertValidPromptAction} =
  require('../simulation/twinleaf/prompt-integrity.cjs');

class ResolvePromptAction {
  constructor(id, result) { this.id = id; this.result = result; }
}

/**
 * Pinned Twinleaf SelectPrompt has no own validate implementation. It inherits
 * Prompt.validate(), which accepts even foreign/out-of-range values.
 * @param {string[]} values
 * @param {boolean} allowCancel
 */
function fixture(values, allowCancel = false) {
  class SelectPrompt {
    constructor() {
      this.id = 12;
      this.result = undefined;
      this.values = values;
      this.options = {allowCancel, defaultValue: 0};
    }
    validate() { return true; }
  }
  return {prompts: [new SelectPrompt()]};
}

test('strict native SelectPrompt accepts exactly offered numeric indices', () => {
  const state = fixture(['Keep', 'Discard', 'Switch']);
  for (const index of [0, 1, 2]) {
    assert.doesNotThrow(() => assertValidPromptAction(
      state, new ResolvePromptAction(12, index),
      {enforceSelectOptionLegality: true}));
  }
  for (const invalid of [-1, 3, 1.5, '1', null, undefined, NaN, [], {}]) {
    assert.throws(() => assertValidPromptAction(
      state, new ResolvePromptAction(12, invalid),
      {enforceSelectOptionLegality: true}), /invalid result/);
  }
});

test('strict cancel is available only when the real SelectPrompt allows it', () => {
  const optional = fixture(['Yes', 'No'], true);
  assert.doesNotThrow(() => assertValidPromptAction(
    optional, new ResolvePromptAction(12, null),
    {enforceSelectOptionLegality: true}));

  const mandatory = fixture([], false);
  assert.throws(() => assertValidPromptAction(
    mandatory, new ResolvePromptAction(12, null),
    {enforceSelectOptionLegality: true}), /invalid result/);
  assert.throws(() => assertValidPromptAction(
    mandatory, new ResolvePromptAction(12, 0),
    {enforceSelectOptionLegality: true}), /invalid result/);

  const emptyOptional = fixture([], true);
  assert.doesNotThrow(() => assertValidPromptAction(
    emptyOptional, new ResolvePromptAction(12, null),
    {enforceSelectOptionLegality: true}));
});

test('old permissive behavior remains intentionally unchanged when opt-in is off', () => {
  const state = fixture(['Only choice']);
  assert.doesNotThrow(() => assertValidPromptAction(
    state, new ResolvePromptAction(12, 999)));
  assert.doesNotThrow(() => assertValidPromptAction(
    state, new ResolvePromptAction(12, null)));
});
