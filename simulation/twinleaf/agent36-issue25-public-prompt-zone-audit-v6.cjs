'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent36-issue25-public-prompt-zone-audit-v6';

/**
 * @param {any} zone
 * @returns {any[]}
 */
function cardsOf(zone) {
  if (Array.isArray(zone)) return zone;
  return Array.isArray(zone?.cards) ? zone.cards : [];
}

/**
 * @param {any} card
 * @returns {string|null}
 */
function publicPrinting(card) {
  return typeof card?.fullName === 'string'
    ? card.fullName
    : typeof card?.name === 'string' ? card.name : null;
}

/**
 * @param {any} slot
 * @returns {object}
 */
function publicSlotSnapshot(slot) {
  const pokemon = slot?.getPokemonCard?.() ?? null;
  const energies = cardsOf(slot?.energies);
  return {
    printing: publicPrinting(pokemon),
    damage: Number.isFinite(slot?.damage) ? slot.damage : null,
    energyCount: energies.length,
    energyPrintings: energies.map(publicPrinting)
  };
}

/**
 * @param {any} prompt
 * @param {any} SuperType
 * @returns {{cards:any[],subzone:string|null,filterSuperType:any,filterMatchesEnergySubzone:boolean}}
 */
function eligiblePromptCards(prompt, SuperType) {
  const filter = prompt?.filter ?? prompt?.options?.filter ?? null;
  const source = prompt?.cards;
  if (source?.energies && filter?.superType === SuperType.ENERGY) {
    const energies = cardsOf(source.energies);
    const cards = energies.filter(card => card?.superType === SuperType.ENERGY);
    return {
      cards,
      subzone: 'energies',
      filterSuperType: filter.superType,
      filterMatchesEnergySubzone: energies.length > 0 && cards.length === energies.length
    };
  }
  return {
    cards: cardsOf(source),
    subzone: null,
    filterSuperType: filter?.superType ?? null,
    filterMatchesEnergySubzone: false
  };
}

/**
 * @param {any} state
 * @param {any} prompt
 * @param {any} SuperType
 * @param {number} [ownerSeatOverride]
 */
function promptZoneMatches(state, prompt, SuperType, ownerSeatOverride) {
  const players = Array.isArray(state?.players) ? state.players : [];
  const ownerSeat = Number.isInteger(ownerSeatOverride)
    ? ownerSeatOverride
    : players.findIndex(player =>
      player === prompt?.player
      || player?.id === prompt?.playerId
    );
  const opponentSeat = ownerSeat >= 0 && players.length === 2 ? 1 - ownerSeat : -1;
  const eligible = eligiblePromptCards(prompt, SuperType);
  const zones = [];

  for (const [seat, role] of [[ownerSeat, 'owner'], [opponentSeat, 'opponent']]) {
    if (seat < 0 || !players[seat]) continue;
    const player = players[seat];
    zones.push(
      {label: role + '-hand', zone: player.hand, visibility: 'hidden', kind: 'cards'},
      {label: role + '-deck', zone: player.deck, visibility: 'hidden', kind: 'cards'},
      {label: role + '-prizes', zone: player.prizes, visibility: 'hidden', kind: 'cards'},
      {label: role + '-discard', zone: player.discard, visibility: 'public', kind: 'cards'},
      {label: role + '-lost-zone', zone: player.lostZone, visibility: 'public', kind: 'cards'},
      {label: role + '-active-pokemon-list', zone: player.active, visibility: 'public', kind: 'pokemon-list'}
    );
    for (let i = 0; i < (player.bench ?? []).length; i++) {
      zones.push({
        label: role + '-bench-' + i + '-pokemon-list',
        zone: player.bench[i],
        visibility: 'public',
        kind: 'pokemon-list'
      });
    }
  }

  const matches = [];
  for (const candidate of zones) {
    if (!candidate.zone) continue;
    const energyZone = candidate.kind === 'pokemon-list'
      ? candidate.zone.energies
      : null;
    const exactContainer = prompt.cards === candidate.zone;
    const exactEnergySubzone = energyZone && prompt.cards === energyZone;
    const eligibleEnergySubset = candidate.kind === 'pokemon-list'
      && energyZone
      && eligible.cards.length > 0
      && eligible.cards.every(card => cardsOf(energyZone).includes(card));
    const candidateHasEnergySubzone = candidate.kind === 'pokemon-list'
      && (eligible.subzone === 'energies' || eligibleEnergySubset);
    const subsetZone = candidateHasEnergySubzone ? energyZone : candidate.zone;
    const subsetCards = cardsOf(subsetZone);
    const subset = !exactContainer && !exactEnergySubzone
      && eligible.cards.length > 0
      && eligible.cards.every(card => subsetCards.includes(card));
    const eligibleSubzone = candidate.kind === 'pokemon-list'
      ? candidateHasEnergySubzone ? 'energies' : eligible.subzone
      : null;

    if (exactContainer) {
      matches.push({
        zone: candidate.label,
        match: 'exact-container',
        visibility: candidate.visibility,
        eligibleSubzone,
        subzoneReferenceMatch: eligibleSubzone === 'energies'
          && prompt.cards?.energies === energyZone,
        eligibleCount: eligible.cards.length
      });
    } else if (exactEnergySubzone) {
      matches.push({
        zone: candidate.label,
        match: 'exact-subzone',
        visibility: candidate.visibility,
        eligibleSubzone: 'energies',
        subzoneReferenceMatch: true,
        eligibleCount: eligible.cards.length
      });
    } else if (subset) {
      matches.push({
        zone: candidate.label,
        match: 'subset',
        visibility: candidate.visibility,
        eligibleSubzone,
        subzoneReferenceMatch: eligibleSubzone === 'energies'
          && prompt.cards?.energies === energyZone,
        eligibleCount: eligible.cards.length
      });
    }
  }

  const hasHiddenMatch = matches.some(match => match.visibility === 'hidden');
  const hasPublicMatch = matches.some(match => match.visibility === 'public');
  return {
    matches,
    offeredCount: eligible.cards.length,
    eligibleSubzone: eligible.subzone,
    filterSuperType: eligible.filterSuperType,
    filterMatchesEnergySubzone: eligible.filterMatchesEnergySubzone,
    offeredPrintings: hasPublicMatch && !hasHiddenMatch
      ? eligible.cards.map(publicPrinting)
      : null
  };
}

/**
 * @param {any} enumObject
 * @param {any} value
 * @returns {string}
 */
function enumName(enumObject, value) {
  if (typeof value === 'string') return value;
  for (const [key, candidate] of Object.entries(enumObject ?? {})) {
    if (!/^\d+$/.test(key) && candidate === value) return key;
  }
  return String(value);
}

/**
 * @param {any} action
 * @param {any} state
 * @param {number} dispatchSequence
 * @returns {object|null}
 */
function attackFingerprint(action, state, dispatchSequence) {
  if (action?.constructor?.name !== 'AttackAction') return null;
  const players = Array.isArray(state?.players) ? state.players : [];
  const actingId = action.clientId ?? action.id;
  const seat = players.findIndex(player => player?.id === actingId);
  const defenderSeat = seat >= 0 && players.length === 2 ? 1 - seat : -1;
  return {
    dispatchSequence,
    turn: Number.isFinite(state?.turn) ? state.turn : null,
    phase: state?.phase ?? null,
    seat: seat >= 0 ? seat : null,
    attackName: typeof action.name === 'string' ? action.name : null,
    attackerActive: seat >= 0 ? publicSlotSnapshot(players[seat]?.active) : null,
    defenderActive: defenderSeat >= 0 ? publicSlotSnapshot(players[defenderSeat]?.active) : null
  };
}

/**
 * Read-only Store.prompt and action observer. At the pinned revision the first
 * Store.prompt argument is State. Twinleaf assigns prompt.id inside prompt(),
 * so the audit records the prompt only after the original call returns.
 *
 * @param {()=>any} run Synchronous experiment callback.
 * @param {object} [deps]
 * @param {any} [deps.Store]
 * @param {any} [deps.ChooseCardsPrompt]
 * @param {any} [deps.GameMessage]
 * @param {any} [deps.SuperType]
 * @param {number} [deps.maxEvents=64]
 * @returns {{result:any,audit:object}}
 */
function withIssue25PublicPromptZoneAuditV6(run, deps = {}) {
  assert.equal(typeof run, 'function');
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name @returns {any} */
  const native = name => require(path.join(root, name));
  const Store = deps.Store ?? native('game/store/store').Store;
  const ChooseCardsPrompt = deps.ChooseCardsPrompt
    ?? native('game/store/prompts/choose-cards-prompt').ChooseCardsPrompt;
  const GameMessage = deps.GameMessage ?? native('game/game-message').GameMessage;
  const SuperType = deps.SuperType ?? native('game/store/card/card-types').SuperType;
  const maxEvents = deps.maxEvents ?? 64;

  assert.ok(Store?.prototype, 'Twinleaf Store prototype is required');
  assert.ok(ChooseCardsPrompt, 'ChooseCardsPrompt is required');
  assert.ok(GameMessage?.CHOOSE_CARD_TO_DISCARD !== undefined,
    'GameMessage.CHOOSE_CARD_TO_DISCARD is required');
  assert.ok(SuperType?.ENERGY !== undefined, 'SuperType.ENERGY is required');
  assert.ok(Number.isInteger(maxEvents) && maxEvents > 0);

  const oldPrompt = Object.getOwnPropertyDescriptor(Store.prototype, 'prompt');
  const oldDispatch = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof oldPrompt?.value, 'function');
  assert.equal(typeof oldDispatch?.value, 'function');

  const currentAttackByStore = new WeakMap();
  const lastAttackByStore = new WeakMap();
  const audit = {
    version: VERSION,
    promptCount: 0,
    attackDispatchCount: 0,
    dispatchCount: 0,
    events: []
  };

  function observedPrompt(...args) {
    const state = args[0];
    const prompt = args[1];
    const promptIdBeforeStore = prompt?.id ?? null;
    const playerIdBeforeStore = prompt?.playerId ?? null;
    const promptPlayerBeforeStore = prompt?.player ?? null;
    const isChooseCards = prompt instanceof ChooseCardsPrompt
      || prompt?.constructor?.name === 'ChooseCardsPrompt';
    const result = oldPrompt.value.apply(this, args);
    if (isChooseCards
      && prompt.message === GameMessage.CHOOSE_CARD_TO_DISCARD
      && audit.events.length < maxEvents) {
      audit.promptCount++;
      const players = Array.isArray(state?.players) ? state.players : [];
      const ownerSeat = players.findIndex(player =>
        player === promptPlayerBeforeStore
        || player === prompt?.player
        || player?.id === playerIdBeforeStore
      );
      const opponentSeat = ownerSeat >= 0 && players.length === 2 ? 1 - ownerSeat : -1;
      const owner = ownerSeat >= 0 ? players[ownerSeat] : null;
      const opponent = opponentSeat >= 0 ? players[opponentSeat] : null;
      const zone = promptZoneMatches(state, prompt, SuperType, ownerSeat);
      const options = prompt.options ?? {};
      const filter = prompt.filter ?? options.filter ?? null;
      const filterKeys = filter && typeof filter === 'object'
        ? Object.keys(filter).sort()
        : [];
      audit.events.push({
        index: audit.events.length,
        promptId: prompt?.id == null ? null : String(prompt.id),
        promptIdBeforeStore: promptIdBeforeStore == null ? null : String(promptIdBeforeStore),
        promptIdAssignedByStore: promptIdBeforeStore == null && prompt?.id != null,
        stateIsLiveStore: Boolean(state && state === this.state),
        promptStateArgumentMatchesLiveState: Boolean(state && state === this.state),
        turn: Number.isFinite(state?.turn) ? state.turn : null,
        phase: state?.phase ?? null,
        activePlayerSeat: Number.isInteger(state?.activePlayer) ? state.activePlayer : null,
        ownerSeat: ownerSeat >= 0 ? ownerSeat : null,
        opponentSeat: opponentSeat >= 0 ? opponentSeat : null,
        promptType: prompt.constructor?.name ?? null,
        message: enumName(GameMessage, prompt.message),
        min: options.min ?? prompt.min ?? null,
        max: options.max ?? prompt.max ?? null,
        allowCancel: options.allowCancel ?? prompt.allowCancel ?? null,
        isSecret: options.isSecret ?? prompt.isSecret ?? null,
        filterKeys,
        filterSuperType: filter?.superType ?? null,
        filterIsExactSuperTypeEnergy: filter?.superType === SuperType.ENERGY,
        promptPlayerMatches: ownerSeat >= 0 && prompt?.player === players[ownerSeat],
        promptPlayerIdBeforeStore: playerIdBeforeStore,
        promptPlayerIdAfterStore: prompt?.playerId ?? null,
        promptCardsClass: prompt.cards?.constructor?.name ?? null,
        zoneMatches: zone.matches,
        offeredCount: zone.offeredCount,
        eligibleSubzone: zone.eligibleSubzone,
        filterMatchesEnergySubzone: zone.filterMatchesEnergySubzone,
        offeredPrintings: zone.offeredPrintings,
        promptSourceMetadataPresent: prompt.sourceCard != null,
        ownerActive: owner ? publicSlotSnapshot(owner.active) : null,
        opponentActive: opponent ? publicSlotSnapshot(opponent.active) : null,
        currentAttack: currentAttackByStore.get(this) ?? null,
        lastAttack: lastAttackByStore.get(this) ?? null
      });
    }
    return result;
  }

  function observedDispatch(action, ...args) {
    audit.dispatchCount++;
    const stateBefore = this.state;
    const attack = attackFingerprint(action, stateBefore, audit.dispatchCount);
    const previous = currentAttackByStore.get(this) ?? null;
    if (attack) {
      audit.attackDispatchCount++;
      currentAttackByStore.set(this, attack);
    }
    try {
      const result = oldDispatch.value.apply(this, [action, ...args]);
      if (attack) lastAttackByStore.set(this, attack);
      return result;
    } finally {
      if (previous) currentAttackByStore.set(this, previous);
      else currentAttackByStore.delete(this);
    }
  }

  Object.defineProperty(Store.prototype, 'prompt', {
    ...oldPrompt,
    value: observedPrompt
  });
  Object.defineProperty(Store.prototype, 'dispatch', {
    ...oldDispatch,
    value: observedDispatch
  });

  try {
    const result = run();
    return {result, audit};
  } catch (error) {
    if (error && typeof error === 'object') {
      error.issue25PublicPromptZoneAuditV6 = audit;
    }
    throw error;
  } finally {
    Object.defineProperty(Store.prototype, 'prompt', oldPrompt);
    Object.defineProperty(Store.prototype, 'dispatch', oldDispatch);
  }
}

module.exports = {
  VERSION,
  cardsOf,
  publicPrinting,
  publicSlotSnapshot,
  eligiblePromptCards,
  promptZoneMatches,
  attackFingerprint,
  withIssue25PublicPromptZoneAuditV6
};
