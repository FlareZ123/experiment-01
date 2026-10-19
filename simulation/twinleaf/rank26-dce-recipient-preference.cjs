'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Determine whether the unique held DCE should be protected during an
 * original-source rank26 first turn. This reads only own hand/public board.
 * @param {object} state Native Store state.
 * @param {object} own Native source player.
 * @param {0|1} seat Source physical seat.
 * @param {number} phase Pinned GamePhase.PLAYER_TURN.
 * @returns {boolean}
 */
function heldDceFirstTurn(state, own, seat, phase) {
  return Boolean(own && state.turn === 1 &&
    state.activePlayer === seat && state.phase === phase &&
    state.players[seat] === own && own.energyPlayedTurn < state.turn &&
    !state.prompts.some(p => p.result === undefined) &&
    own.hand.cards.some(c => c.name === 'Double Colorless Energy'));
}

/**
 * Find the public position of own Meloetta, without reading either deck.
 * @param {object} own Native source player.
 * @param {{ACTIVE:any,BENCH:any}} slots Pinned SlotType.
 * @returns {{slot:any,index:number}|null}
 */
function meloettaPosition(own, slots) {
  if (own.active.getPokemonCard()?.name === 'Meloetta ex') {
    return {slot: slots.ACTIVE, index: 0};
  }
  const i = own.bench.findIndex(s => s.getPokemonCard()?.name === 'Meloetta ex');
  return i < 0 ? null : {slot: slots.BENCH, index: i};
}

/**
 * Protect the single rank26 DCE against a generic AttachEnergyTactic choice.
 * When possible attach it directly to in-play Meloetta using the native
 * simulator validity check; otherwise defer normal Energy and let the bot
 * use its other tactics. This is a first-turn-only development policy.
 *
 * @template T
 * @param {0|1} seat Source physical seat.
 * @param {()=>T} execute Synchronous native Store experiment.
 * @returns {{result:T,policyAudit:object}}
 */
function withRank26DceRecipientPreference(seat, execute) {
  if (![0, 1].includes(seat) || typeof execute !== 'function') {
    throw new TypeError('Require rank26 source seat and synchronous runner');
  }
  const load = name => require(path.join(OUTPUT, name));
  const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');
  const {GamePhase} = load('game/store/state/state');
  const {PlayCardAction, PlayerType, SlotType} =
    load('game/store/actions/play-card-action');
  const previous = SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId = seat === 0 ? 101 : 202;
  const events = [];
  const override = function rank26DceRecipientPreference(state) {
    const selected = previous.call(this, state);
    const own = state.players[seat];
    if (this.client?.id !== sourceId ||
        !heldDceFirstTurn(state, own, seat, GamePhase.PLAYER_TURN) ||
        !(selected instanceof PlayCardAction)) {
      return selected;
    }
    const card = own.hand.cards[selected.handIndex];
    if (!['Lightning Energy', 'Double Colorless Energy'].includes(card?.name)) {
      return selected;
    }

    const position = meloettaPosition(own, SlotType);
    const dceIndex = own.hand.cards.findIndex(
      c => c.name === 'Double Colorless Energy');
    if (position) {
      const correct = selected.target?.player === PlayerType.BOTTOM_PLAYER &&
        selected.target.slot === position.slot &&
        selected.target.index === position.index &&
        card.name === 'Double Colorless Energy';
      if (correct) return selected;

      const replacement = new PlayCardAction(sourceId, dceIndex, {
        player: PlayerType.BOTTOM_PLAYER, ...position
      });
      if (this.isValidAction(state, replacement)) {
        events.push({kind: 'redirect-dce-to-meloetta', turn: state.turn,
          proposedCard: card.name, proposedTarget: selected.target,
          correctedTarget: position, sourceSeat: seat});
        return replacement;
      }
    }

    const savedTactics = this.tactics;
    assert.ok(Array.isArray(savedTactics) &&
      savedTactics.some(t => t.constructor.name === 'AttachEnergyTactic'),
      'Pinned AttachEnergyTactic instance missing');
    this.tactics = savedTactics.filter(
      t => t.constructor.name !== 'AttachEnergyTactic');
    let alternative;
    try {
      alternative = previous.call(this, state);
    } finally {
      this.tactics = savedTactics;
    }
    events.push({kind: position ? 'defer-invalid-dce-target' :
      'defer-dce-until-meloetta', turn: state.turn, sourceSeat: seat,
      proposedCard: card.name,
      alternativeAction: alternative?.constructor?.name ?? null,
      alternativeCard: alternative instanceof PlayCardAction ?
        (own.hand.cards[alternative.handIndex]?.name ?? null) : null});
    return alternative;
  };

  SimpleTacticsAi.prototype.decodeNextAction = override;
  try {
    return {result: execute(), policyAudit: {
      version: 'rank26-owner-visible-held-dce-target-v1',
      sourceSeat: seat, events, competitiveGameQualified: false
    }};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction, override,
      'Held-DCE wrapper unexpectedly replaced');
    SimpleTacticsAi.prototype.decodeNextAction = previous;
  }
}

module.exports = {
  heldDceFirstTurn, meloettaPosition, withRank26DceRecipientPreference
};
