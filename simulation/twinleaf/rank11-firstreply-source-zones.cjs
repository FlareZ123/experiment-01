'use strict';

const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * An observational wrapper around the pinned Store's existing bot decoder.
 * Captures the source player's real card zones at the first opposing ordinary
 * decision after the source's initial turn. No recorded data is fed back to
 * bot choices; the original decoder is always restored.
 *
 * @template T
 * @param {0|1} sourceSeat Physical seat of the published rank11 60
 * @param {()=>T} execute Synchronous deterministic actual-source match
 * @returns {{result:T,witness:object|null}}
 */
function withFirstReplySourceZones(sourceSeat, execute) {
  if (![0, 1].includes(sourceSeat) || typeof execute !== 'function') {
    throw new TypeError('Require source seat and synchronous source match.');
  }
  const {SimpleTacticsAi} =
    require(path.join(OUTPUT, 'simple-bot/simple-tactics-ai'));
  const {GamePhase} = require(path.join(OUTPUT, 'game/store/state/state'));
  const old = SimpleTacticsAi.prototype.decodeNextAction;
  const candidateSeat = 1 - sourceSeat;
  const candidateId = candidateSeat === 0 ? 101 : 202;
  let witness = null;

  SimpleTacticsAi.prototype.decodeNextAction = function firstReplyZones(state) {
    if (!witness && state.turn === 2 &&
        state.phase === GamePhase.PLAYER_TURN &&
        state.activePlayer === candidateSeat &&
        this.client?.id === candidateId &&
        !state.prompts.some(prompt => prompt.result === undefined)) {
      const source = state.players[sourceSeat];
      const copy = cards => cards.cards.map(card => card.fullName);
      witness = {
        turn: state.turn,
        sourceSeat, candidateSeat,
        sourceHand: copy(source.hand),
        sourceDiscard: copy(source.discard),
        sourceLostZone: copy(source.lostzone),
        sourceActive: source.active.getPokemonCard()?.fullName || null,
        sourceActiveTools: source.active.tools.map(card => card.fullName),
        sourceBench: source.bench.filter(slot => slot.getPokemonCard()).map(slot => ({
          pokemon: slot.getPokemonCard().fullName,
          tools: slot.tools.map(card => card.fullName)
        }))
      };
    }
    return old.call(this, state);
  };
  try {
    const result = execute();
    return {result, witness};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = old;
  }
}

module.exports = {withFirstReplySourceZones};
