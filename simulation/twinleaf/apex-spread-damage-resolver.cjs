'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Enumerate subsets of knock-outable opposing Benched Pokémon.
 * Each individual Prize opportunity is counted once; multiple-Prize values,
 * protection and future-turn strategy are deliberately outside this model.
 *
 * @param {object} state Current pinned-engine state.
 * @param {object} player Regidrago controller.
 * @param {object} prompt PutDamagePrompt for 60 damage counters' value.
 * @param {{attackPhase:number,opponentSide:number,benchSlot:number}} codes Pinned enum values.
 * @returns {Array<{target:object,damage:number}>|null} Full allocation, or null.
 */
function prizeWindowDamageMap(state, player, prompt, codes) {
  if (state.phase !== codes.attackPhase ||
      player.active.getPokemonCard()?.fullName !== 'Regidrago VSTAR SIT' ||
      prompt.playerId !== player.id ||
      prompt.damage !== 60 ||
      prompt.playerType !== codes.opponentSide ||
      !prompt.slots.includes(codes.benchSlot) ||
      prompt.slots.length !== 1) {
    return null;
  }

  const opponent = state.players.find(candidate => candidate.id !== player.id);
  if (!opponent) return null;
  const eligible = opponent.bench.flatMap((slot, index) => {
    const pokemon = slot.getPokemonCard();
    if (!pokemon || pokemon.powers?.length || slot.tools.length > 0) return [];
    const target = {
      player: codes.opponentSide,
      slot: codes.benchSlot,
      index
    };
    const source = prompt.maxAllowedDamage.find(row =>
      row.target.player === target.player &&
      row.target.slot === target.slot &&
      row.target.index === target.index
    );
    if (!source || source.damage < 60 ||
        prompt.options.blocked.some(row =>
          row.player === target.player &&
          row.slot === target.slot &&
          row.index === target.index)) {
      return [];
    }
    const remaining = (slot.hp || pokemon.hp + slot.hpBonus) - slot.damage;
    const required = Math.ceil(remaining / 10) * 10;
    return required >= 10 && required <= 60 ? [{target,required}] : [];
  });

  let best = null;
  for (let mask = 1; mask < 1 << eligible.length; mask += 1) {
    const selected = eligible.filter((_, index) => (mask & (1 << index)) !== 0);
    const cost = selected.reduce((sum, target) => sum + target.required, 0);
    if (cost > 60) continue;
    if (best && selected.length < best.targets.length) continue;
    if (best && selected.length === best.targets.length && cost >= best.cost) {
      continue;
    }
    best = {targets:selected,cost};
  }
  if (!best) return null;
  const result = best.targets.map(item => ({
    target:item.target,
    damage:item.required
  }));
  // Assign all six counters. Extra counters on a selected target are legal
  // under this Phantom Dive prompt even if that target would be Knocked Out.
  result[0].damage += 60 - best.cost;
  return prompt.validate(result,state) ? result : null;
}

/**
 * Opt-in resolver, reverting to the generic policy for unmatched prompts.
 * @returns {Function} A SimpleTacticsAi-compatible prompt resolver.
 */
function prizeWindowPutDamageResolverClass() {
  /** @param {string} name */
  const load = name => require(path.join(output,name));
  const {PutDamagePromptResolver} =
    load('simple-bot/prompt-resolver/put-damage-prompt-resolver');
  const {PutDamagePrompt} = load('game/store/prompts/put-damage-prompt');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');
  const {GamePhase} = load('game/store/state/state');
  const {PlayerType,SlotType} =
    load('game/store/actions/play-card-action');

  class PrizeWindowPutDamageResolver extends PutDamagePromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state, player, prompt) {
      if (prompt instanceof PutDamagePrompt) {
        const map = prizeWindowDamageMap(state,player,prompt,{
          attackPhase:GamePhase.ATTACK,
          opponentSide:PlayerType.TOP_PLAYER,
          benchSlot:SlotType.BENCH
        });
        if (map) return new ResolvePromptAction(prompt.id,map);
      }
      return super.resolvePrompt(state,player,prompt);
    }
  }
  return PrizeWindowPutDamageResolver;
}

/**
 * Replace only the prompt resolver while invoking one synchronous test/match.
 * Preserve the pinned vendor and restore the exact class after success/failure.
 * @template T
 * @param {()=>T} fn
 * @returns {T}
 */
function withPrizeWindowPutDamageResolver(fn) {
  const defs = require(path.join(output,'simple-bot/simple-bot-definitions'));
  const all = defs.allPromptResolvers;
  const index = all.findIndex(ctor => ctor.name === 'PutDamagePromptResolver');
  if (index < 0) throw new Error('Pinned damage prompt resolver unavailable');
  const original = all[index];
  all[index] = prizeWindowPutDamageResolverClass();
  try {
    return fn();
  } finally {
    all[index] = original;
  }
}

module.exports = {
  prizeWindowDamageMap,
  prizeWindowPutDamageResolverClass,
  withPrizeWindowPutDamageResolver
};
