'use strict';

/**
 * Check the proposed action before passing it to Twinleaf's Store.dispatch.
 * Pinned Store.reducePrompt sets prompt.result directly and does not call the
 * prompt's validate method, so an illegal bot result can otherwise complete.
 *
 * The caller is responsible for enabling this experimental strict mode; some
 * upstream validators may be overly permissive or incorrect and still need
 * card/rules-specific scrutiny. This check makes rejection explicit.
 *
 * @param {{prompts:Array<{id:number,result?:unknown,validate:(result:unknown,state:object)=>boolean}>}} state
 * @param {{id?:number,result?:unknown,constructor?:{name?:string}}} action
 * @returns {void}
 */
function assertValidPromptAction(state, action) {
  const unresolved = state.prompts.filter(prompt => prompt.result === undefined);
  if (unresolved.length === 0) return;
  if (action?.constructor?.name !== 'ResolvePromptAction') {
    throw new Error('Pending Twinleaf prompt was not answered with ResolvePromptAction.');
  }
  const prompt = unresolved.find(candidate => candidate.id === action.id);
  if (!prompt) {
    throw new Error('Twinleaf bot answered an unknown or already-resolved prompt ID.');
  }
  if (typeof prompt.validate !== 'function' || !prompt.validate(action.result, state)) {
    throw new Error('Twinleaf bot supplied an invalid result to ' +
      prompt.constructor.name + ' (prompt ' + prompt.id + ').');
  }
}

module.exports = { assertValidPromptAction };
