'use strict';

const path = require('node:path');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName @returns {any} */
const load = moduleName => require(path.join(root, moduleName));

/**
 * The source rank-10 Temple trial has an Active Latias ex holding exactly two
 * basic Psychic, another Psychic in hand, and opposing Active Koraidon ex.
 * Under this specific visible-board pattern, reserve the normal attachment
 * for Latias to cover its printed Eon Blade cost. The choice is a policy probe.
 *
 * @param {object} player Pinned Twinleaf Player.
 * @param {object|undefined} opponent Opposing Player.
 * @returns {{handIndex:number}|null}
 */
function chooseLatiasAttackReadyAttachment(player, opponent) {
  const self = player?.active?.getPokemonCard?.();
  const other = opponent?.active?.getPokemonCard?.();
  if (self?.name !== 'Latias ex' || other?.name !== 'Koraidon ex') return null;
  const energy = player.active.energies.cards;
  if (energy.length !== 2 || energy.some(card => card.name !== 'Psychic Energy') ||
      player.active.cannotAttachEnergyFromHandNextTurn) return null;
  const handIndex = player.hand.cards.findIndex(card => card.name === 'Psychic Energy');
  if (handIndex < 0) return null;
  const stadiums = [player.stadium, opponent.stadium]
    .flatMap(slot => slot?.cards || []).map(card => card.name);
  if (!stadiums.includes('Sky Field')) return null;
  return {handIndex};
}

/**
 * Opt-in source-state attachment improvement, validated by a cloned Store.
 * The upstream general attachment tactic remains in place as fallback.
 * @returns {Function} SimpleTacticsAi-compatible class.
 */
function makeLatiasAttackReadyAttachmentTactic() {
  const {SimpleTactic} = load('simple-bot/simple-tactics/simple-tactics');
  const {PlayCardAction,PlayerType,SlotType} =
    load('game/store/actions/play-card-action');
  const {Simulator} = load('game/bots/simulator');

  return class LatiasAttackReadyAttachmentTactic extends SimpleTactic {
    /** @param {object} state @param {object} player @returns {object|undefined} */
    useTactic(state,player) {
      if (state.prompts.some(p => p.result === undefined) ||
          player.energyPlayedTurn >= state.turn) return;
      const opponent = state.players.find(p => p.id !== player.id);
      const choice = chooseLatiasAttackReadyAttachment(player, opponent);
      if (!choice) return;
      const action = new PlayCardAction(player.id, choice.handIndex, {
        player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
      });
      try {
        const simulator = new Simulator(state, this.options.arbiter);
        simulator.dispatch(action);
        return action;
      } catch {
        return;
      }
    }
  };
}

/**
 * Insert only into a cloned per-run tactics array, ahead of upstream Energy
 * allocation. Never alter the pinned Twinleaf dependency.
 * @param {object} options Pinned bot tactic and resolver options.
 * @returns {object}
 */
function withLatiasAttackReadyAttachment(options) {
  const index = options.tactics.findIndex(t => t.name === 'AttachEnergyTactic');
  if (index < 0) throw new Error('Pinned AttachEnergyTactic missing.');
  return {
    ...options,
    tactics: [
      ...options.tactics.slice(0,index),
      makeLatiasAttackReadyAttachmentTactic(),
      ...options.tactics.slice(index)
    ]
  };
}

module.exports = {
  chooseLatiasAttackReadyAttachment,
  makeLatiasAttackReadyAttachmentTactic,
  withLatiasAttackReadyAttachment
};
