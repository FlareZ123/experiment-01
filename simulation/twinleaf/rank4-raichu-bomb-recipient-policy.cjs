'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine = name => require(path.join(output, name));

const ENERGY_ORDER = [
  'Reversal Energy PAL', 'Counter Energy CIN', 'Unit Energy LPM UPR'
];

/**
 * Owner-visible source Electrode prompt: select the mandatory actual discard
 * Energy instances and attach them to the already-Active non-GX Alolan Raichu.
 * The existing rule-correction hook still enforces actual recipients/count.
 * No opponent private cards or unsearched owner-deck cards are consulted.
 *
 * @param {any} prompt Actual pending native AttachEnergyPrompt
 * @param {any} player Acting physical source owner
 * @param {{energySuperType:any, ownPlayer:any, activeSlot:any, attachMessage:any}} types
 * @returns {any[]|null}
 */
function planBombRecipient(prompt, player, types) {
  if (prompt.playerId !== player.id ||
      prompt.cardList !== player.discard ||
      prompt.message !== types.attachMessage ||
      prompt.playerType !== types.ownPlayer ||
      !prompt.slots.includes(types.activeSlot) ||
      prompt.options.max !== 5 ||
      !Number.isInteger(prompt.options.min) ||
      prompt.options.min < 1 ||
      player.active.getPokemonCard()?.fullName !== 'Alolan Raichu UNM' ||
      !player.bench.some(slot =>
        slot.getPokemonCard()?.fullName === 'Electrode-GX CES')) return null;

  const target = {player: types.ownPlayer, slot: types.activeSlot, index: 0};
  if (prompt.options.blockedTo.some(t =>
    t.player === target.player && t.slot === target.slot && t.index === target.index)) return null;

  const blocked = new Set(prompt.options.blocked);
  const choices = prompt.cardList.cards
    .map((card, index) => ({card, index}))
    .filter(row => row.card.superType === types.energySuperType && !blocked.has(row.index));
  if (choices.length < prompt.options.min) return null;
  choices.sort((a, b) => {
    const rank = row => {
      const index = ENERGY_ORDER.indexOf(row.card.fullName);
      return index < 0 ? ENERGY_ORDER.length : index;
    };
    return rank(a) - rank(b) || a.index - b.index;
  });
  const transfers = choices.slice(0, prompt.options.min)
    .map(({card}) => ({to: target, card}));
  return prompt.validate(transfers) ? transfers : null;
}

/**
 * Replace only the pinned native AttachEnergyPromptResolver in source seat.
 * Compiled engine is loaded when the opt-in policy is actually installed.
 * @param {any} options Source's SimpleTacticsAi options
 * @returns {any}
 */
function withRank4BombRecipientPriority(options) {
  const {AttachEnergyPromptResolver} =
    engine('simple-bot/prompt-resolver/attach-energy-prompt-resolver');
  const {AttachEnergyPrompt} =
    engine('game/store/prompts/attach-energy-prompt');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const {PlayerType, SlotType} =
    engine('game/store/actions/play-card-action');
  const {SuperType} = engine('game/store/card/card-types');
  const {GameMessage} = engine('game/game-message');
  if (options.promptResolvers.some(ctor =>
    ctor.name === 'Rank4BombRecipientResolver')) return options;
  class Rank4BombRecipientResolver extends AttachEnergyPromptResolver {
    /** @param {any} state @param {any} player @param {any} prompt */
    resolvePrompt(state, player, prompt) {
      if (prompt instanceof AttachEnergyPrompt) {
        const transfers = planBombRecipient(prompt, player, {
          energySuperType: SuperType.ENERGY,
          ownPlayer: PlayerType.BOTTOM_PLAYER,
          activeSlot: SlotType.ACTIVE,
          attachMessage: GameMessage.ATTACH_ENERGY_CARDS
        });
        if (transfers) return new ResolvePromptAction(prompt.id, transfers);
      }
      return super.resolvePrompt(state, player, prompt);
    }
  }
  const index = options.promptResolvers.findIndex(ctor =>
    ctor.name === 'AttachEnergyPromptResolver');
  if (index < 0) throw Error('Pinned AttachEnergyPromptResolver missing');
  const promptResolvers = options.promptResolvers.slice();
  promptResolvers[index] = Rank4BombRecipientResolver;
  return {...options, promptResolvers};
}

module.exports = {ENERGY_ORDER, planBombRecipient,
  withRank4BombRecipientPriority};
