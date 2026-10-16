'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine = modulePath => require(path.join(output, modulePath));

/**
 * Only public information: the printed active, exposed discard, the
 * immediately preceding opponent attack record and our own GX allowance.
 * The last-attack record needs the separate opt-in pass/history semantics
 * corrections; this policy does not repair game rules by itself.
 *
 * @param {object} state
 * @param {object} player
 * @returns {boolean}
 */
function isCopycatApexTimelessSituation(state, player) {
  const active = player.active.getPokemonCard();
  const opponent = state.players.find(p => p.id !== player.id);
  const last = opponent && state.playerLastAttack?.[opponent.id];
  return active?.fullName === 'Mimikyu GRI' &&
    player.usedGX !== true &&
    last?.sourceCard?.fullName === 'Regidrago VSTAR SIT' &&
    last?.attack?.name === 'Apex Dragon' &&
    last.attack.gxAttack !== true &&
    player.discard.cards.some(card => card.fullName === 'Dialga-GX UPR');
}

/** @returns {Function} A research-only SimpleTactic subclass. */
function makeCopycatApexTimelessTactic() {
  const {SimpleTactic} = engine('simple-bot/simple-tactics/simple-tactics');
  const {AttackAction} = engine('game/store/actions/game-actions');

  return class CopycatApexTimelessTactic extends SimpleTactic {
    /** @param {object} state @param {object} player */
    useTactic(state, player) {
      if (!isCopycatApexTimelessSituation(state, player)) return undefined;
      return new AttackAction(player.id, 'Copycat');
    }
  };
}

/** @returns {Function} A research-only ChooseAttackPromptResolver subclass. */
function makeCopycatApexTimelessResolver() {
  const {ChooseAttackPromptResolver} =
    engine('simple-bot/prompt-resolver/choose-attack-prompt-resolver');
  const {ChooseAttackPrompt} =
    engine('game/store/prompts/choose-attack-prompt');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const {GamePhase} = engine('game/store/state/state');

  return class CopycatApexTimelessResolver extends ChooseAttackPromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state, player, prompt) {
      if (!(prompt instanceof ChooseAttackPrompt) ||
          prompt.playerId !== player.id || state.phase !== GamePhase.ATTACK ||
          !isCopycatApexTimelessSituation(state, player)) {
        return super.resolvePrompt(state, player, prompt);
      }
      for (const card of prompt.cards) {
        if (card.fullName !== 'Dialga-GX UPR' ||
            !player.discard.cards.includes(card)) continue;
        const timeless = card.attacks.find(attack => attack.name === 'Timeless-GX');
        if (timeless && prompt.validate(timeless)) {
          return new ResolvePromptAction(prompt.id, timeless);
        }
      }
      return super.resolvePrompt(state, player, prompt);
    }
  };
}

/**
 * Insert an exact, visible-board Copycat counterline before the upstream
 * attack tactic and custom attack choice before its default resolver.
 * Preserve all remaining tactic/resolver precedence. Reapplying is a no-op.
 *
 * @param {object} options Pinned SimpleBotOptions.
 * @returns {object} New configured options or the unchanged configured object.
 */
function withCopycatApexTimelessPolicy(options) {
  const tactics = options.tactics;
  const resolvers = options.promptResolvers;
  if (!Array.isArray(tactics) || !Array.isArray(resolvers)) {
    throw new Error('Pinned tactic/resolver arrays required');
  }
  if (tactics.some(t => t.name === 'CopycatApexTimelessTactic') &&
      resolvers.some(r => r.name === 'CopycatApexTimelessResolver')) return options;
  const attackIndex = tactics.findIndex(t => t.name === 'AttackTactic');
  const resolveIndex = resolvers.findIndex(r => r.name === 'ChooseAttackPromptResolver');
  if (attackIndex < 0 || resolveIndex < 0) {
    throw new Error('Pinned attack tactic or attack choice resolver unavailable');
  }
  return {
    ...options,
    tactics: [...tactics.slice(0, attackIndex), makeCopycatApexTimelessTactic(),
      ...tactics.slice(attackIndex)],
    promptResolvers: [
      ...resolvers.slice(0, resolveIndex), makeCopycatApexTimelessResolver(),
      ...resolvers.slice(resolveIndex)
    ]
  };
}

module.exports = {
  isCopycatApexTimelessSituation,
  makeCopycatApexTimelessTactic,
  makeCopycatApexTimelessResolver,
  withCopycatApexTimelessPolicy
};
