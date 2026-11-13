'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const {hoodAttachTargets} =
  require('./hood-ability-lock-state.cjs');

/**
 * Return an opt-in, research-owned replacement for Twinleaf's generic
 * ChooseCardsPromptResolver. It only changes Arven's one-Item-plus-one-Tool
 * selection when Active Iron Thorns Initialization or equipped Garbotoxin
 * threatens a vacant Tool slot on a Benched Shadow Rider or an untooled Active
 * Shadow Rider VMAX. Bench VMAX is preferred; Active VMAX is a fallback only
 * when opponent Active Tool Jammer does not suppress its Tool. Jamming Tower
 * and Path to the Peak suppress both routes.
 *
 * This is a proof-of-concept tactical policy, not a general optimizer.
 * It does not solve Item/Supporter sequencing or subsequent Tool attachment.
 *
 * @returns {Function} Subclass usable inside options.promptResolvers.
 */
function hoodAwareArvenResolverClass(BaseResolverOverride=null) {
  /** @param {string} name */
  const mod = name => require(path.join(output, name));
  const { ChooseCardsPromptResolver: NativeChooseCardsPromptResolver } =
    mod('simple-bot/prompt-resolver/choose-cards-prompt-resolver');
  const ChooseCardsPromptResolver=BaseResolverOverride??NativeChooseCardsPromptResolver;
  const { ChooseCardsPrompt } = mod('game/store/prompts/choose-cards-prompt');
  const { GameMessage } = mod('game/game-message');
  const { TrainerType } = mod('game/store/card/card-types');
  const { ResolvePromptAction } = mod('game/store/actions/resolve-prompt-action');

  /**
   * @param {object} state
   * @param {object} player
   * @returns {boolean}
   */
  function underLockThreat(state, player) {
    const opponent = state.players.find(p => p.id !== player.id);
    return !!opponent&&hoodAttachTargets(player,opponent,state).length>0;
  }

  class HoodAwareArvenResolver extends ChooseCardsPromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state, player, prompt) {
      const baseline = super.resolvePrompt(state, player, prompt);
      if (!(prompt instanceof ChooseCardsPrompt) ||
          prompt.message !== GameMessage.CHOOSE_ONE_ITEM_AND_ONE_TOOL_TO_HAND ||
          !baseline?.result || !underLockThreat(state, player) ||
          player.hand.cards.some(card => card.name === 'Stealthy Hood')) {
        return baseline;
      }

      const hood = prompt.cards.cards.find(card =>
        card.name === 'Stealthy Hood' && card.trainerType === TrainerType.TOOL
      );
      if (!hood) return baseline;

      const proposed = baseline.result.slice();
      const selectedTool = proposed.findIndex(card => card.trainerType === TrainerType.TOOL);
      if (selectedTool >= 0) {
        proposed[selectedTool] = hood;
      } else if (proposed.length < prompt.options.max) {
        proposed.push(hood);
      } else {
        return baseline;
      }

      if (!prompt.validate(proposed)) return baseline;
      return new ResolvePromptAction(prompt.id, proposed);
    }
  }

  return HoodAwareArvenResolver;
}

module.exports = { hoodAwareArvenResolverClass };
