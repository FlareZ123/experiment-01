'use strict';

const { runMatch } = require('./headless.cjs');
const { installDamagePumpSingleSourceHook } =
  require('./damage-pump-single-source-hook.cjs');

/**
 * Run the unmodified headless evaluator with an opt-in rule-fidelity
 * correction for Damage Pump LOR. The original pinned card handler is
 * restored even when the evaluator reports a failure.
 *
 * This adapter does not improve opponent decision policies and does not
 * qualify an experiment as competitive evidence.
 *
 * @param {object} request Valid headless MatchRequest with fixed deck IDs.
 * @returns {object} Headless outcome with explicit effect-hook provenance.
 */
function runDamagePumpCorrectedMatch(request) {
  const restore = installDamagePumpSingleSourceHook();
  try {
    const result = runMatch(request);
    return {
      ...result,
      damagePumpSingleSourceCorrection: true,
      policy: result.policy + '+DamagePumpSingleSource-v1'
    };
  } finally {
    restore();
  }
}

module.exports = { runDamagePumpCorrectedMatch };
