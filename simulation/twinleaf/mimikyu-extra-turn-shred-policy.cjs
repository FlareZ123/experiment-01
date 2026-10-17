'use strict';

const path = require('node:path');
const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const engine = modulePath => require(path.join(output,modulePath));

/**
 * A bounded original-source-board predicate. This is a hypothesis about a
 * possible attack, not a statement that the full source Store accepts it.
 * @param {object} state
 * @param {object} player
 * @returns {boolean}
 */
function shouldCopyApexShred(state, player) {
  if (state.turn !== 28 || player.usedGX !== true ||
      player.active.getPokemonCard()?.fullName !== 'Mimikyu GRI') return false;
  const opponent = state.players.find(p => p.id !== player.id);
  const last = opponent && state.playerLastAttack?.[opponent.id];
  const defending = opponent?.active.getPokemonCard();
  if (last?.sourceCard?.fullName !== 'Regidrago VSTAR SIT' ||
      last?.attack?.name !== 'Apex Dragon' ||
      last?.attack?.gxAttack === true ||
      defending?.fullName !== 'Regidrago VSTAR SIT' ||
      opponent.active.damage < 200 ||
      !player.discard.cards.some(card=>card.fullName === 'Dialga-GX UPR')) {
    return false;
  }
  const attached=player.active.energies.cards;
  return attached.length >= 2 &&
    attached.some(card=>card.name === 'Psychic Energy');
}

/** @returns {Function} */
function makeShredTactic() {
  const {SimpleTactic}=engine('simple-bot/simple-tactics/simple-tactics');
  const {AttackAction}=engine('game/store/actions/game-actions');
  return class ExtraTurnShredTactic extends SimpleTactic {
    /** @param {object} state @param {object} player */
    useTactic(state,player) {
      if (!shouldCopyApexShred(state,player)) return undefined;
      return new AttackAction(player.id,'Copycat');
    }
  };
}

/** @returns {Function} */
function makeShredResolver() {
  const {ChooseAttackPromptResolver}=
    engine('simple-bot/prompt-resolver/choose-attack-prompt-resolver');
  const {ChooseAttackPrompt}=
    engine('game/store/prompts/choose-attack-prompt');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const {GamePhase}=engine('game/store/state/state');
  return class ExtraTurnShredResolver extends ChooseAttackPromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state,player,prompt) {
      if (!(prompt instanceof ChooseAttackPrompt) ||
          prompt.playerId !== player.id || state.phase !== GamePhase.ATTACK ||
          !shouldCopyApexShred(state,player)) return undefined;
      for (const card of prompt.cards) {
        if (card.fullName !== 'Dialga-GX UPR' ||
            !player.discard.cards.includes(card)) continue;
        const shred=card.attacks.find(attack=>attack.name === 'Shred');
        if (shred && prompt.validate(shred))
          return new ResolvePromptAction(prompt.id,shred);
      }
      return undefined;
    }
  };
}

/**
 * Put the exact-source Shred tactic immediately before the usual Retreat,
 * after default Trainer/Supporter opportunities, preserving the turn28 Iono.
 * Non-target turns are delegated unchanged. All source deck/card identities
 * remain frozen, and the application must be opt-in on one physical seat.
 * @param {object} options
 * @returns {object}
 */
function withCopycatExtraTurnShredPolicy(options) {
  if (options.tactics.some(t=>t.name==='ExtraTurnShredTactic')) return options;
  const retreatIndex=options.tactics.findIndex(t=>t.name==='RetreatTactic');
  if (retreatIndex<0) throw new Error('Pinned RetreatTactic required');
  return {
    ...options,
    tactics:[...options.tactics.slice(0,retreatIndex),makeShredTactic(),
      ...options.tactics.slice(retreatIndex)],
    promptResolvers:[makeShredResolver(),...options.promptResolvers]
  };
}

module.exports={
  shouldCopyApexShred,makeShredTactic,makeShredResolver,
  withCopycatExtraTurnShredPolicy
};
