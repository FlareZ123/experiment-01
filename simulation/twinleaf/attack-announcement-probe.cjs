'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/**
 * Enumerate only attacks visible on the Active Pokémon or supplied by its
 * attached Tool. The pinned CheckPokemonAttacksEffect constructor takes the
 * first attached Tool's attacks into account. Preserve printing/source labels
 * without inspecting either player's hidden cards.
 *
 * @param {object} player Pinned Player, inspected after a decision to pass.
 * @returns {Array<{name:string,source:string}>}
 */
function publicAttackNames(player) {
  const active = player.active.getPokemonCard();
  if (!active) return [];
  const {CheckPokemonAttacksEffect} = load('game/store/effects/check-effects');
  const entries = [
    ...active.attacks.map(attack => ({name: attack.name, source: 'printed'})),
    ...new CheckPokemonAttacksEffect(player).attacks.map(attack =>
      ({name: attack.name, source: 'attached-tool'}))
  ];
  const seen = new Set();
  return entries.filter(entry => {
    if (seen.has(entry.name)) return false;
    seen.add(entry.name);
    return true;
  });
}

/**
 * For each publicly available named attack, test whether the pinned Store
 * accepts its announcement in an independent deep-cloned pre-pass state.
 * This is a post-decision observation, never a decision input or proof of
 * beneficial damage, complete resolution, or paper legality.
 *
 * The live State and its random generator are untouched, even if a cloned
 * dispatch throws. No hidden card identity is serialized.
 *
 * @param {object} state Real pinned Store state before PassTurnAction.
 * @param {number} playerId Player who already selected that pass.
 * @returns {object} Diagnostic with per-attack acceptance and pending prompts.
 */
function probeAttackAnnouncements(state, playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (!player) throw new Error('Unknown probe player.');
  const active = player.active.getPokemonCard();
  const candidates = publicAttackNames(player);
  const {deepClone} = load('utils');
  const {Card} = load('game/store/card/card');
  const {Store} = load('game/store/store');
  const {AttackAction} = load('game/store/actions/game-actions');
  const attempts = candidates.map(candidate => {
    const isolated = new Store({onStateChange() {}});
    isolated.state = deepClone(state, [Card]);
    const originalRandom = Math.random;
    Math.random = () => 0.5;
    try {
      isolated.dispatch(new AttackAction(playerId, candidate.name));
      return {...candidate, announcementAccepted: true,
        pendingPrompts: isolated.state.prompts
          .filter(prompt => prompt.result === undefined)
          .map(prompt => prompt.constructor.name)};
    } catch (error) {
      return {...candidate, announcementAccepted: false,
        rejection: String(error?.message ?? error)};
    } finally {
      Math.random = originalRandom;
    }
  });
  return {
    evidenceType: 'post-pass-cloned-attack-announcement-v1',
    activePokemon: active?.name ?? null,
    attempts,
    acceptedCount: attempts.filter(attempt => attempt.announcementAccepted).length,
    interpretation: 'Pinned Store announcement acceptance only. A chosen pass can be strategically correct; no successful attack resolution, beneficial damage or paper legality is established.'
  };
}

module.exports = {publicAttackNames, probeAttackAnnouncements};
