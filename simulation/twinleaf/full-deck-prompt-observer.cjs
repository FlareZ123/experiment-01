'use strict';

/**
 * A search prompt exposes a player's entire current deck when the pinned
 * ChooseCardsPrompt directly owns that player's deck CardList. Other prompts
 * may show only a subset, an opponent's cards, or a different zone. Treat those
 * as unresolved rather than inferring a physical-paper deck inspection.
 *
 * Records only timing and public zone counts, never concealed card identities.
 *
 * @param {object} state Pinned Twinleaf State.
 * @param {object|undefined} prompt Pending prompt.
 * @param {Function} ChooseCardsPrompt Pinned engine class.
 * @returns {{playerId:number,turn:number,deckCardCount:number,prizeSlotsRemaining:number}|null}
 */
function fullOwnDeckPrompt(state, prompt, ChooseCardsPrompt) {
  if (!(prompt instanceof ChooseCardsPrompt)) return null;
  const player=state.players.find(side=>side.id===prompt.playerId);
  if (!player || prompt.cards!==player.deck) return null;
  return {
    playerId:player.id,
    turn:state.turn,
    deckCardCount:player.deck.cards.length,
    prizeSlotsRemaining:player.prizes.filter(slot=>slot.cards.length>0).length
  };
}

/**
 * Keep only the first confirmed owner-visible full-deck prompt per physical
 * player. This is a lower-bound observation on K1 onset, because other source
 * interactions may reveal a whole deck without this particular prompt shape.
 * @param {Array<object>} observations Recorder owned by the caller.
 * @param {object} state Current state, never mutated.
 * @param {object|undefined} prompt Pending prompt.
 * @param {Function} ChooseCardsPrompt Pinned ChooseCardsPrompt class.
 * @param {number} actionOrdinal Number of actual root actions already dispatched.
 */
function recordFirstFullOwnDeckPrompt(observations,state,prompt,ChooseCardsPrompt,actionOrdinal) {
  const event=fullOwnDeckPrompt(state,prompt,ChooseCardsPrompt);
  if (event && !observations.some(item=>item.playerId===event.playerId)) {
    observations.push({
      evidenceType:'owner-visible-complete-deck-prompt-v1',
      ...event,actionOrdinal,
      scope:'Observed a pending ChooseCardsPrompt whose CardList is exactly the acting player deck. No inference about other search forms or opponent-visible Prize identities.'
    });
  }
}

module.exports={fullOwnDeckPrompt,recordFirstFullOwnDeckPrompt};
