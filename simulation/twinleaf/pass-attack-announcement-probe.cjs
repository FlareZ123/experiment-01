'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Enumerate visible attacks written on the Active Pokémon and attached Tools.
 * An attack obtained from another effect may be omitted; this census must
 * never be used as a certificate that all attack choices were enumerated.
 * @param {object} player Pinned Twinleaf player.
 * @returns {Array<{name:string,source:string}>}
 */
function visibleActiveAttacks(player) {
  const pokemon = player.active.getPokemonCard();
  if (!pokemon) return [];
  const result = [];
  const seen = new Set();
  for (const [cards, source] of [
    [[pokemon], 'printed'],
    [player.active.tools, 'attached-tool']
  ]) {
    for (const card of cards) {
      for (const attack of card.attacks || []) {
        if (typeof attack.name !== 'string' || seen.has(attack.name)) continue;
        seen.add(attack.name);
        result.push({name: attack.name, source});
      }
    }
  }
  return result;
}

/**
 * Attempt exactly one attack in a detached, seeded Store clone. As in the
 * existing TM Evolution announcement probe, acceptance means only that the
 * pinned engine accepted the action and may have produced prompts. It does
 * not prove that the attack's effects resolve or that the action is optimal.
 * @param {object} state Actual pre-pass game state.
 * @param {number} playerId The independently selected passing player's ID.
 * @param {string} attackName Visible candidate attack name.
 * @returns {boolean}
 */
function clonedStoreAcceptsAttack(state, playerId, attackName) {
  const load = name => require(path.join(output, name));
  const {deepClone} = load('utils');
  const {Store} = load('game/store/store');
  const {AttackAction} = load('game/store/actions/game-actions');
  const clone = new Store({onStateChange() {}});
  clone.state = deepClone(state);
  const previousRandom = Math.random;
  Math.random = () => 0.5;
  try {
    clone.dispatch(new AttackAction(playerId, attackName));
    return true;
  } catch {
    return false;
  } finally {
    Math.random = previousRandom;
  }
}

/**
 * Read-only, post-choice investigation of missed attack announcements.
 * Never expose its outcomes to a bot: a cloned reducer can inspect hidden
 * game state, which is not automatically known to a paper player.
 * @param {object} state Actual state before dispatching an already chosen Pass.
 * @param {number} playerId ID of the passing player.
 * @param {(state:object,playerId:number,attackName:string)=>boolean} [attempt]
 *   Test seam; production always uses the pinned Store clone.
 * @returns {object|null} Detached metadata containing public attack names.
 */
function probePassedAttackOptions(state, playerId, attempt = clonedStoreAcceptsAttack) {
  if (state.prompts.some(prompt => prompt.result === undefined)) return null;
  const player = state.players.find(side => side.id === playerId);
  if (!player) return null;
  const candidates = visibleActiveAttacks(player);
  const checked = candidates.slice(0, 8);
  return {
    evidenceType: 'post-choice-cloned-attack-announcements-v1',
    playerId,
    activePokemon: player.active.getPokemonCard()?.name || null,
    tested: checked.map(attack => ({
      ...attack, engineAcceptedAnnouncement: attempt(state, playerId, attack.name)
    })),
    truncated: candidates.length > checked.length,
    scope: 'Only visible printed and Tool attacks were attempted in detached pinned-Store clones after the policy chose Pass; no paper-rules or tactical-value conclusion.'
  };
}

module.exports = {visibleActiveAttacks, clonedStoreAcceptsAttack, probePassedAttackOptions};
