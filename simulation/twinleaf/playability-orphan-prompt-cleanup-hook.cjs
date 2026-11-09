'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'playability-orphan-prompt-cleanup-v1';

/**
 * Repair a pinned Store.calculatePlayability omission without altering vendor
 * code. CAN_PLAY_CARD may synchronously create test-only prompts; the pinned
 * playability method drops their promptItems but leaves the prompt objects in
 * State.prompts. Such unresolved prompts cannot be dispatched: reducePrompt
 * requires both the prompt and an owning promptItem. Remove only prompts born
 * inside that exact playability call and left without a matching promptItem.
 *
 * @param {{Store?:Function}} [deps] Real compiled Store or injected test Store.
 * @returns {{audit:object,restore:()=>void}}
 */
function installPlayabilityOrphanPromptCleanupHook(deps = {}) {
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const Store = deps.Store ??
    require(path.join(output, 'game/store/store')).Store;
  const original = Object.getOwnPropertyDescriptor(
    Store.prototype, 'calculatePlayability');
  assert.equal(typeof original?.value, 'function');
  const audit = {
    version: VERSION, calls: 0, orphanPromptsRemoved: 0,
    livePromptPreserved: 0, resolvedPromptPreserved: 0,
    byPromptType: {}, boundedExamples: [], competitiveGameQualified: false
  };

  function patched(state, ...args) {
    const before = new Set(state.prompts);
    const result = original.value.apply(this, [state, ...args]);
    const ownedIds = new Set((this.promptItems ?? [])
      .flatMap(item => item.ids ?? []));
    const fresh = state.prompts.filter(prompt => !before.has(prompt));
    for (let index = state.prompts.length - 1; index >= 0; index--) {
      const prompt = state.prompts[index];
      if (before.has(prompt)) continue;
      if (prompt.result !== undefined) {
        audit.resolvedPromptPreserved++;
        continue;
      }
      if (ownedIds.has(prompt.id)) {
        audit.livePromptPreserved++;
        continue;
      }
      // Native Store.reducePrompt is a no-op for this exact state: no
      // promptItem references its ID. Leaving it can stall every later action.
      state.prompts.splice(index, 1);
      const kind = prompt.constructor?.name ?? 'UnknownPrompt';
      audit.orphanPromptsRemoved++;
      audit.byPromptType[kind] = (audit.byPromptType[kind] ?? 0) + 1;
      if (audit.boundedExamples.length < 40) {
        audit.boundedExamples.push({
          turn: state.turn, promptType: kind,
          pendingId: prompt.id, newPromptsOnCall: fresh.length,
          remainingNativePromptItems: this.promptItems?.length ?? null
        });
      }
    }
    audit.calls++;
    return result;
  }

  Object.defineProperty(Store.prototype, 'calculatePlayability',
    {...original, value: patched});
  return {
    audit,
    restore() {
      assert.strictEqual(Store.prototype.calculatePlayability, patched,
        'Unexpected replacement of the playability cleanup hook');
      Object.defineProperty(Store.prototype, 'calculatePlayability', original);
    }
  };
}

module.exports = {
  VERSION, installPlayabilityOrphanPromptCleanupHook
};
