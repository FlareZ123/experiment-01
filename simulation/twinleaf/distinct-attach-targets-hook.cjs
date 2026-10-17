'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Preserve Twinleaf's speculative target scoring while enforcing the
 * differentTargets contract when choosing successive AttachEnergy cards.
 * Each selected destination is excluded from the next target search.
 * Upstream code remains unchanged, and the original prompt options are
 * restored even if the resolver throws.
 *
 * @returns {(() => void) & {stats: {
 *   restrictedPrompts:number, selectedDestinations:number,
 *   targetExclusions:number}}}
 */
function installDistinctAttachTargetsHook() {
  if (installed) return Object.assign(() => {}, { stats: installed.stats });
  const { AttachEnergyPromptResolver } = require(path.join(output,
    'simple-bot/prompt-resolver/attach-energy-prompt-resolver'));
  const { AttachEnergyPrompt } = require(path.join(output,
    'game/store/prompts/attach-energy-prompt'));
  const proto = AttachEnergyPromptResolver.prototype;
  const originalGet = proto.getPromptResult;
  const originalAssign = proto.assignToBestTarget;
  const frames = [];
  const stats = {
    restrictedPrompts: 0,
    selectedDestinations: 0,
    targetExclusions: 0
  };

  function distinctGetPromptResult(state, prompt) {
    if (!(prompt instanceof AttachEnergyPrompt) ||
        prompt.options.differentTargets !== true) {
      return originalGet.call(this, state, prompt);
    }
    const frame = { prompt, used: [] };
    frames.push(frame);
    stats.restrictedPrompts++;
    try {
      return originalGet.call(this, state, prompt);
    } finally {
      frames.pop();
    }
  }

  function distinctAssignToBestTarget(state, prompt, cardList, card) {
    const frame = frames[frames.length - 1];
    if (!frame || frame.prompt !== prompt) {
      return originalAssign.call(this, state, prompt, cardList, card);
    }
    const originalBlockedTo = prompt.options.blockedTo;
    prompt.options.blockedTo = originalBlockedTo.concat(frame.used);
    stats.targetExclusions += frame.used.length;
    try {
      const result = originalAssign.call(this, state, prompt, cardList, card);
      const chosen = result?.value?.[0]?.to;
      if (chosen) {
        frame.used.push(chosen);
        stats.selectedDestinations++;
      }
      return result;
    } finally {
      prompt.options.blockedTo = originalBlockedTo;
    }
  }

  proto.getPromptResult = distinctGetPromptResult;
  proto.assignToBestTarget = distinctAssignToBestTarget;
  const restore = function restoreDistinctAttachTargetsHook() {
    if (!installed || installed.restore !== restore) return;
    if (proto.getPromptResult === distinctGetPromptResult) {
      proto.getPromptResult = originalGet;
    }
    if (proto.assignToBestTarget === distinctAssignToBestTarget) {
      proto.assignToBestTarget = originalAssign;
    }
    installed = null;
  };
  restore.stats = stats;
  installed = { restore, stats };
  return restore;
}

module.exports = { installDistinctAttachTargetsHook };
