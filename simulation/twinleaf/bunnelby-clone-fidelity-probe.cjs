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
  // A cold standalone fixture may differ from the warm chained fixture.
  // Record both rather than presuming the conditioned Stage-2 line succeeds.
  const baseline = replayBunnelbyTmBot({diagnostic: true});

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
  const baselineAfter = replayBunnelbyTmBot({diagnostic: true});
  const restoredBaselineEqual = JSON.stringify(baselineAfter) === JSON.stringify(baseline);

  return {
    scope: 'source-conditioned rank2 Bunnelby double TM: Evolution',
    sourceOpponentRank: 1,
    baseline: {
      success: baseline.success, board: baseline.finalBench,
      secondAttack: baseline.secondAttack, stillPending: baseline.stillPending,
      unresolvedPrompt: baseline.unresolvedPrompt, prompts: baseline.prompts
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
    baselineAfter: {
      success: baselineAfter.success, board: baselineAfter.finalBench,
      secondAttack: baselineAfter.secondAttack,
      stillPending: baselineAfter.stillPending,
      unresolvedPrompt: baselineAfter.unresolvedPrompt,
      prompts: baselineAfter.prompts
    },
    restoredUnmodifiedBaselineEqual: restoredBaselineEqual,
    interpretation: 'Clone-model policy and prompts on a conditioned board; exact mechanic/policy readiness must be independently validated. No matchup wins or losses are measured.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(probeBunnelbyCloneFidelity(), null, 2) + '\n');
}
module.exports = {probeBunnelbyCloneFidelity};
