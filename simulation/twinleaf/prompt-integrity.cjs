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
  // Pinned ShuffleDeckPrompt.validate uses Array#sort() without a numeric
  // comparator. That lexicographically reorders indices 10+ and rejects every
  // valid permutation of an ordinary 60-card deck. Apply an exact permutation
  // check here while preserving every other prompt's own validator.
  let valid;
  if (prompt.constructor.name === 'ShuffleDeckPrompt') {
    const owner = state.players.find(player =>
      player.id === prompt.getPerspectivePlayerId());
    const result = action.result;
    const size = owner?.deck.cards.length;
    valid = Array.isArray(result) && result.length === size &&
      result.every(index => Number.isInteger(index) && index >= 0 && index < size) &&
      new Set(result).size === size;
  } else {
    valid = typeof prompt.validate === 'function' &&
      prompt.validate(action.result, state);
  }
  // ChooseCardsPrompt.validate verifies source membership independently for
  // each chosen card, but omits multiplicity. The same physical card cannot
  // satisfy two selections when it occurs only once in the source zone.
  if (valid && prompt.constructor.name === 'ChooseCardsPrompt' &&
      Array.isArray(action.result)) {
    const available = new Map();
    for (const card of prompt.cards.cards) {
      available.set(card, (available.get(card) || 0) + 1);
    }
    for (const card of action.result) {
      const count = available.get(card) || 0;
      if (count === 0) {
        valid = false;
        break;
      }
      available.set(card, count - 1);
    }
  }
  if (valid && prompt.constructor.name === 'AttachEnergyPrompt' &&
      action.result !== null) {
    const eligible = new Set(prompt.cardList.filter(prompt.filter));
    const used = new Set();
    valid = Array.isArray(action.result) && action.result.every(({card}) => {
      if (!eligible.has(card) || used.has(card)) return false;
      used.add(card);
      return true;
    });
  }
  if (!valid) {
    throw new Error('Twinleaf bot supplied an invalid result to ' +
      prompt.constructor.name + ' (prompt ' + prompt.id + ').');
  }
}

module.exports = { assertValidPromptAction };
