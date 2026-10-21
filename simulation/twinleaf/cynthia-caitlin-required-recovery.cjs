'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
function engine(moduleName) { return require(path.join(output, moduleName)); }

const PRINTING = 'Cynthia & Caitlin CEC';
const POLICY_VERSION = 'CynthiaCaitlinPrintedMandatoryRecovery-v1';

/**
 * Native option provenance is stamped by Store.prompt during Trainer resolution.
 * Only this exact printing and printed recovery mode qualify for the correction.
 * A null option would skip a mandatory recovery with an eligible discard target.
 *
 * @param {object} prompt Actual pending pinned Twinleaf Prompt.
 * @returns {boolean}
 */
function isPrintedCynthiaCaitlinRecovery(prompt) {
  return prompt?.constructor?.name === 'SelectOptionPrompt' &&
    prompt.sourceCard?.fullName === PRINTING &&
    Array.isArray(prompt.values) &&
    prompt.values.length === 2 &&
    String(prompt.values[0]).startsWith('Put a Supporter card from your discard pile');
}

/** Return a source-locked, explicitly opt-in printed mode-zero responder. */
function makePrintedRecoveryResolver() {
  const { PromptResolver } =
    engine('simple-bot/prompt-resolver/prompt-resolver');
  const { ResolvePromptAction } =
    engine('game/store/actions/resolve-prompt-action');
  return class PrintedCynthiaCaitlinRecoveryResolver extends PromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state, player, prompt) {
      if (!isPrintedCynthiaCaitlinRecovery(prompt)) return;
      if (prompt.options?.disabled?.[0] === true) {
        throw new Error('Printed C&C mandatory recovery option was disabled.');
      }
      return new ResolvePromptAction(prompt.id, 0);
    }
  };
}

/** @param {object} options Existing upstream SimpleTacticsAi options. */
function withPrintedCynthiaCaitlinRecovery(options) {
  if (!Array.isArray(options.promptResolvers)) {
    throw new Error('Missing SimpleTacticsAi prompt resolver array.');
  }
  if (options.promptResolvers.some(
    resolver => resolver.name === 'PrintedCynthiaCaitlinRecoveryResolver')) {
    throw new Error('Printed C&C recovery correction already installed.');
  }
  return {
    ...options,
    promptResolvers: [makePrintedRecoveryResolver(), ...options.promptResolvers]
  };
}

module.exports = {
  PRINTING, POLICY_VERSION, isPrintedCynthiaCaitlinRecovery,
  makePrintedRecoveryResolver, withPrintedCynthiaCaitlinRecovery
};
