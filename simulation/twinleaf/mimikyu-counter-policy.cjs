'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine = modulePath => require(path.join(output, modulePath));

const LOCKING_STADIUMS = new Set(['Path to the Peak', 'Silent Lab']);
const ALWAYS_LOCKING_POWERS = new Set(['Power of Alchemy', 'Neutralizing Gas']);
const ACTIVE_LOCKING_POWERS = new Set(['Mischievous Lock', 'Initialization']);

/**
 * Return the printed Ability names from a compiled Pokemon card.
 * Twinleaf calls these powers internally; the card catalog may expose abilities.
 * @param {object} pokemon
 * @returns {string[]}
 */
function powerNames(pokemon) {
  return (pokemon?.powers ?? pokemon?.abilities ?? []).map(power => power.name);
}

/**
 * Conservatively reject known face-up suppressors of Fairy Zone. The check
 * uses only public Stadiums, in-play Pokemon and attached Tools. It is not an
 * exhaustive substitute for the engine's full Ability-lock evaluator.
 *
 * @param {object} state
 * @returns {boolean}
 */
function hasKnownPublicAbilityLock(state) {
  for (const owner of state.players) {
    if ((owner.stadium?.cards ?? []).some(card =>
      LOCKING_STADIUMS.has(card.name))) return true;
    const slots = [
      {slot: owner.active, active: true},
      ...owner.bench.map(slot => ({slot, active: false}))
    ];
    for (const {slot, active} of slots) {
      const pokemon = slot.getPokemonCard();
      if (!pokemon) continue;
      const names = powerNames(pokemon);
      if (names.some(name => ALWAYS_LOCKING_POWERS.has(name))) return true;
      if (active && names.some(name => ACTIVE_LOCKING_POWERS.has(name))) return true;
      if (names.includes('Garbotoxin') && (slot.tools?.length ?? 0) > 0) return true;
    }
  }
  return false;
}

/**
 * Confirm a face-up Lillie's Clefairy ex with its printed Fairy Zone Ability,
 * excluding the known public lock states above.
 *
 * @param {object} state
 * @param {object} player
 * @returns {boolean}
 */
/**
 * Conservative visible-cost prefilter for Mimikyu GRI Copycat [Psychic][Colorless].
 * A Basic Psychic plus a second attached Energy pays the printed cost. With
 * Dimension Valley in play, one Basic Psychic pays the reduced cost. Special
 * Energy providers are intentionally not inferred here; the Store remains the
 * final legality authority.
 *
 * @param {object} state
 * @param {object} player
 * @returns {boolean}
 */
function canPayMimikyuCopycatCost(state, player) {
  const active = player.active.getPokemonCard();
  if (active?.fullName !== 'Mimikyu GRI') return false;
  const energies = player.active.energies.cards;
  const hasBasicPsychic = energies.some(card => card.name === 'Psychic Energy');
  if (!hasBasicPsychic) return false;
  const hasDimensionValley = state.players.some(owner =>
    (owner.stadium?.cards ?? []).some(card => card.name === 'Dimension Valley'));
  return energies.length >= 2 || hasDimensionValley;
}

function hasEffectiveFairyZone(state, player) {
  const slots = [player.active, ...player.bench];
  const clefairy = slots.map(slot => slot.getPokemonCard())
    .find(card => card?.fullName === "Lillie's Clefairy ex JTG");
  return !!clefairy && powerNames(clefairy).includes('Fairy Zone') &&
    !hasKnownPublicAbilityLock(state);
}

/**
 * First Copycat branch: use the opponent's immediately preceding non-GX Apex
 * Dragon to copy the owner's discarded Dialga-GX Timeless-GX.
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
    canPayMimikyuCopycatCost(state, player) &&
    player.usedGX !== true &&
    last?.sourceCard?.fullName === 'Regidrago VSTAR SIT' &&
    last?.attack?.name === 'Apex Dragon' &&
    last.attack.gxAttack !== true &&
    player.discard.cards.some(card => card.fullName === 'Dialga-GX UPR');
}

/**
 * Bonus-turn follow-up: after the owner's GX allowance is spent, copy the
 * owner's discarded Radiant Eternatus Power Beam into an opposing Regidrago
 * VSTAR while Fairy Zone is visibly effective. Copycat's own Energy cost is
 * still filtered by a conservative visible Basic-Psychic/Dimension-Valley gate
 * and enforced by Twinleaf's ordinary action validator.
 *
 * @param {object} state
 * @param {object} player
 * @returns {boolean}
 */
function isCopycatApexPowerBeamSituation(state, player) {
  const {GamePhase} = engine('game/store/state/state');
  const active = player.active.getPokemonCard();
  const opponent = state.players.find(p => p.id !== player.id);
  const last = opponent && state.playerLastAttack?.[opponent.id];
  return (state.phase === GamePhase.PLAYER_TURN || state.phase === GamePhase.ATTACK) &&
    active?.fullName === 'Mimikyu GRI' &&
    canPayMimikyuCopycatCost(state, player) &&
    player.usedGX === true &&
    last?.sourceCard?.fullName === 'Regidrago VSTAR SIT' &&
    last?.attack?.name === 'Apex Dragon' &&
    last.attack.gxAttack !== true &&
    opponent?.active.getPokemonCard()?.fullName === 'Regidrago VSTAR SIT' &&
    player.discard.cards.some(card => card.fullName === 'Radiant Eternatus CRZ') &&
    hasEffectiveFairyZone(state, player);
}

/**
 * Identify the currently available branch without inspecting hidden opponent
 * zones. The two branches are mutually exclusive through the GX allowance.
 *
 * @param {object} state
 * @param {object} player
 * @returns {'timeless'|'power-beam'|null}
 */
function copycatApexResponseKind(state, player) {
  if (isCopycatApexTimelessSituation(state, player)) return 'timeless';
  if (isCopycatApexPowerBeamSituation(state, player)) return 'power-beam';
  return null;
}

/** @returns {Function} A research-only SimpleTactic subclass. */
function makeCopycatApexTimelessTactic() {
  const {SimpleTactic} = engine('simple-bot/simple-tactics/simple-tactics');
  const {AttackAction} = engine('game/store/actions/game-actions');

  return class CopycatApexTimelessTactic extends SimpleTactic {
    /** @param {object} state @param {object} player */
    useTactic(state, player) {
      if (copycatApexResponseKind(state, player) === null) return undefined;
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
      const branch = copycatApexResponseKind(state, player);
      if (!(prompt instanceof ChooseAttackPrompt) ||
          prompt.playerId !== player.id || state.phase !== GamePhase.ATTACK ||
          branch === null) {
        return super.resolvePrompt(state, player, prompt);
      }
      const sourceName = branch === 'timeless' ?
        'Dialga-GX UPR' : 'Radiant Eternatus CRZ';
      const attackName = branch === 'timeless' ? 'Timeless-GX' : 'Power Beam';
      for (const card of prompt.cards) {
        if (card.fullName !== sourceName ||
            !player.discard.cards.includes(card)) continue;
        const attack = card.attacks.find(candidate => candidate.name === attackName);
        if (attack && prompt.validate(attack)) {
          return new ResolvePromptAction(prompt.id, attack);
        }
      }
      return super.resolvePrompt(state, player, prompt);
    }
  };
}

/**
 * Insert the two-stage visible-board Copycat counterline before the upstream
 * attack tactic and its resolver before the default attack-choice resolver.
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
  hasKnownPublicAbilityLock,
  hasEffectiveFairyZone,
  canPayMimikyuCopycatCost,
  isCopycatApexTimelessSituation,
  isCopycatApexPowerBeamSituation,
  copycatApexResponseKind,
  makeCopycatApexTimelessTactic,
  makeCopycatApexTimelessResolver,
  withCopycatApexTimelessPolicy
};
