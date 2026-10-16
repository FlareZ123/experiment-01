'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/**
 * After a player independently chooses to pass with TM Evolution attached,
 * try announcing Evolution in an isolated pinned-Store clone. The clone is
 * deliberately not linked to real game reducers or the choice policy.
 *
 * Accepting an attack announcement does not establish successful evolution:
 * later target/prompt resolution, choice quality and paper rules still need
 * distinct validation.
 *
 * @param {object} state Actual store state before pass dispatch.
 * @param {number} playerId Player who has independently chosen to pass.
 * @returns {object} Exact action-announcement check, without prompted effects.
 */
function probeEvolutionAnnouncement(state, playerId) {
  const {deepClone} = load('utils');
  const {Card} = load('game/store/card/card');
  const {Store} = load('game/store/store');
  const {AttackAction} = load('game/store/actions/game-actions');
  const clone = new Store({onStateChange() {}});
  clone.state = deepClone(state, [Card]);
  const random = Math.random;
  // Randomness used by speculative engines must never consume live-game RNG.
  Math.random = () => 0.5;
  try {
    clone.dispatch(new AttackAction(playerId, 'Evolution'));
    return {
      evidenceType: 'cloned-tm-evolution-attack-announcement-v1',
      accepted: true,
      pendingPrompts: clone.state.prompts.filter(p => p.result === undefined)
        .map(p => p.constructor.name),
      scope: 'Pinned Store accepts announcement; evolution resolution and playing-policy quality are separate.'
    };
  } catch (error) {
    return {
      evidenceType: 'cloned-tm-evolution-attack-announcement-v1',
      accepted: false,
      failure: String(error?.message || error),
      scope: 'Pinned Store rejected the attempted announcement; does not independently certify paper legality.'
    };
  } finally {
    Math.random = random;
  }
}

module.exports = {probeEvolutionAnnouncement};
