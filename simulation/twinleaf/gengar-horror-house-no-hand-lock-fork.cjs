'use strict';
const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const FIELDS = Object.freeze([
  'cannotPlayItemCards', 'cannotPlaySupporterCards', 'cannotPlayStadiumCards',
  'cannotPlayToolCards', 'cannotPlaySpecialEnergyCards',
  'cannotPlayEnergyCards', 'cannotPlayPokemonCards', 'playLocksTurnsRemaining'
]);

/**
 * Reversible, explicitly non-paper counterfactual, for source-dealt games.
 * Restores defending Player hand lock flags to pre-attack state after an
 * otherwise normal Horror House-GX effect. GX consumption and other effects
 * remain active. The branch operates only in the real Store, excluding the
 * detached Simulator used while the bot evaluates hypothetical choices.
 * Never use this to estimate competitive game win rates.
 * @template T
 * @param {()=>T} run Synchronous actual-source match.
 * @param {number} attackingPlayerId Physical Player.id.
 * @returns {{result:T,observed:object[]}}
 */
function withHorrorHouseNoHandLockFork(run, attackingPlayerId) {
  const load = name => require(path.join(output, name));
  const {GengarMimikyuGX} =
    load('sets/08-sun-and-moon/set-team-up/gengar-and-mimikyu-gx');
  const {WAS_ATTACK_USED} = load('game/store/prefabs/prefabs');
  const {StateUtils} = load('game/store/state-utils');
  const {Store} = load('game/store/store');
  const original = GengarMimikyuGX.prototype.reduceEffect;
  const observed = [];

  function fork(store, state, effect) {
    if (store.constructor !== Store ||
        !WAS_ATTACK_USED(effect, 1, this) ||
        effect.player.id !== attackingPlayerId) {
      return original.call(this, store, state, effect);
    }
    const defender = StateUtils.getOpponent(state, effect.player);
    const previous = Object.fromEntries(FIELDS.map(key => [key, defender[key]]));
    const result = original.call(this, store, state, effect);
    const printedApplied = Object.fromEntries(FIELDS.map(key => [key, defender[key]]));
    for (const key of FIELDS) defender[key] = previous[key];
    observed.push({attackingPlayerId, defendingPlayerId:defender.id,
      turn:state.turn, previous, printedApplied,
      restored:Object.fromEntries(FIELDS.map(key => [key, defender[key]]))});
    return result;
  }
  GengarMimikyuGX.prototype.reduceEffect = fork;
  try {
    return {result:run(), observed};
  } finally {
    GengarMimikyuGX.prototype.reduceEffect = original;
  }
}
module.exports = {withHorrorHouseNoHandLockFork, FIELDS};
