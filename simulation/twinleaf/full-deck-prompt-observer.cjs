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

/**
 * Existing root-action evidence records the same direct owner-deck CardList
 * identity in selectedCardsEvidence.sourceZone. From those POST-choice
 * diagnostics, locate the first verified owner-visible complete-deck prompt
 * resolution in each physical seat without inspecting hidden game state.
 *
 * The prompt was visible before its ResolvePromptAction; the action ordinal is
 * a conservative bound for subsequent decisions, not the exact reveal tick.
 * Absence of a match is unknown, not proof that a player remained at K0.
 *
 * @param {Array<object>} chronologicalMeaningfulActions
 * @returns {Array<{seat:number,actionOrdinal:number,turn:number,message:string|null}>}
 */
function firstFullDeckResolutions(chronologicalMeaningfulActions) {
  const first=new Map();
  for(const row of chronologicalMeaningfulActions) {
    const choice=row.cardSelection;
    if (row.action!=='ResolvePromptAction' ||
        choice?.promptKind!=='ChooseCardsPrompt' ||
        choice.sourceZone!=='deck' ||
        choice.sourcePlayerSlot!==row.playerSlot ||
        ![0,1].includes(row.playerSlot) || first.has(row.playerSlot)) continue;
    first.set(row.playerSlot,{
      seat:row.playerSlot,
      actionOrdinal:row.actionOrdinal,
      turn:row.turnBefore,
      message:choice.message??null
    });
  }
  return [...first.values()].sort((a,b)=>a.seat-b.seat);
}

module.exports={fullOwnDeckPrompt,recordFirstFullOwnDeckPrompt,firstFullDeckResolutions};
