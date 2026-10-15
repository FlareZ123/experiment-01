'use strict';
const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output, name));

/**
 * Experimental, opt-in copied-attack prompt policy.
 *
 * Applies only to Regidrago VSTAR's Apex Dragon and only when a printed
 * Dragapult ex Phantom Dive copy is present. It treats a vulnerable Benched
 * Pokémon with at most 60 HP remaining as a potential immediate Prize. This
 * is an explicitly incomplete tactical heuristic, not an evaluated bot.
 *
 * @returns {new (options: any) => any} A SimpleTacticsAi-compatible resolver.
 */
function createRegidragoPrizeWindowResolver() {
  const { ChooseAttackPrompt } = engine('game/store/prompts/choose-attack-prompt');
  const { ResolvePromptAction } = engine('game/store/actions/resolve-prompt-action');

  return class RegidragoPrizeWindowResolver {
    /** @param {any} _options */
    constructor(_options) {}

    /** @param {any} state @param {any} player @param {any} prompt */
    resolvePrompt(state, player, prompt) {
      if (!(prompt instanceof ChooseAttackPrompt) ||
          player.active.getPokemonCard()?.fullName !== 'Regidrago VSTAR SIT') {
        return undefined;
      }

      const defender = state.players.find(candidate => candidate.id !== player.id);
      const hasPotentialBenchKO = defender?.bench.some(slot => {
        const pokemon = slot.getPokemonCard();
        return pokemon && pokemon.hp - slot.damage <= 60 && pokemon.hp - slot.damage > 0 &&
          pokemon.powers.length === 0 && slot.tools.length === 0;
      });
      if (!hasPotentialBenchKO) return undefined;

      const index = prompt.cards.findIndex(card => card.fullName === 'Dragapult ex TWM');
      if (index < 0 || prompt.options.blocked.some(item =>
        item.index === index && item.attack === 'Phantom Dive')) return undefined;

      const phantomDive = prompt.cards[index].attacks.find(attack => attack.name === 'Phantom Dive');
      return phantomDive ? new ResolvePromptAction(prompt.id, phantomDive) : undefined;
    }
  };
}

module.exports = { createRegidragoPrizeWindowResolver };
