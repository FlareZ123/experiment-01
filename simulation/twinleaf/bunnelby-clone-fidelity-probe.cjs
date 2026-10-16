'use strict';

const assert = require('node:assert/strict');
const {replayBunnelbyTmBot} = require('./bunnelby-tm-policy-replay.cjs');
const {installDetachedSimulatorHook} = require('./detached-simulator-hook.cjs');
const {installPrototypeSafeSimulatorHook} =
  require('./prototype-safe-simulator-hook.cjs');

/**
 * Compare the identical real pinned Store source-board line with alternative
 * speculative-clone models. A mismatch is a fidelity gap, never a game loss.
 * @returns {object}
 */
function probeBunnelbyCloneFidelity() {
  const baseline = replayBunnelbyTmBot();
  assert.equal(baseline.success, true);

  /** @param {()=>()=>void} install */
  function underHook(install) {
    const restore = install();
    try {
      return replayBunnelbyTmBot({diagnostic: true});
    } finally {
      restore();
    }
  }

  const detached = underHook(installDetachedSimulatorHook);
  const prototypeSafe = underHook(installPrototypeSafeSimulatorHook);
  const baselineAfter = replayBunnelbyTmBot();
  assert.deepEqual(baselineAfter, baseline,
    'Experimental cloning changed a later unmodified Bunnelby fixture');

  return {
    scope: 'source-conditioned rank2 Bunnelby double TM: Evolution',
    sourceOpponentRank: 1,
    baseline: {
      success: baseline.success, board: baseline.finalBench,
      secondAttack: baseline.secondAttack, promptKinds: baseline.prompts.map(x => x.kind)
    },
    detached: {
      success: detached.success, board: detached.finalBench,
      secondAttack: detached.secondAttack,
      stillPending: detached.stillPending,
      unresolvedPrompt: detached.unresolvedPrompt,
      prompts: detached.prompts
    },
    prototypeSafe: {
      success: prototypeSafe.success, board: prototypeSafe.finalBench,
      secondAttack: prototypeSafe.secondAttack,
      stillPending: prototypeSafe.stillPending,
      unresolvedPrompt: prototypeSafe.unresolvedPrompt,
      prompts: prototypeSafe.prompts
    },
    restoredUnmodifiedBaseline: true,
    interpretation: 'Clone-model policy and prompts on a conditioned board; exact mechanic/policy readiness must be independently validated. No matchup wins or losses are measured.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(probeBunnelbyCloneFidelity(), null, 2) + '\n');
}
module.exports = {probeBunnelbyCloneFidelity};
