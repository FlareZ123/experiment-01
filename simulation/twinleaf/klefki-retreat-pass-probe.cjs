'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Source-grounded prefilter for an observed Raichu/Electrode opponent Pass.
 * A zero-cost Dedenne retreat to an Energy-equipped Klefki can make a new
 * attack available despite every printed attack on Dedenne being unavailable.
 * This prefilter cannot certify status conditions, modifiers or effects.
 *
 * @param {object} state Pinned source-dealt state before an already chosen Pass.
 * @param {number} playerId Passing player's id.
 * @returns {{seat:number,benchIndex:number}|null}
 */
function visibleKlefkiRetreatCandidate(state, playerId) {
  if (state.prompts.some(prompt => prompt.result === undefined)) return null;
  const seat = state.players.findIndex(player => player.id === playerId);
  if (seat < 0 || state.activePlayer !== seat) return null;
  const player = state.players[seat];
  if (player.active.getPokemonCard()?.name !== 'Dedenne-GX') return null;
  if (!player.active.tools.cards.some(card => card.name === 'U-Turn Board')) return null;
  const benchIndex = player.bench.findIndex(slot =>
    slot.getPokemonCard()?.name === 'Klefki' &&
    slot.energies.cards.some(card => card.name === 'Counter Energy'));
  return benchIndex < 0 ? null : {seat, benchIndex};
}

/**
 * Attempt a two-action branch in a detached pinned Store, after a policy Pass.
 * A successful dispatch proves pinned-engine action acceptance only, subject
 * to the engine's known clone alias and paper-rules validation gaps.
 *
 * @param {object} state Original live state; no actions are dispatched on it.
 * @param {number} playerId Acting player id.
 * @param {(state:object,playerId:number,benchIndex:number)=>object} [attempt]
 *   Test seam; the production action path uses the pinned compiled Store.
 * @returns {object|null} Explicitly unqualified research-only evidence.
 */
function probeKlefkiRetreatAfterPass(state, playerId, attempt = clonedRetreatAndAttack) {
  const match = visibleKlefkiRetreatCandidate(state, playerId);
  if (!match) return null;
  return {
    evidenceType: 'post-pass-dedenne-klefki-retreat-joust-source-probe-v1',
    playerId, benchIndex: match.benchIndex,
    result: attempt(state, playerId, match.benchIndex),
    qualifiedForCompetitiveInference: false,
    scope: 'Detached pinned-engine RetreatAction followed by Joust AttackAction after an already selected Pass. Cloned state, paper-effect fidelity, opponent competence, and optimality are unqualified.'
  };
}

/** @param {object} state @param {number} playerId @param {number} benchIndex */
function clonedRetreatAndAttack(state, playerId, benchIndex) {
  const load = name => require(path.join(output, name));
  const {deepClone} = load('utils');
  const {Store} = load('game/store/store');
  const {RetreatAction, AttackAction} = load('game/store/actions/game-actions');
  const clone = new Store({onStateChange() {}});
  clone.state = deepClone(state);
  const originalRandom = Math.random;
  Math.random = () => 0.5;
  let retreatAccepted = false;
  let attackAccepted = false;
  let retreatError = null;
  let attackError = null;
  try {
    try {
      clone.dispatch(new RetreatAction(playerId, benchIndex));
      retreatAccepted = clone.state.players.find(player =>
        player.id === playerId).active.getPokemonCard()?.name === 'Klefki';
    } catch (error) {
      retreatError = String(error?.message || error);
    }
    if (retreatAccepted) {
      try {
        clone.dispatch(new AttackAction(playerId, 'Joust'));
        attackAccepted = true;
      } catch (error) {
        attackError = String(error?.message || error);
      }
    }
  } finally {
    Math.random = originalRandom;
  }
  return {retreatAccepted, attackAccepted, retreatError, attackError};
}

module.exports = {
  visibleKlefkiRetreatCandidate,
  probeKlefkiRetreatAfterPass,
  clonedRetreatAndAttack
};
