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
/** @param {object} a @param {object} b */
function samePokemonTarget(a, b) {
  if (!a || !b) return false;
  return a.player === b.player && a.slot === b.slot && a.index === b.index;
}

/**
 * Enumerate the pinned prompt's currently occupied, permitted Pokemon slots.
 * PlayerType is ANY=0, TOP_PLAYER=1, BOTTOM_PLAYER=2 at the pinned revision.
 * @param {object} state
 * @param {object} prompt
 * @returns {{target:object, list:object}[]}
 */
function eligiblePokemonTargets(state, prompt) {
  const actor = state.players.find(p =>
    p.id === prompt.getPerspectivePlayerId());
  const opponent = state.players.find(p => p.id !== actor?.id);
  const eligible = [];
  if (!actor || !opponent) return eligible;
  const collect = (player, side) => {
    player.forEachPokemon(side, (list, card, target) => {
      if (prompt.slots.includes(target.slot)) eligible.push({target, list});
    });
  };
  if (prompt.playerType === 0 || prompt.playerType === 1) collect(opponent, 1);
  if (prompt.playerType === 0 || prompt.playerType === 2) collect(actor, 2);
  return eligible;
}

/**
 * Validate the source/recipient geometry and physical Energy assignments.
 * The pinned MoveEnergyPrompt.validate only checked for non-undefined cards.
 * @param {object} state
 * @param {object} prompt
 * @param {object[]} transfers
 */
function validMoveEnergyTransfers(state, prompt, transfers) {
  const {min, max, blockedFrom, blockedTo, blockedMap} = prompt.options;
  if (transfers.length < min || (max !== undefined && transfers.length > max)) {
    return false;
  }
  const slots = eligiblePokemonTargets(state, prompt);
  const used = new Set();
  for (const transfer of transfers) {
    const from = slots.find(slot => samePokemonTarget(slot.target, transfer?.from));
    const to = slots.find(slot => samePokemonTarget(slot.target, transfer?.to));
    if (!from || !to || from.list === to.list ||
        blockedFrom.some(target => samePokemonTarget(target, transfer.from)) ||
        blockedTo.some(target => samePokemonTarget(target, transfer.to))) {
      return false;
    }
    const card = transfer.card;
    const index = from.list.cards.indexOf(card);
    const forbidden = blockedMap.some(entry =>
      samePokemonTarget(entry.source, transfer.from) &&
      entry.blocked.includes(index));
    if (index < 0 || forbidden || used.has(card) ||
        !from.list.filter(prompt.filter).includes(card)) {
      return false;
    }
    used.add(card);
  }
  return true;
}

/**
 * Failure-only readout. A rejected Energy choice can reflect an invalid
 * physical card reference, repeated card, target, or count. Keep the detail
 * strictly after the bot's choice and never provide it to policy callbacks.
 * @param {object} prompt
 * @param {object} action
 * @param {object} state
 * @returns {string}
 */
function attachEnergyFailureEvidence(prompt, action, state) {
  const source = prompt.cardList.cards;
  const allowed = new Set(prompt.cardList.filter(prompt.filter));
  const seen = new Set();
  const recipientPool = eligiblePokemonTargets(state, prompt).map(({target, list}) => ({
    target: {player: target.player, slot: target.slot, index: target.index},
    pokemon: list.getPokemonCard()?.name ?? null
  }));
  const sourceZone = state.players.find(player => player.discard === prompt.cardList) ?
    'discard' : state.players.find(player => player.deck === prompt.cardList) ?
      'deck' : state.players.find(player => player.hand === prompt.cardList) ?
        'hand' : 'other';
  const selections = Array.isArray(action.result) ? action.result.map(entry => {
    const card = entry?.card;
    const duplicate = seen.has(card);
    seen.add(card);
    const target = entry?.to;
    return {
      card: card?.fullName || card?.name || null,
      inSource: source.includes(card),
      eligible: allowed.has(card),
      duplicate,
      entryKeys: entry && typeof entry === 'object' ? Object.keys(entry).sort() : [],
      target: target && typeof target === 'object' ?
        {player: target.player ?? null, slot: target.slot ?? null,
          index: target.index ?? null} : null
    };
  }) : null;
  return JSON.stringify({
    evidenceType: 'post-choice-invalid-attach-energy-selection-v1',
    promptId: prompt.id,
    promptMessage: prompt.message ?? null,
    sourceZone,
    sourceSize: source.length,
    eligibleSize: allowed.size,
    recipientPool,
    min: prompt.options?.min ?? null,
    max: prompt.options?.max ?? null,
    maxPerType: prompt.options?.maxPerType ?? null,
    differentTypes: prompt.options?.differentTypes === true,
    sameTarget: prompt.options?.sameTarget === true,
    differentTargets: prompt.options?.differentTargets === true,
    allowedCardTypes: prompt.options?.validCardTypes ?? null,
    selectedSize: selections?.length ?? null,
    selections
  });
}

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
      Array.from(action.result).every(prize => {
        const index = target.prizes.indexOf(prize);
        return index >= 0 && !blocked.has(index);
      });
  }
  // Pinned ChoosePokemonPrompt.validate omits declared side/slot and
  // physical multiplicity. Reuse the MoveEnergy target enumerator.
  if (valid && name === 'ChoosePokemonPrompt' && action.result !== null) {
    const allowed = new Set(eligiblePokemonTargets(state, prompt)
      .map(target => target.list));
    valid = Array.isArray(action.result) &&
      Array.from(action.result).every(slot => allowed.has(slot)) &&
      new Set(action.result).size === action.result.length;
  }
  // Chosen EnergyMap entries must originate from the prompt's actual
  // provided attached-Energy catalog, once per physical Energy card.
  if (valid && name === 'ChooseEnergyPrompt' && action.result !== null) {
    const sourceMaps = new Set(prompt.energy);
    const spent = new Set();
    valid = Array.isArray(action.result) &&
      Array.from(action.result).every(entry => {
        const card = entry?.card;
        if (!sourceMaps.has(entry) || !card || spent.has(card)) return false;
        spent.add(card);
        return true;
      });
  }
  if (valid && name === 'MoveEnergyPrompt' && action.result !== null) {
    valid = Array.isArray(action.result) &&
      validMoveEnergyTransfers(state, prompt, Array.from(action.result));
  }
  if (valid && prompt.constructor.name === 'AttachEnergyPrompt' &&
      action.result !== null) {
    const eligible = new Set(prompt.cardList.filter(prompt.filter));
    const used = new Set();
    valid = Array.isArray(action.result) && Array.from(action.result).every(entry => {
      const card = entry?.card;
      if (!eligible.has(card) || used.has(card)) return false;
      used.add(card);
      return true;
    });
  }
  if (!valid) {
    const detail = name === 'AttachEnergyPrompt' ?
      ' ' + attachEnergyFailureEvidence(prompt, action, state) : '';
    throw new Error('Twinleaf bot supplied an invalid result to ' +
      prompt.constructor.name + ' (prompt ' + prompt.id + ').' + detail);
  }
}

module.exports = { assertValidPromptAction };
