'use strict';

/**
 * Record a resolved ChooseCardsPrompt using only the action and pre-dispatch
 * engine state. Capturing diagnostic information must not modify the state
 * or supply hidden information to the bot's decision function.
 *
 * Selections are card names in the source list at the time of the prompt.
 * A later researcher must still infer whether they were discarded, moved to
 * hand, shuffled, or sent elsewhere by checking the card effect.
 *
 * @param {object|null} prompt Pinned engine prompt before dispatch.
 * @param {object} action Pinned engine ResolvePromptAction.
 * @param {object} state Actual pre-dispatch Store state.
 * @returns {object|null} Captured card selection, when applicable.
 */
function selectedCardsEvidence(prompt, action, state) {
  if (!prompt || prompt.constructor.name !== 'ChooseCardsPrompt' ||
      action.constructor.name !== 'ResolvePromptAction') return null;

  const zones = ['hand', 'deck', 'discard', 'lostzone', 'stadium', 'supporter'];
  let sourceZone = 'unclassified';
  let sourcePlayerSlot = -1;
  for (let i = 0; i < state.players.length; i++) {
    const zone = zones.find(name => state.players[i][name] === prompt.cards);
    if (zone) {
      sourceZone = zone;
      sourcePlayerSlot = i;
      break;
    }
  }

  const indices = action.result;
  return {
    promptKind: 'ChooseCardsPrompt',
    message: prompt.message ?? null,
    sourceZone, sourcePlayerSlot,
    selectedCards: indices === null ? null :
      indices.map(index => prompt.cards.cards[index].fullName),
    selectedIndices: indices === null ? null : indices.slice()
  };
}

module.exports = { selectedCardsEvidence };
