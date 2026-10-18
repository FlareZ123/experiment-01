'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} name @returns {any} */
const load = name => require(path.join(output, name));

/**
 * Observe real bot confirmation decisions while leaving every selected
 * action and the pinned resolver unchanged. The hook is synchronous and
 * restored even if the inner game throws.
 *
 * @template T
 * @param {()=>T} run
 * @returns {{value:T, confirmations:object[]}}
 */
function observeConfirmPrompts(run) {
  const {ConfirmPromptResolver} =
    load('simple-bot/prompt-resolver/confirm-prompt-resolver');
  const {ConfirmPrompt} = load('game/store/prompts/confirm-prompt');
  const original = ConfirmPromptResolver.prototype.resolvePrompt;
  const confirmations = [];
  ConfirmPromptResolver.prototype.resolvePrompt = function observed(state, player, prompt) {
    const action = original.call(this, state, player, prompt);
    if (prompt instanceof ConfirmPrompt) {
      confirmations.push({
        turn:state.turn,
        seat:state.players.findIndex(candidate => candidate.id === player.id),
        promptId:prompt.id,
        message:prompt.message,
        response:action?.result ?? null
      });
    }
    return action;
  };
  try {
    return {value:run(), confirmations};
  } finally {
    ConfirmPromptResolver.prototype.resolvePrompt = original;
  }
}

module.exports = {observeConfirmPrompts};
