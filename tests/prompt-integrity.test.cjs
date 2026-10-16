'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { assertValidPromptAction } =
  require('../simulation/twinleaf/prompt-integrity.cjs');

class ResolvePromptAction {
  constructor(id, result) { this.id = id; this.result = result; }
}

/** @param {number} min @param {number} max */
function fixture(min, max) {
  const prompt = {
    id: 7,
    result: undefined,
    validate(result) {
      return Array.isArray(result) && result.length >= min && result.length <= max;
    }
  };
  return { prompts: [prompt] };
}

test('accepts a valid prompt result while checking the original game state', () => {
  assert.doesNotThrow(() => assertValidPromptAction(
    fixture(1, 2), new ResolvePromptAction(7, ['card'])));
});

test('rejects a zero-card response even though Store can receive it', () => {
  assert.throws(() => assertValidPromptAction(
    fixture(1, 1), new ResolvePromptAction(7, [])), /invalid result/);
});

test('rejects resolving an unrelated ID or acting while a prompt is pending', () => {
  assert.throws(() => assertValidPromptAction(
    fixture(0, 1), new ResolvePromptAction(8, [])), /unknown or already-resolved/);
  assert.throws(() => assertValidPromptAction(
    fixture(0, 1), {constructor: {name: 'AttackAction'}}), /not answered/);
});

test('checks the specifically answered prompt among multiple pending prompts', () => {
  const state = fixture(1, 1);
  state.prompts.push({id: 8, result: undefined, validate: value => value === true});
  assert.doesNotThrow(() => assertValidPromptAction(
    state, new ResolvePromptAction(8, true)));
});

test('resolved prompts do not require a ResolvePromptAction on the next turn', () => {
  const state = fixture(1, 1);
  state.prompts[0].result = ['already resolved'];
  assert.doesNotThrow(() => assertValidPromptAction(state, {}));
});
