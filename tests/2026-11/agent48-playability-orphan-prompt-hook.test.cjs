'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {installPlayabilityOrphanPromptHook} =
  require('../../simulation/twinleaf/agent48-playability-orphan-prompt-hook.cjs');

class ResolvePromptAction {
  constructor(id) {this.id = id;}
}
class MockStore {
  constructor() {
    this.state = {turn: 7, prompts: []};
    this.promptItems = [];
    this.created = [];
  }
  calculatePlayability(state) {
    const phantom = {id: 100, result: undefined};
    const kept = {id: 101, result: undefined};
    const resolved = {id: 102, result: []};
    state.prompts.push(phantom, kept, resolved);
    this.created.push(phantom, kept, resolved);
    this.promptItems.push({ids: [101]});
    return state;
  }
  dispatch(action) {return action;}
}

test('orphan from hypothetical payability is pruned without touching a genuine prompt', () => {
  const beforeCalc = MockStore.prototype.calculatePlayability;
  const beforeDispatch = MockStore.prototype.dispatch;
  const hook = installPlayabilityOrphanPromptHook({Store: MockStore});
  try {
    const store = new MockStore();
    const existing = {id: 11, result: undefined};
    store.state.prompts.push(existing);
    store.promptItems.push({ids: [11]});
    const returned = store.calculatePlayability(store.state);
    assert.strictEqual(returned, store.state);
    assert.deepEqual(store.state.prompts.map(p => p.id), [11, 101, 102]);
    assert.strictEqual(store.state.prompts[0], existing);
    assert.strictEqual(store.state.prompts[1], store.created[1]);
    assert.strictEqual(store.state.prompts[2], store.created[2]);
    assert.equal(hook.audit.orphanedPromptsPruned, 1);
    assert.equal(hook.audit.callbackLinkedNewPromptsKept, 1);
    assert.equal(hook.audit.resolvedNewPromptsKept, 1);
    store.dispatch(new ResolvePromptAction(101));
    assert.equal(hook.audit.unlinkedPromptResolveAttempts, 0);
  } finally {
    hook.restore();
  }
  assert.strictEqual(MockStore.prototype.calculatePlayability, beforeCalc);
  assert.strictEqual(MockStore.prototype.dispatch, beforeDispatch);
});

test('unlinked prompt response is observed without converting it to acceptance', () => {
  const hook = installPlayabilityOrphanPromptHook({Store: MockStore});
  try {
    const store = new MockStore();
    store.state.prompts.push({id: 50, result: undefined});
    const result = store.dispatch(new ResolvePromptAction(50));
    assert.equal(result.id, 50);
    assert.equal(hook.audit.unlinkedPromptResolveAttempts, 1);
    assert.equal(hook.audit.orphanedPromptsPruned, 0);
    assert.equal(hook.audit.competitiveGameQualified, false);
  } finally {
    hook.restore();
  }
});

test('a retained callback-linked newly created prompt must never be pruned', () => {
  class GenuineStore extends MockStore {
    dispatch(action) {return super.dispatch(action);}
    calculatePlayability(state) {
      const prompt = {id: 77, result: undefined};
      state.prompts.push(prompt);
      this.promptItems.push({ids: [77]});
      return state;
    }
  }
  const hook = installPlayabilityOrphanPromptHook({Store: GenuineStore});
  try {
    const store = new GenuineStore();
    store.calculatePlayability(store.state);
    assert.deepEqual(store.state.prompts.map(p => p.id), [77]);
    assert.equal(hook.audit.orphanedPromptsPruned, 0);
    assert.equal(hook.audit.callbackLinkedNewPromptsKept, 1);
  } finally {
    hook.restore();
  }
});
