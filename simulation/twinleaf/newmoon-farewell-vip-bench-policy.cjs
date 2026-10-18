'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Decide using only the acting player's visible first-turn hand and Bench.
 * Do not look at the deck, face-down Prizes or the opponent's private hand.
 *
 * Farewell is deliberately limited to two unattached Benched Unown, and only
 * when a first-turn Battle VIP Pass would otherwise face at most two free
 * ordinary Bench positions. The second activation completes an already
 * started two-Unown clearing line. This is a test policy, not an optimizer.
 *
 * @param {object} state Actual pinned Store State.
 * @param {object} player The acting player's own State.
 * @param {0|1} candidateSeat Physical seat known from the input deck.
 * @param {string} playerTurnPhase Pinned GamePhase.PLAYER_TURN.
 * @param {number} accepted How many earlier Farewell actions were accepted.
 * @returns {number} Eligible Bench index, or -1.
 */
function firstTurnFarewellIndex(state, player, candidateSeat,
  playerTurnPhase, accepted) {
  if (state.phase !== playerTurnPhase ||
      state.activePlayer !== candidateSeat || state.turn > 2 ||
      accepted >= 2) return -1;
  if (!player.hand.cards.some(card => card.fullName === 'Battle VIP Pass FST')) {
    return -1;
  }
  const freeSlots = player.bench.filter(slot => !slot.getPokemonCard()).length;
  if (accepted === 0 && freeSlots > 2) return -1;
  return player.bench.findIndex(slot =>
    slot.getPokemonCard()?.fullName === 'Unown AOR' &&
    slot.tools.length === 0 && slot.energies.cards.length === 0);
}

/**
 * @param {object} player Own side only.
 * @returns {object} Own-information, printing-aware public zone snapshot.
 */
function ownOpening(player) {
  return {
    active: player.active.getPokemonCard()?.fullName || null,
    hand: player.hand.cards.map(card => card.fullName),
    bench: player.bench.map(slot => slot.getPokemonCard()?.fullName || null),
    benchEnergyCounts: player.bench.map(slot => slot.energies.cards.length),
    benchToolCounts: player.bench.map(slot => slot.tools.length),
    freeBenchSlots: player.bench.filter(slot => !slot.getPokemonCard()).length
  };
}

/**
 * Temporarily place a restricted Farewell Letter policy ahead of an existing
 * opt-in VIP policy. Install this INSIDE withVIP (the last prototype wrapper
 * must act first), so Farewell clears Bench slots before VIP is played.
 * Restores the exact pinned decoder even when the experiment throws.
 *
 * @template T
 * @param {()=>T} execute Synchronous source-dealt game.
 * @param {{enabled:boolean,candidateSeat:0|1}} configuration Known input seat.
 * @returns {{result:T,audit:object}}
 */
function withFarewellBeforeVip(execute, {enabled, candidateSeat}) {
  assert.equal(typeof execute, 'function');
  assert.ok(candidateSeat === 0 || candidateSeat === 1);
  const {SimpleTacticsAi} = require(path.join(OUTPUT,
    'simple-bot/simple-tactics-ai'));
  const {UseAbilityAction} = require(path.join(OUTPUT,
    'game/store/actions/game-actions'));
  const {PlayerType, SlotType} = require(path.join(OUTPUT,
    'game/store/actions/play-card-action'));
  const {GamePhase} = require(path.join(OUTPUT, 'game/store/state/state'));
  const prior = SimpleTacticsAi.prototype.decodeNextAction;
  const expectedId = candidateSeat === 0 ? 101 : 202;
  const events = [];
  let opening = null;
  let accepted = 0;

  const handler = function farewellFirst(state) {
    const isOwner = this.client?.id === expectedId;
    const turn = state.phase === GamePhase.PLAYER_TURN &&
      state.activePlayer === candidateSeat && state.turn <= 2;
    const pending = state.prompts.some(prompt => prompt.result === undefined);
    if (isOwner && turn && !pending) {
      const player = state.players[candidateSeat];
      if (!opening) opening = ownOpening(player);
      const benchIndex = firstTurnFarewellIndex(state, player, candidateSeat,
        GamePhase.PLAYER_TURN, accepted);
      if (enabled && benchIndex >= 0) {
        const action = new UseAbilityAction(player.id, 'Farewell Letter', {
          player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH,
          index: benchIndex
        });
        const legal = this.isValidAction(state, action);
        events.push({kind:'farewell-legal-action-check', turn:state.turn,
          benchIndex, legal, before:ownOpening(player)});
        if (legal) {
          accepted += 1;
          return action;
        }
      }
      if (accepted > 0 && events.at(-1)?.kind !== 'farewell-next-root') {
        events.push({kind:'farewell-next-root', turn:state.turn,
          after:ownOpening(player)});
      }
    }
    return prior.call(this, state);
  };
  SimpleTacticsAi.prototype.decodeNextAction = handler;
  try {
    return {result:execute(), audit:{
      schema:'newmoon-farewell-before-vip-source-v1',
      enabled, candidateSeat, opening, acceptedAbilityActions:accepted, events,
      competitivePolicyQualified:false
    }};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction, handler);
    SimpleTacticsAi.prototype.decodeNextAction = prior;
  }
}

module.exports = {
  firstTurnFarewellIndex, ownOpening, withFarewellBeforeVip
};
