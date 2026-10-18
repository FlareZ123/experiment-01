'use strict';
const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * A printed first-turn Meloetta can reach Crisis Punch only when the normal
 * hand attachment remains available for Double Colorless Energy. This guard
 * uses public board/turn and the acting player's hand, never hidden deck data.
 * @param {object} state
 * @param {object} own
 * @param {0|1} sourceSeat
 * @param {number} turnPhase
 * @returns {boolean}
 */
function rank26DceReservationOpportunity(state, own, sourceSeat, turnPhase) {
  return Boolean(own && state.turn === 1 &&
    state.activePlayer === sourceSeat && state.phase === turnPhase &&
    state.players[sourceSeat] === own && own.energyPlayedTurn < state.turn &&
    own.active.getPokemonCard()?.name === 'Meloetta ex' &&
    !state.prompts.some(prompt => prompt.result === undefined));
}

/**
 * Replace a selected first-turn basic Lightning attachment with a legal
 * held DCE attachment, or defer the normal Energy action to allow other
 * source-bot tactics to search/draw. Other turns and seats are unchanged.
 *
 * This is a versioned policy counterfactual, never a competitive bot claim.
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withRank26DceReservation(sourceSeat, execute) {
  if (![0, 1].includes(sourceSeat) || typeof execute !== 'function')
    throw new TypeError('Require rank26 physical seat and synchronous run.');
  const engine = relative => require(path.join(OUTPUT, relative));
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const {GamePhase} = engine('game/store/state/state');
  const {PlayCardAction, PlayerType, SlotType} =
    engine('game/store/actions/play-card-action');
  const previous = SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId = sourceSeat === 0 ? 101 : 202;
  const decisions = [];
  SimpleTacticsAi.prototype.decodeNextAction = function reserveRank26Dce(state) {
    const selected = previous.call(this, state);
    const own = state.players[sourceSeat];
    if (this.client?.id !== sourceId ||
        !rank26DceReservationOpportunity(state, own, sourceSeat,
          GamePhase.PLAYER_TURN) ||
        !(selected instanceof PlayCardAction) ||
        own.hand.cards[selected.handIndex]?.name !== 'Lightning Energy') {
      return selected;
    }

    const basic = own.hand.cards[selected.handIndex];
    const dceIndex = own.hand.cards.findIndex(card =>
      card.name === 'Double Colorless Energy');
    if (dceIndex >= 0) {
      const replacement = new PlayCardAction(sourceId, dceIndex, {
        player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
      });
      if (this.isValidAction(state, replacement)) {
        decisions.push({
          turn: state.turn, sourceSeat, oldCard: basic.fullName,
          decision: 'attach-held-double-colorless',
          newCard: own.hand.cards[dceIndex].fullName,
          information: 'own hand and public board'
        });
        return replacement;
      }
    }

    // The pinned source constructs an instance-local tactics list. Temporarily
    // remove the premature normal-energy tactic, preserving every other tactic.
    const originalTactics = this.tactics;
    if (!Array.isArray(originalTactics) ||
        !originalTactics.some(t => t.constructor.name === 'AttachEnergyTactic'))
      throw new Error('Pinned AttachEnergyTactic instance missing.');
    this.tactics = originalTactics.filter(
      tactic => tactic.constructor.name !== 'AttachEnergyTactic');
    let alternative;
    try {
      alternative = previous.call(this, state);
    } finally {
      this.tactics = originalTactics;
    }
    const otherCard = alternative instanceof PlayCardAction
      ? own.hand.cards[alternative.handIndex]?.fullName || null : null;
    decisions.push({
      turn: state.turn, sourceSeat, oldCard: basic.fullName,
      decision: 'defer-basic-lightning',
      heldDce: dceIndex >= 0,
      nextAction: alternative?.constructor.name || null,
      nextCard: otherCard,
      information: 'own hand and public board'
    });
    return alternative;
  };
  try {
    return {result: execute(), policyAudit: {
      version: 'rank26-first-turn-dce-reservation-v1',
      sourceSeat, decisions, competitiveGameQualified: false
    }};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = previous;
  }
}

module.exports = {rank26DceReservationOpportunity, withRank26DceReservation};
