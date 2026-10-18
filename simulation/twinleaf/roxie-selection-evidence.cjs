'use strict';

/**
 * Audit only actually selected hand discards in an existing match trace.
 * Setup choices can also have `sourceZone: 'hand'` and must be excluded.
 * This function does not observe subsequent optional Ability confirmations.
 *
 * @param {{decisionTrace?:object[]}} game
 * @param {number} rank31Seat
 * @returns {{roxiePlays:object[],koffingHandDiscards:object[]}}
 */
function roxieExposure(game, rank31Seat) {
  const actions = (game.decisionTrace || []).filter(
    entry => entry.playerSlot === rank31Seat
  );
  const roxiePlays = actions.filter(entry =>
    entry.action === 'PlayCardAction' && entry.card === 'Roxie'
  ).map(entry => ({
    ordinal:entry.actionOrdinal, turn:entry.turnBefore
  }));
  const handDiscards = actions.filter(entry =>
    entry.cardSelection?.message === 'CHOOSE_CARD_TO_DISCARD' &&
    entry.cardSelection?.sourceZone === 'hand' &&
    entry.cardSelection?.sourcePlayerSlot === rank31Seat &&
    entry.cardSelection?.selectedCards?.some(card =>
      typeof card === 'string' && card.startsWith('Koffing CEC')
    )
  ).map(entry => ({
    ordinal:entry.actionOrdinal,
    turn:entry.turnBefore,
    promptMessage:entry.cardSelection.message,
    selectedCards:entry.cardSelection.selectedCards
  }));
  return {roxiePlays, koffingHandDiscards:handDiscards};
}

module.exports = {roxieExposure};
