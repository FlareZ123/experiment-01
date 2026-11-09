'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent48-playability-orphan-prompts-v1';

/**
 * Scoped correction for the pinned Store.calculatePlayability: hypothetical
 * card-payability checks may append state.prompts, then discard only their
 * promptItems. Such prompts have no callback and cannot be answered.
 *
 * Remove only unresolved prompts created during this calculation and absent
 * from the retained promptItems. Retain every preexisting prompt, every
 * callback-linked prompt and every already-resolved prompt.
 *
 * @param {{Store?:Function}} [deps] Inject native Store in tests.
 * @returns {{audit:object, restore:()=>void}}
 */
function installPlayabilityOrphanPromptHook(deps = {}) {
  const base = path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store = deps.Store ??
    require(path.join(base, 'game/store/store')).Store;
  const original = Object.getOwnPropertyDescriptor(
    Store.prototype, 'calculatePlayability');
  const originalDispatch = Object.getOwnPropertyDescriptor(
    Store.prototype, 'dispatch');
  assert.equal(typeof original?.value, 'function');
  assert.equal(typeof originalDispatch?.value, 'function');

  const audit = {
    version: VERSION,
    checks: 0, newlyCreatedPrompts: 0, orphanedPromptsPruned: 0,
    callbackLinkedNewPromptsKept: 0, resolvedNewPromptsKept: 0,
    unlinkedPromptResolveAttempts: 0,
    samples: [], competitiveGameQualified: false
  };
  const record = row => {
    if (audit.samples.length < 32) audit.samples.push(row);
  };

  function calculatePlayability(state, ...args) {
    const prior = new Set(state.prompts);
    const result = original.value.call(this, state, ...args);
    assert.ok(Array.isArray(this.promptItems),
      'Pinned Store promptItems unavailable');
    const linked = new Set(this.promptItems.flatMap(item => item.ids));
    const orphan = new Set();
    for (const p of state.prompts) {
      if (prior.has(p)) continue;
      audit.newlyCreatedPrompts++;
      if (p.result !== undefined) {
        audit.resolvedNewPromptsKept++;
      } else if (linked.has(p.id)) {
        audit.callbackLinkedNewPromptsKept++;
      } else {
        orphan.add(p);
        record({kind: 'orphan-playability-prompt', turn: state.turn,
          type: p.constructor?.name ?? 'unknown', promptId: p.id});
      }
    }
    for (let i = state.prompts.length - 1; i >= 0; i--) {
      if (orphan.has(state.prompts[i])) state.prompts.splice(i, 1);
    }
    audit.orphanedPromptsPruned += orphan.size;
    audit.checks++;
    return result;
  }

  function dispatch(action, ...args) {
    if (action?.constructor?.name === 'ResolvePromptAction') {
      const pending = this.state.prompts?.find(p =>
        p.id === action.id && p.result === undefined);
      if (pending && !this.promptItems.some(item =>
        item.ids.includes(action.id))) {
        audit.unlinkedPromptResolveAttempts++;
        record({kind: 'unlinked-resolution-attempt',
          turn: this.state.turn,
          type: pending.constructor?.name ?? 'unknown',
          promptId: action.id});
      }
    }
    return originalDispatch.value.call(this, action, ...args);
  }

  Object.defineProperty(Store.prototype, 'calculatePlayability',
    {...original, value: calculatePlayability});
  Object.defineProperty(Store.prototype, 'dispatch',
    {...originalDispatch, value: dispatch});
  return {
    audit,
    restore() {
      assert.strictEqual(Store.prototype.calculatePlayability,
        calculatePlayability);
      assert.strictEqual(Store.prototype.dispatch, dispatch);
      Object.defineProperty(Store.prototype, 'dispatch', originalDispatch);
      Object.defineProperty(Store.prototype, 'calculatePlayability', original);
    }
  };
}

module.exports = {VERSION, installPlayabilityOrphanPromptHook};
