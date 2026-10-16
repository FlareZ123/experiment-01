'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Estimate the printed-rule Prize count using the pinned KnockOutEffect reducer.
 * Global modifiers and unrelated effects remain outside this local projection.
 *
 * @param {object} pokemon Opposing PokemonCard, including printed tags.
 * @param {object} slot Opposing PokemonCardList carrying next-turn KO modifiers.
 * @returns {number} Nominal Prize cards awarded if this Pokemon is Knocked Out.
 */
function nominalKnockoutPrizes(pokemon, slot) {
  const tags = pokemon.tags || [];
  let prizes = 1;
  if (['EX','V','VSTAR','ex','GX'].some(tag => tags.includes(tag))) prizes += 1;
  if (['Mega ex','Tag Team','Dual Legend'].some(tag => tags.includes(tag))) prizes += 1;
  if (['VMAX','V-UNION'].some(tag => tags.includes(tag))) prizes += 2;
  if (slot.denyPrizesIfKnockedOutNextTurn &&
      !slot.denyPrizesIfKnockedOutNextTurnPending) return 0;
  if (slot.extraPrizesIfKnockedOutNextTurn > 0 &&
      !slot.extraPrizesIfKnockedOutNextTurnPending) {
    prizes += slot.extraPrizesIfKnockedOutNextTurn;
  }
  return prizes;
}

/**
 * Search complete, validated six-counter allocations to opposing Bench.
 * Nominal Prize rewards are preferred to raw KO count; global Prize effects,
 * protection and future-turn strategy remain outside this local model.
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
  // A damage cap applies per target. A target needing only 10 damage
  // can still be knocked out when its cap is below the full 60.
  const entries = opponent.bench.flatMap((slot, index) => {
    const pokemon = slot.getPokemonCard();
    if (!pokemon) return [];
    const target = {player:codes.opponentSide,slot:codes.benchSlot,index};
    const source = prompt.maxAllowedDamage.find(row =>
      row.target.player === target.player &&
      row.target.slot === target.slot &&
      row.target.index === target.index
    );
    if (!source || prompt.options.blocked.some(row =>
      row.player === target.player &&
      row.slot === target.slot &&
      row.index === target.index)) return [];
    const cap = Math.min(6, Math.floor(source.damage / 10));
    if (cap <= 0) return [];
    const remaining = (slot.hp || pokemon.hp + slot.hpBonus) - slot.damage;
    // Powers and Tools can modify damage-counter placement. Until their
    // effects are checked, do not count those cards as certain knockouts.
    const trusted = !pokemon.powers?.length && !slot.tools?.length;
    const knockoutAt = trusted && remaining > 0 && remaining <= 60
      ? Math.ceil(remaining / 10)
      : Infinity;
    return [{target,cap,knockoutAt,trusted,
      prizes: nominalKnockoutPrizes(pokemon,slot)}];
  });

  if (entries.length === 0 ||
      entries.reduce((total,entry)=>total+entry.cap,0) < 6 ||
      !entries.some(entry=>Number.isFinite(entry.knockoutAt))) return null;

  // At most five Bench slots and six counters give <= 7^5 allocations.
  // Enumerate full, validated allocations; optimize immediate victory and
  // nominal Prizes, then KO count, waste and progress on surviving targets.
  let best = null;
  let bestScore = null;
  const counters = new Array(entries.length).fill(0);
  const prizesLeft = typeof player.getPrizeLeft === 'function'
    ? player.getPrizeLeft() : Infinity;
  /** @param {number} position @param {number} left */
  function enumerate(position,left) {
    if (position === entries.length) {
      if (left !== 0) return;
      let knockouts = 0;
      let prizes = 0;
      let wasted = 0;
      let progress = 0;
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        const used = counters[i];
        if (!entry.trusted) {
          wasted += used;
        } else if (used >= entry.knockoutAt) {
          knockouts += 1;
          prizes += entry.prizes;
          wasted += used - entry.knockoutAt;
        } else {
          progress += used;
        }
      }
      if (knockouts === 0) return;
      const score = [
        Number(prizesLeft > 0 && prizes >= prizesLeft),
        prizes, knockouts, -wasted, progress
      ];
      // Lexicographic comparison is deterministic even for tied allocations.
      if (bestScore) {
        let compare = 0;
        for (let i = 0; i < score.length; i += 1) {
          if (score[i] !== bestScore[i]) {
            compare = Math.sign(score[i]-bestScore[i]);
            break;
          }
        }
        if (compare <= 0) return;
      }
      const result = entries.flatMap((entry,index) =>
        counters[index] > 0
          ? [{target:entry.target,damage:counters[index]*10}]
          : []);
      if (!prompt.validate(result,state)) return;
      best = result;
      bestScore = score;
      return;
    }
    const limit = Math.min(entries[position].cap,left);
    for (let used = 0; used <= limit; used += 1) {
      counters[position] = used;
      enumerate(position+1,left-used);
    }
  }
  enumerate(0,6);
  return best;
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
  nominalKnockoutPrizes,
  prizeWindowDamageMap,
  prizeWindowPutDamageResolverClass,
  withPrizeWindowPutDamageResolver
};
