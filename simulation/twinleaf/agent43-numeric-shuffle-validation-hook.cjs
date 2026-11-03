'use strict';

const {withNumericShufflePromptValidation}=
  require('./agent33-shuffle-prompt-numeric-validation.cjs');

/**
 * Compatibility adapter for the Agent43 owner-selected Muk study. Delegates
 * the pinned numeric shuffle bug to Agent33's already independently native-
 * verified and reversible research hook, avoiding a second implementation.
 * @template T
 * @param {()=>T} work Synchronous pinned native research operation.
 * @param {{ShuffleDeckPrompt?:Function}} [types] Exact pinned class or test double.
 * @returns {{result:T,audit:object}}
 */
function withNumericShuffleIndexValidation(work,types={}) {
  const run=withNumericShufflePromptValidation(work,types);
  return {
    result:run.result,
    audit:{
      version:'agent43-adapter-to-agent33-numeric-shuffle-v2',
      underlying:run.audit.version,
      correctedValidations:run.audit.correctedAccepted,
      rejectedValidations:run.audit.correctedRejected,
      rawRejectedCorrected:run.audit.rawRejectedCorrected,
      // Agent33's synchronous helper has completed its finally and has
      // restored the original prototype by the time it returns.
      restored:true
    }
  };
}

module.exports={withNumericShuffleIndexValidation};
