'use strict';


/** @param {unknown} result @param {number|undefined} length @returns {boolean} */
function isIndexPermutation(result, length) {
  if (!Number.isInteger(length) || length < 0 ||
      !Array.isArray(result) || result.length !== length) return false;
  const seen = new Set();
  // Array#every skips sparse holes; for...of visits them as undefined.
  for (const index of result) {
    if (!Number.isInteger(index) || index < 0 || index >= length ||
        seen.has(index)) return false;
    seen.add(index);
  }
  return true;
}

/**
 * Check the proposed action before passing it to Twinleaf's Store.dispatch.
 * Pinned Store.reducePrompt sets prompt.result directly and does not call the
 * prompt's validate method, so an illegal bot result can otherwise complete.
 *
 * The caller is responsible for enabling this experimental strict mode; some
 * upstream validators may be overly permissive or incorrect and still need
 * card/rules-specific scrutiny. This check makes rejection explicit.
 *
 * @param {{prompts:Array<{id:number,result?:unknown,validate:(result:unknown,state:object)=>boolean}>}} state
 * @param {{id?:number,result?:unknown,constructor?:{name?:string}}} action
 * @returns {void}
 */
function assertValidPromptAction(state, action) {
  const unresolved = state.prompts.filter(prompt => prompt.result === undefined);
  if (unresolved.length === 0) return;
  if (action?.constructor?.name !== 'ResolvePromptAction') {
    throw new Error('Pending Twinleaf prompt was not answered with ResolvePromptAction.');
  }
  const prompt = unresolved.find(candidate => candidate.id === action.id);
  if (!prompt) {
    throw new Error('Twinleaf bot answered an unknown or already-resolved prompt ID.');
  }
  // Four pinned index-permutation validators use lexicographic Array#sort().
  // ShuffleHandPrompt additionally compares against Prize-slot count instead
  // of the number of cards in hand. Keep corrections opt-in and source-bound.
  let valid;
  const name = prompt.constructor.name;
  if (name === 'ShuffleDeckPrompt' || name === 'ShufflePrizesPrompt' ||
      name === 'ShuffleHandPrompt' || name === 'OrderCardsPrompt') {
    const owner = state.players?.find(player =>
      player.id === prompt.getPerspectivePlayerId());
    const size = name === 'ShuffleDeckPrompt' ? owner?.deck.cards.length
      : name === 'ShufflePrizesPrompt'
        ? owner?.prizes.reduce((sum, prize) => sum + prize.cards.length, 0)
        : name === 'ShuffleHandPrompt' ? owner?.hand.cards.length
          : prompt.cards.cards.length;
    valid = name === 'OrderCardsPrompt' && action.result === null
      ? prompt.options.allowCancel === true
      : isIndexPermutation(action.result, size);
  } else {
    valid = typeof prompt.validate === 'function' &&
      prompt.validate(action.result, state);
  }
  // ChooseCardsPrompt.validate verifies source membership independently for
  // each chosen card, but omits multiplicity. The same physical card cannot
  // satisfy two selections when it occurs only once in the source zone.
  if (valid && prompt.constructor.name === 'ChooseCardsPrompt' &&
      Array.isArray(action.result)) {
    const available = new Map();
    for (const card of prompt.cards.cards) {
      available.set(card, (available.get(card) || 0) + 1);
    }
    for (const card of action.result) {
      const count = available.get(card) || 0;
      if (count === 0) {
        valid = false;
        break;
      }
      available.set(card, count - 1);
    }
  }
  // Pinned ChoosePrizePrompt.validate checks count, distinctness and nonempty
  // contents, but never verifies Prize-zone ownership or blocked positions.
  // KO Prize selection and Gladion must select physical eligible Prize slots.
  if (valid && name === 'ChoosePrizePrompt' && action.result !== null) {
    const actor = state.players.find(player =>
      player.id === prompt.getPerspectivePlayerId());
    const target = prompt.options.useOpponentPrizes
      ? state.players.find(player => player.id !== actor?.id)
      : actor;
    const blocked = new Set(prompt.options.blocked || []);
    valid = Array.isArray(action.result) && !!target &&
      action.result.every(prize => {
        const index = target.prizes.indexOf(prize);
        return index >= 0 && !blocked.has(index);
      });
  }
  // Pinned ChoosePokemonPrompt.validate skips physical target-side/slot
  // membership and duplicate selection. Honor exactly its target metadata.
  if (valid && name === 'ChoosePokemonPrompt' && action.result !== null) {
    const actor = state.players.find(player =>
      player.id === prompt.getPerspectivePlayerId());
    const opponent = state.players.find(player => player.id !== actor?.id);
    const available = new Set();
    if (actor && opponent) {
      const collect = (player, side) => {
        player.forEachPokemon(side, (list, card, target) => {
          if (prompt.slots.includes(target.slot)) available.add(list);
        });
      };
      // Pinned PlayerType: ANY=0, TOP_PLAYER=1, BOTTOM_PLAYER=2.
      if (prompt.playerType === 0 || prompt.playerType === 1) collect(opponent, 1);
      if (prompt.playerType === 0 || prompt.playerType === 2) collect(actor, 2);
    }
    valid = !!actor && !!opponent && Array.isArray(action.result) &&
      action.result.every(slot => available.has(slot)) &&
      new Set(action.result).size === action.result.length;
  }
  if (valid && prompt.constructor.name === 'AttachEnergyPrompt' &&
      action.result !== null) {
    const eligible = new Set(prompt.cardList.filter(prompt.filter));
    const used = new Set();
    valid = Array.isArray(action.result) && action.result.every(({card}) => {
      if (!eligible.has(card) || used.has(card)) return false;
      used.add(card);
      return true;
    });
  }
  if (!valid) {
    throw new Error('Twinleaf bot supplied an invalid result to ' +
      prompt.constructor.name + ' (prompt ' + prompt.id + ').');
  }
}

module.exports = { assertValidPromptAction };
