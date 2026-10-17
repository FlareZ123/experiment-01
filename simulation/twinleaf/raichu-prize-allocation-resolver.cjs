'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const {nominalKnockoutPrizes} =
  require('./apex-spread-damage-resolver.cjs');
/** @param {string} name */
const load = name => require(path.join(output, name));

/**
 * Choose a full Electro Rain allocation by immediate projected Prize value.
 * Each packet is 30 printed attack damage. Telescopic Sight adds a single
 * 30-damage bonus to each eligible Benched V/GX target, if not Stadium-blocked.
 *
 * This local model ignores other damage/prevention modifiers and card-specific
 * knockout-replacement effects, so outputs are tactical hypotheses.
 *
 * @param {object} state Pinned Twinleaf State
 * @param {object} player Acting source Raichu player
 * @param {object} prompt Pinned PutDamagePrompt
 * @param {{attackPhase:number,opponentSide:number,activeSlot:number,benchSlot:number}} codes
 * @returns {Array<{target:object,damage:number}>|null}
 */
function planElectroRainDamage(state, player, prompt, codes) {
  if (state.phase !== codes.attackPhase ||
      player.active.getPokemonCard()?.fullName !== 'Alolan Raichu UNM' ||
      prompt.playerId !== player.id ||
      prompt.playerType !== codes.opponentSide ||
      prompt.damage <= 0 || prompt.damage % 30 !== 0 ||
      prompt.options.damageMultiple !== 30 ||
      !prompt.slots.includes(codes.activeSlot) ||
      !prompt.slots.includes(codes.benchSlot)) return null;

  const opponent = state.players.find(row => row.id !== player.id);
  if (!opponent) return null;
  const hasSight = player.active.tools.some(card =>
    card.fullName === 'Telescopic Sight VIV');
  const jammingTower = state.players.some(side =>
    side.stadium.cards.some(card => card.name === 'Jamming Tower'));
  const sightTargetTags = ['GX', 'V', 'VMAX', 'VSTAR', 'V-UNION'];
  const blocked = prompt.options.blocked || [];
  const entries = [];

  opponent.forEachPokemon(codes.opponentSide, (slot, pokemon, target) => {
    if (blocked.some(row => row.player === target.player &&
        row.slot === target.slot && row.index === target.index)) return;
    const limit = prompt.maxAllowedDamage.find(row =>
      row.target.player === target.player &&
      row.target.slot === target.slot &&
      row.target.index === target.index);
    if (!limit) return;
    const cap = Math.floor(limit.damage / 30);
    if (cap <= 0) return;

    const maximumHp = slot.hp || pokemon.hp + (slot.hpBonus || 0);
    const remaining = maximumHp - slot.damage;
    if (remaining <= 0) return;
    const bonus = hasSight && !jammingTower &&
      target.slot === codes.benchSlot &&
      sightTargetTags.some(tag => (pokemon.tags || []).includes(tag)) ? 30 : 0;
    entries.push({
      target,
      cap,
      packetsForKO: Math.max(1, Math.ceil((remaining - bonus) / 30)),
      prizes: nominalKnockoutPrizes(pokemon, slot)
    });
  });

  if (entries.length === 0 || entries.length > 9) return null;
  const budget = prompt.damage / 30;
  let best = null;
  let bestScore = null;
  const prizesLeft = player.getPrizeLeft();

  // At most nine Active/Benched targets, so exhaustive subset search is cheap.
  for (let mask = 1; mask < 2 ** entries.length; mask++) {
    let units = 0;
    let prizes = 0;
    let knockouts = 0;
    for (let i = 0; i < entries.length; i++) {
      if ((mask & (1 << i)) === 0) continue;
      units += entries[i].packetsForKO;
      prizes += entries[i].prizes;
      knockouts++;
    }
    if (units > budget || entries.some((entry, i) =>
      (mask & (1 << i)) !== 0 && entry.packetsForKO > entry.cap)) continue;

    const score = [
      Number(prizesLeft > 0 && prizes >= prizesLeft),
      prizes, knockouts, -units
    ];
    if (bestScore) {
      let comparison = 0;
      for (let i = 0; i < score.length; i++) {
        if (score[i] === bestScore[i]) continue;
        comparison = Math.sign(score[i] - bestScore[i]);
        break;
      }
      if (comparison <= 0) continue;
    }
    best = mask;
    bestScore = score;
  }
  if (best === null) return null;

  const assigned = entries.map((entry, i) =>
    (best & (1 << i)) ? entry.packetsForKO : 0);
  const used = assigned.reduce((sum, n) => sum + n, 0);
  let extra = budget - used;

  // Spend remaining packets on a surviving valuable target, if possible.
  const progress = entries.map((entry, i) => i).filter(i =>
    assigned[i] === 0 && entries[i].cap >= extra);
  progress.sort((a, b) =>
    entries[b].prizes - entries[a].prizes ||
    entries[a].packetsForKO - entries[b].packetsForKO ||
    a - b);
  if (extra > 0 && progress.length) {
    assigned[progress[0]] += extra;
    extra = 0;
  }
  if (extra > 0) {
    const overflow = assigned.findIndex((n, i) =>
      n > 0 && entries[i].cap - n >= extra);
    if (overflow < 0) return null;
    assigned[overflow] += extra;
  }
  const result = entries.flatMap((entry, i) =>
    assigned[i] > 0 ? [{target: entry.target, damage: assigned[i] * 30}] : []);
  return prompt.validate(result, state) ? result : null;
}

/** @returns {Function} Scoped SimpleTacticsAi resolver constructor. */
function raichuPrizeAllocationResolverClass() {
  const {PutDamagePromptResolver} =
    load('simple-bot/prompt-resolver/put-damage-prompt-resolver');
  const {PutDamagePrompt} = load('game/store/prompts/put-damage-prompt');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');
  const {GamePhase} = load('game/store/state/state');
  const {PlayerType, SlotType} =
    load('game/store/actions/play-card-action');

  return class RaichuPrizeAllocationResolver extends PutDamagePromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state, player, prompt) {
      if (prompt instanceof PutDamagePrompt) {
        const plan = planElectroRainDamage(state, player, prompt, {
          attackPhase: GamePhase.ATTACK,
          opponentSide: PlayerType.TOP_PLAYER,
          activeSlot: SlotType.ACTIVE,
          benchSlot: SlotType.BENCH
        });
        if (plan) return new ResolvePromptAction(prompt.id, plan);
      }
      return super.resolvePrompt(state, player, prompt);
    }
  };
}

/**
 * @param {object} options Existing pinned SimpleTacticsAi options.
 * @returns {object} Copied options with only the damage resolver replaced.
 */
function withRaichuPrizeAllocationPolicy(options) {
  const index = options.promptResolvers.findIndex(ctor =>
    ctor.name === 'PutDamagePromptResolver');
  if (index < 0) throw new Error('Pinned PutDamagePromptResolver unavailable');
  const promptResolvers = options.promptResolvers.slice();
  promptResolvers[index] = raichuPrizeAllocationResolverClass();
  return {...options, promptResolvers};
}

module.exports = {
  planElectroRainDamage,
  raichuPrizeAllocationResolverClass,
  withRaichuPrizeAllocationPolicy
};
