'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Snapshot only what the candidate is allowed to know at a native root.
 * No speculative engine action, hidden-zone traversal or Game State mutation.
 * @param {object} state Native State passed to the real candidate bot.
 * @param {0|1} seat Candidate physical seat.
 * @param {number} playerTurn Native GamePhase.PLAYER_TURN.
 * @returns {object|null}
 */
function candidateTurn19Snapshot(state, seat, playerTurn) {
  if (state.turn !== 19 || state.activePlayer !== seat ||
      state.phase !== playerTurn ||
      state.prompts.some(p => p.result === undefined)) return null;
  const actor = state.players[seat];
  const opponent = state.players[1 - seat];
  const active = actor.active.getPokemonCard();
  if (!active) return null;
  const publicSlot = slot => ({
    pokemon: slot.getPokemonCard()?.fullName ?? null,
    energy: slot.energies.cards.map(c => c.fullName),
    damage: slot.damage
  });
  return {
    turn: state.turn,
    candidateSeat: seat,
    candidateActive: publicSlot(actor.active),
    candidatePrintedStage: active.stage,
    candidatePrintedAttacks: (active.attacks || []).map(a => ({
      name: a.name, cost: [...(a.cost || [])], damage: a.damage ?? null
    })),
    candidateBench: actor.bench.map(publicSlot),
    candidateHand: actor.hand.cards.map(c => c.fullName),
    candidateUsedEnergyAttachment: actor.energyPlayedTurn === state.turn,
    candidateUsedSupporter: actor.supporterTurn === state.turn,
    sourceActive: publicSlot(opponent.active),
    sourceBench: opponent.bench.map(publicSlot),
    sourceStadium: opponent.stadium.cards.map(c => c.fullName)
  };
}

/**
 * Observe the actual candidate decision at turn 19, preserving the original
 * decoded action and respecting other temporarily installed source policies.
 * @template T
 * @param {()=>T} execute Synchronous genuine-Store match.
 * @param {0|1} seat Candidate seat.
 * @returns {{result:T,observations:object[]}}
 */
function withRank15CandidateTurn19ReadOnly(execute, seat) {
  assert.equal(typeof execute, 'function');
  assert.ok(seat === 0 || seat === 1);
  const {SimpleTacticsAi} = require(path.join(OUTPUT, 'simple-bot/simple-tactics-ai'));
  const {GamePhase} = require(path.join(OUTPUT, 'game/store/state/state'));
  const descriptor = Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype, 'decodeNextAction');
  assert.equal(typeof descriptor?.value, 'function');
  const clientId = seat === 0 ? 101 : 202;
  const observations = [];
  function observe(state) {
    const capture = this.client?.id === clientId &&
      observations.length < 20 &&
      candidateTurn19Snapshot(state, seat, GamePhase.PLAYER_TURN);
    const chosen = descriptor.value.call(this, state);
    if (capture) observations.push({
      ...capture,
      chosenNativeAction: chosen?.constructor?.name || null,
      chosenPrintedAttack: typeof chosen?.attack === 'string' ? chosen.attack : null
    });
    return chosen;
  }
  Object.defineProperty(SimpleTacticsAi.prototype,
    'decodeNextAction', {...descriptor, value: observe});
  try { return {result: execute(), observations}; }
  finally {
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction', descriptor);
  }
}

module.exports = {candidateTurn19Snapshot, withRank15CandidateTurn19ReadOnly};
