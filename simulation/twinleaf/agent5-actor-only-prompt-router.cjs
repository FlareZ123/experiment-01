'use strict';

const assert = require('node:assert/strict');
const { actorObservation } = require('./actor-observation-contract.cjs');
const {
  actorHandDiscardInput,
  chooseActorHandDiscard,
  resolvePhysicalHandCards
} = require('./agent47-actor-hand-discard.cjs');
const {
  actorSingleSearchInput,
  chooseActorSingleSearch,
  physicalBundleForPrintings
} = require('./agent41-actor-owner-single-search.cjs');

const VERSION = 'agent5-actor-only-prompt-router-v1';
const STARTING_POKEMON_MESSAGE = 'CHOOSE_STARTING_POKEMONS';
const GO_FIRST_MESSAGE = 'GO_FIRST';
const receipts = new WeakMap();

function pendingForSeat(state, seat) {
  const owner = state.players?.[seat];
  const pending = state.prompts?.find(prompt => prompt.result === undefined);
  if (!owner || !pending || pending.playerId !== owner.id) return null;
  return { owner, pending };
}

function resolvePromptActionClass(deps) {
  if (typeof deps.ResolvePromptAction === 'function') return deps.ResolvePromptAction;
  if (typeof deps.promptActions?.ResolvePromptAction === 'function')
    return deps.promptActions.ResolvePromptAction;
  return require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action')
    .ResolvePromptAction;
}

function startingPokemonInput(state, seat, observe = actorObservation) {
  assert.ok(seat === 0 || seat === 1);
  const owner = state.players?.[seat];
  const pending = state.prompts?.find(prompt => prompt.result === undefined);
  if (pending?.constructor?.name !== 'ChooseCardsPrompt' ||
      pending.playerId !== owner?.id ||
      pending.message !== STARTING_POKEMON_MESSAGE ||
      pending.cards !== owner?.hand) return null;

  const options = pending.options ?? {};
  const min = Number.isInteger(options.min) ? options.min : 1;
  const max = Number.isInteger(options.max) ? options.max : 6;
  if (min < 1 || max < min || max > 6) return null;
  const cards = pending.cards.cards;
  if (!Array.isArray(cards)) return null;

  const offered = cards.map((card, index) => ({
    index,
    printing: card.fullName,
    name: card.name ?? card.fullName,
    selectableAlone: pending.validate([card]) === true
  }));
  const actor = observe(state, seat);
  assert.equal(actor.decisionKind, 'owner-prompt');
  return Object.freeze({
    actor,
    prompt: Object.freeze({
      id: pending.id,
      message: pending.message,
      source: 'own-hand',
      min,
      max,
      offered: Object.freeze(offered.map(entry => Object.freeze(entry)))
    })
  });
}

function chooseActorStartingPokemon(input, options = {}) {
  assert.equal(input.actor.decisionKind, 'owner-prompt');
  const priority = Array.isArray(options.startingPokemonPriority)
    ? options.startingPokemonPriority : [];
  const rank = entry => {
    const index = priority.findIndex(value =>
      entry.name === value || entry.printing === value ||
      entry.name?.includes(value) || entry.printing?.includes(value));
    return index < 0 ? priority.length + entry.index : index;
  };
  const legal = input.prompt.offered
    .filter(entry => entry.selectableAlone)
    .sort((a, b) => rank(a) - rank(b) || a.index - b.index);
  const selected = legal.slice(0, input.prompt.max);
  if (selected.length < input.prompt.min) return null;
  return { indices: selected.map(entry => entry.index) };
}

function chooseActorGoFirst() {
  // Match the pinned SimpleTacticsAi ConfirmPromptResolver default.
  return false;
}

function searchDecisionPrintings(input, decision) {
  if (!decision) return null;
  if (Array.isArray(decision.printings)) return [...decision.printings];
  if (Array.isArray(decision.indices)) {
    const entries = decision.indices.map(index =>
      input.prompt.offered.find(entry => entry.index === index));
    if (entries.some(entry => !entry)) return null;
    return entries.map(entry => entry.printing);
  }
  return null;
}

function makePromptAction(ResolvePromptAction, pending, result, receipt) {
  const action = new ResolvePromptAction(pending.id, result);
  const physicalCards = Array.isArray(result) ? [...result] : null;
  receipts.set(action, Object.freeze({
    version: VERSION,
    ...receipt,
    selectedPrintings: physicalCards
      ? physicalCards.map(card => card.fullName)
      : [],
    physicalCards
  }));
  return action;
}

/**
 * Resolve only prompts whose offered information belongs to the authenticated
 * actor. Call from the live per-seat policy path before incrementing the
 * unsupported/full-state fallback counter.
 *
 * Pure chooser callbacks receive detached actor-only DTOs. Native Card objects
 * remain in the adapter and are recovered only after a decision has been made.
 *
 * @param {object} state Genuine live Twinleaf Store.state.
 * @param {0|1} seat Authenticated answering seat.
 * @param {object} [deps] Native action and pure-policy injection.
 * @returns {object|null} Native ResolvePromptAction, or null when unsupported.
 */
function resolveActorOnlyPrompt(state, seat, deps = {}) {
  assert.ok(seat === 0 || seat === 1);
  const found = pendingForSeat(state, seat);
  if (!found) return null;
  const { owner, pending } = found;
  const observe = deps.observe ?? actorObservation;
  const ResolvePromptAction = resolvePromptActionClass(deps);

  if (pending.constructor?.name === 'ChooseCardsPrompt' &&
      pending.message === 'CHOOSE_CARD_TO_DISCARD') {
    const input = actorHandDiscardInput(state, seat, observe);
    if (!input || input.prompt.id !== pending.id) return null;
    const decision = (deps.chooseDiscard ?? chooseActorHandDiscard)(input);
    if (!Array.isArray(decision?.printings)) return null;
    const selected = resolvePhysicalHandCards(pending, decision.printings);
    if (!selected || pending.validate(selected) !== true) return null;
    return makePromptAction(ResolvePromptAction, pending, selected, {
      kind: 'owner-hand-discard',
      seat,
      ownerId: owner.id,
      promptId: pending.id,
      message: pending.message,
      source: input.prompt.source,
      expectedZone: 'own-discard'
    });
  }

  if (pending.constructor?.name === 'ChooseCardsPrompt' &&
      pending.message === 'CHOOSE_CARD_TO_HAND') {
    const input = actorSingleSearchInput(state, seat, observe);
    if (!input || input.prompt.id !== pending.id) return null;
    const decision = (deps.chooseSearch ?? chooseActorSingleSearch)(input);
    const printings = searchDecisionPrintings(input, decision);
    if (printings === null) return null;
    const selected = physicalBundleForPrintings(pending, printings);
    if (!selected || pending.validate(selected) !== true) return null;
    return makePromptAction(ResolvePromptAction, pending, selected, {
      kind: 'owner-search-to-hand',
      seat,
      ownerId: owner.id,
      promptId: pending.id,
      message: pending.message,
      source: input.prompt.source,
      expectedZone: 'own-hand'
    });
  }

  if (pending.constructor?.name === 'ChooseCardsPrompt' &&
      pending.message === STARTING_POKEMON_MESSAGE) {
    const input = startingPokemonInput(state, seat, observe);
    if (!input || input.prompt.id !== pending.id) return null;
    const decision = (deps.chooseStartingPokemon ??
      ((value) => chooseActorStartingPokemon(value, deps)))(input);
    if (!Array.isArray(decision?.indices) ||
        decision.indices.length < input.prompt.min ||
        decision.indices.length > input.prompt.max) return null;
    const used = new Set();
    const selected = [];
    for (const index of decision.indices) {
      if (!Number.isInteger(index) || used.has(index) ||
          index < 0 || index >= pending.cards.cards.length) return null;
      used.add(index);
      selected.push(pending.cards.cards[index]);
    }
    if (pending.validate(selected) !== true) return null;
    return makePromptAction(ResolvePromptAction, pending, selected, {
      kind: 'starting-pokemon-selection',
      seat,
      ownerId: owner.id,
      promptId: pending.id,
      message: pending.message,
      source: 'own-hand',
      expectedZone: 'own-board'
    });
  }

  if (pending.constructor?.name === 'ConfirmPrompt' &&
      pending.message === GO_FIRST_MESSAGE) {
    const actor = observe(state, seat);
    assert.equal(actor.decisionKind, 'owner-prompt');
    const decision = (deps.chooseGoFirst ?? chooseActorGoFirst)({
      actor,
      prompt: Object.freeze({ id: pending.id, message: pending.message })
    });
    if (typeof decision !== 'boolean') return null;
    return makePromptAction(ResolvePromptAction, pending, decision, {
      kind: 'go-first-confirmation',
      seat,
      ownerId: owner.id,
      promptId: pending.id,
      message: pending.message,
      source: 'owner-confirmation',
      expectedZone: 'prompt-resolved'
    });
  }

  return null;
}

/**
 * Adapter-only receipt for Store.dispatch postcondition checks. The returned
 * physical Card references must never be passed back to the pure chooser.
 */
function actorOnlyPromptReceipt(action) {
  const receipt = receipts.get(action);
  if (!receipt) return null;
  return Object.freeze({
    ...receipt,
    selectedPrintings: [...receipt.selectedPrintings],
    physicalCards: receipt.physicalCards ? [...receipt.physicalCards] : null
  });
}

module.exports = {
  VERSION,
  startingPokemonInput,
  chooseActorStartingPokemon,
  chooseActorGoFirst,
  resolveActorOnlyPrompt,
  actorOnlyPromptReceipt
};
