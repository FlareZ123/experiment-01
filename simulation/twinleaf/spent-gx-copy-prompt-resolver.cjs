'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const {ChooseAttackPromptResolver} = require(path.join(
  output, 'simple-bot/prompt-resolver/choose-attack-prompt-resolver'));
const {ChooseAttackPrompt} = require(path.join(
  output, 'game/store/prompts/choose-attack-prompt'));
const {ResolvePromptAction} = require(path.join(
  output, 'game/store/actions/resolve-prompt-action'));
const {GamePhase} = require(path.join(
  output, 'game/store/state/state'));
const {GameMessage} = require(path.join(
  output, 'game/game-message'));

/**
 * Opt-in narrowed correction for choosing copied attacks with an already
 * consumed GX allowance. Restrict to active attack-choice prompts and
 * preserve generic resolver behavior in all other situations.
 */
class SpentGxAwareChooseAttackPromptResolver extends ChooseAttackPromptResolver {
  /**
   * @param {any} state
   * @param {any} player
   * @param {any} prompt
   * @returns {any}
   */
  resolvePrompt(state, player, prompt) {
    const defaultAction = super.resolvePrompt(state, player, prompt);
    if (player.usedGX !== true ||
        state.phase !== GamePhase.ATTACK ||
        !(prompt instanceof ChooseAttackPrompt) ||
        prompt.message !== GameMessage.CHOOSE_ATTACK_TO_COPY ||
        !defaultAction?.result?.gxAttack) {
      return defaultAction;
    }

    const candidates = [];
    prompt.cards.forEach((card, index) => {
      for (const attack of card.attacks) {
        if (attack.gxAttack || attack.name === 'Foul Play' ||
            prompt.options.blocked.some(b =>
              b.index === index && b.attack === attack.name)) {
          continue;
        }
        if (prompt.validate(attack)) candidates.push(attack);
      }
    });
    candidates.sort((a, b) => b.damage - a.damage ||
      b.cost.length - a.cost.length);
    return candidates.length > 0 ?
      new ResolvePromptAction(prompt.id, candidates[0]) : defaultAction;
  }
}

/**
 * Register the policy only while a SimpleTacticsAi is constructed.
 * The original resolver registry is restored in a finally block.
 *
 * @template T
 * @param {()=>T} fn
 * @returns {T}
 */
function withSpentGxCopyResolver(fn) {
  const definitions = require(path.join(output,
    'simple-bot/simple-bot-definitions'));
  const list = definitions.allPromptResolvers;
  const i = list.findIndex(ctor => ctor.name === 'ChooseAttackPromptResolver');
  if (i < 0) throw new Error('Pinned copied-attack resolver not found');
  const original = list[i];
  list[i] = SpentGxAwareChooseAttackPromptResolver;
  try {
    return fn();
  } finally {
    list[i] = original;
  }
}

module.exports = {SpentGxAwareChooseAttackPromptResolver,withSpentGxCopyResolver};
