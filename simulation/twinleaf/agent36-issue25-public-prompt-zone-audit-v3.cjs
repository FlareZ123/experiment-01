'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent36-issue25-public-prompt-zone-audit-v3';

/**
 * Return physical cards exposed by a CardList or array.
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
 * @param {any} state
 * @param {any} card
 * @returns {boolean}
 */
function isPublicCard(state, card) {
  return publicCardOwnerSeat(state, card) >= 0;
}

/**
 * Find the owner of a card using only public in-play and discard zones.
 * @param {any} state
 * @param {any} card
 * @returns {number}
 */
function publicCardOwnerSeat(state, card) {
  if (!card || !Array.isArray(state?.players)) return -1;
  for (let seat = 0; seat < state.players.length; seat++) {
    const player = state.players[seat];
    if (player?.active?.getPokemonCard?.() === card) return seat;
    if (cardsOf(player?.active?.energies).includes(card)) return seat;
    if (cardsOf(player?.discard).includes(card)) return seat;
    if (cardsOf(player?.lostZone).includes(card)) return seat;
    for (const slot of player?.bench ?? []) {
      if (slot?.getPokemonCard?.() === card) return seat;
      if (cardsOf(slot?.energies).includes(card)) return seat;
    }
  }
  return -1;
}

/**
 * Extract cards eligible under a prompt's superType filter. For a PokemonCardList
 * with an Energy filter, the eligible subzone is its attached-Energy CardList.
 * The filter is verified by equality with every public attached Energy's superType.
 * @param {any} prompt
 * @returns {{cards:any[],subzone:string|null,filterSuperType:any,filterMatchesEnergySubzone:boolean}}
 */
function eligiblePromptCards(prompt) {
  const filter = prompt?.filter ?? prompt?.options?.filter ?? null;
  const source = prompt?.cards;
  if (source?.energies && filter && filter.superType !== undefined) {
    const energies = cardsOf(source.energies);
    const cards = energies.filter(card => card?.superType === filter.superType);
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
 * Identify the exact public container and eligible subzone for a prompt.
 * Hidden zones can match by reference, but their card identities are never emitted.
 * @param {any} state
 * @param {any} prompt
 * @returns {{matches:object[],offeredCount:number,eligibleSubzone:string|null,filterSuperType:any,filterMatchesEnergySubzone:boolean,offeredPrintings:(string|null)[]|null}}
 */
function promptZoneMatches(state, prompt) {
  const players = Array.isArray(state?.players) ? state.players : [];
  const ownerSeat = players.findIndex(player => player?.id === prompt?.playerId);
  const opponentSeat = ownerSeat >= 0 && players.length === 2 ? 1 - ownerSeat : -1;
  const eligible = eligiblePromptCards(prompt);
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
    const subsetZone = eligible.subzone === 'energies' || eligibleEnergySubset
      ? energyZone
      : candidate.zone;
    const subsetCards = cardsOf(subsetZone);
    const subset = !exactContainer && !exactEnergySubzone
      && eligible.cards.length > 0
      && eligible.cards.every(card => subsetCards.includes(card));
    const eligibleSubzone = eligible.subzone === 'energies' || eligibleEnergySubset
      ? 'energies'
      : eligible.subzone;

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
 * Find the prototype that owns a named instance method.
 * @param {any} value
 * @param {string} methodName
 * @returns {{prototype:object,descriptor:PropertyDescriptor}|null}
 */
function findMethodOwner(value, methodName) {
  let prototype = Object.getPrototypeOf(value);
  while (prototype) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
    if (descriptor && typeof descriptor.value === 'function') {
      return {prototype, descriptor};
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  return null;
}

/**
 * Observe public Snap Trap prompt provenance and exact public target zone.
 * Store.prompt's first argument is the prompt owner, not State. The observer
 * reads the live State from Store.this.state and preserves every original argument.
 *
 * @param {()=>any} run Synchronous experiment callback.
 * @param {object} [deps]
 * @param {any} [deps.Store] Twinleaf Store class, injectable for tests.
 * @param {any} [deps.ChooseCardsPrompt] Twinleaf prompt class, injectable.
 * @param {object} [deps.GameMessage] Twinleaf GameMessage enum, injectable.
 * @param {number} [deps.maxEvents=64]
 * @returns {{result:any,audit:object}}
 */
function withIssue25PublicPromptZoneAuditV3(run, deps = {}) {
  assert.equal(typeof run, 'function');
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name @returns {any} */
  const native = name => require(path.join(root, name));
  const Store = deps.Store ?? native('game/store/store').Store;
  const ChooseCardsPrompt = deps.ChooseCardsPrompt
    ?? native('game/store/prompts/choose-cards-prompt').ChooseCardsPrompt;
  const GameMessage = deps.GameMessage ?? native('game/game-message').GameMessage;
  const maxEvents = deps.maxEvents ?? 64;

  assert.ok(Store?.prototype, 'Twinleaf Store prototype is required');
  assert.ok(ChooseCardsPrompt, 'ChooseCardsPrompt is required');
  assert.ok(GameMessage?.CHOOSE_CARD_TO_DISCARD !== undefined,
    'GameMessage.CHOOSE_CARD_TO_DISCARD is required');
  assert.ok(Number.isInteger(maxEvents) && maxEvents > 0);

  const oldPrompt = Object.getOwnPropertyDescriptor(Store.prototype, 'prompt');
  const oldDispatch = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof oldPrompt?.value, 'function');
  assert.equal(typeof oldDispatch?.value, 'function');

  const patchedReducerPrototypes = new Map();
  const currentAttackByStore = new WeakMap();
  const lastAttackByStore = new WeakMap();
  const sourceMarkerByPrompt = new WeakMap();
  let activeReducerContext = null;
  const audit = {
    version: VERSION,
    promptCount: 0,
    attackDispatchCount: 0,
    dispatchCount: 0,
    snapTrapReducerCount: 0,
    events: []
  };

  function installSnapTrapReducerMarker(state) {
    if (!Array.isArray(state?.players)) return;
    for (const player of state.players) {
      const sourceCard = player?.active?.getPokemonCard?.() ?? null;
      if (publicPrinting(sourceCard) !== 'Galarian Stunfisk SSH') continue;
      const owner = findMethodOwner(sourceCard, 'reduceEffect');
      assert.ok(owner, 'Galarian Stunfisk reduceEffect method is required');
      if (patchedReducerPrototypes.has(owner.prototype)) continue;
      const original = owner.descriptor.value;
      const wrapped = function(...args) {
        if (publicPrinting(this) !== 'Galarian Stunfisk SSH') {
          return original.apply(this, args);
        }
        const previous = activeReducerContext;
        activeReducerContext = {
          state: args[0],
          sourceCard: this,
          attackingPokemon: args[1]?.source ?? null
        };
        audit.snapTrapReducerCount++;
        try {
          return original.apply(this, args);
        } finally {
          activeReducerContext = previous;
        }
      };
      Object.defineProperty(owner.prototype, 'reduceEffect', {
        ...owner.descriptor,
        value: wrapped
      });
      patchedReducerPrototypes.set(owner.prototype, owner.descriptor);
    }
  }

  function observedPrompt(...args) {
    const promptOwner = args[0];
    const prompt = args[1];
    const state = this.state;
    const callback = args[2];
    const isChooseCards = prompt instanceof ChooseCardsPrompt
      || prompt?.constructor?.name === 'ChooseCardsPrompt';
    if (isChooseCards
      && prompt.message === GameMessage.CHOOSE_CARD_TO_DISCARD
      && audit.events.length < maxEvents) {
      audit.promptCount++;
      const players = Array.isArray(state?.players) ? state.players : [];
      const ownerSeat = players.findIndex(player => player?.id === prompt.playerId);
      const opponentSeat = ownerSeat >= 0 && players.length === 2 ? 1 - ownerSeat : -1;
      const owner = ownerSeat >= 0 ? players[ownerSeat] : null;
      const opponent = opponentSeat >= 0 ? players[opponentSeat] : null;
      const zone = promptZoneMatches(state, prompt);
      const options = prompt.options ?? {};
      const filter = prompt.filter ?? options.filter ?? null;
      const filterKeys = filter && typeof filter === 'object'
        ? Object.keys(filter).sort()
        : [];
      const context = activeReducerContext && activeReducerContext.state === state
        ? activeReducerContext
        : null;
      let sourceMarker = null;
      if (context) {
        const sourceSeat = publicCardOwnerSeat(state, context.sourceCard);
        const attackerPokemon = context.attackingPokemon?.getPokemonCard?.() ?? null;
        const attackerSeat = publicCardOwnerSeat(state, attackerPokemon);
        const sourceCardPublic = isPublicCard(state, context.sourceCard)
          && publicPrinting(context.sourceCard) === 'Galarian Stunfisk SSH';
        const promptCardsExact = prompt.cards === context.attackingPokemon;
        const energySubzoneExact = promptCardsExact
          && prompt.cards?.energies === context.attackingPokemon?.energies;
        const promptOwnerMatches = sourceSeat >= 0
          && prompt.playerId === players[sourceSeat]?.id;
        const attackerActiveContainer = attackerSeat >= 0
          && players[attackerSeat]?.active === context.attackingPokemon;
        const activeEnergyMatch = zone.matches.length === 1
          && zone.matches[0].zone === 'opponent-active-pokemon-list'
          && zone.matches[0].match === 'exact-container'
          && zone.matches[0].eligibleSubzone === 'energies'
          && zone.matches[0].subzoneReferenceMatch === true
          && zone.matches[0].visibility === 'public';
        const min = options.min ?? prompt.min ?? null;
        const max = options.max ?? prompt.max ?? null;
        const allowCancel = options.allowCancel ?? prompt.allowCancel ?? null;
        const mandatoryOneEnergy = min === 1
          && max === 1
          && allowCancel === false
          && filter?.superType !== undefined
          && zone.eligibleSubzone === 'energies'
          && zone.filterMatchesEnergySubzone === true
          && zone.offeredCount >= 1;
        const promptOwnerArgumentId = typeof promptOwner === 'string'
          ? promptOwner
          : promptOwner?.id ?? promptOwner?.playerId ?? null;
        sourceMarker = {
          valid: sourceCardPublic
            && sourceSeat >= 0
            && attackerSeat >= 0
            && sourceSeat !== attackerSeat
            && promptCardsExact
            && energySubzoneExact
            && promptOwnerMatches
            && attackerActiveContainer
            && activeEnergyMatch
            && mandatoryOneEnergy,
          sourcePrinting: sourceCardPublic ? publicPrinting(context.sourceCard) : null,
          sourceEffect: sourceCardPublic ? 'Snap Trap' : null,
          sourceSeat: sourceSeat >= 0 ? sourceSeat : null,
          attackerSeat: attackerSeat >= 0 ? attackerSeat : null,
          sourceCardPublic,
          promptCardsExact,
          energySubzoneExact,
          promptOwnerMatches,
          attackerActiveContainer,
          activeEnergyMatch,
          mandatoryOneEnergy,
          filterMatchesEnergySubzone: zone.filterMatchesEnergySubzone,
          promptOwnerArgumentMatches: promptOwnerArgumentId === prompt.playerId
        };
        sourceMarkerByPrompt.set(prompt, sourceMarker);
      }

      const marker = sourceMarkerByPrompt.get(prompt) ?? null;
      const currentAttack = currentAttackByStore.get(this) ?? null;
      const lastAttack = lastAttackByStore.get(this) ?? null;
      const metadataSource = prompt.sourceCard ?? null;
      const metadataSourcePublic = isPublicCard(state, metadataSource);

      audit.events.push({
        index: audit.events.length,
        stateIsLiveStore: Boolean(state && state === this.state),
        reducerStateMatchesLiveStore: context !== null,
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
        sourceCardPublic: marker?.valid === true,
        sourcePrinting: marker?.valid === true ? marker.sourcePrinting : null,
        sourceAttribution: marker?.valid === true ? 'reducer-scoped' : marker ? 'reducer-frame-mismatch' : null,
        sourceEffect: marker?.valid === true ? marker.sourceEffect : null,
        sourceMarker: marker,
        promptSourceMetadataPresent: metadataSource !== null,
        promptSourceMetadataPublic: metadataSourcePublic,
        promptSourceMetadataPrinting: metadataSourcePublic ? publicPrinting(metadataSource) : null,
        promptOwnerArgumentMatches: marker?.promptOwnerArgumentMatches ?? null,
        zoneMatches: zone.matches,
        offeredCount: zone.offeredCount,
        eligibleSubzone: zone.eligibleSubzone,
        filterMatchesEnergySubzone: zone.filterMatchesEnergySubzone,
        offeredPrintings: zone.offeredPrintings,
        ownerActive: owner ? publicSlotSnapshot(owner.active) : null,
        opponentActive: opponent ? publicSlotSnapshot(opponent.active) : null,
        currentAttack,
        lastAttack
      });
    }
    return oldPrompt.value.apply(this, args);
  }

  function observedDispatch(action, ...args) {
    audit.dispatchCount++;
    const stateBefore = this.state;
    installSnapTrapReducerMarker(stateBefore);
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
      error.issue25PublicPromptZoneAuditV3 = audit;
    }
    throw error;
  } finally {
    Object.defineProperty(Store.prototype, 'prompt', oldPrompt);
    Object.defineProperty(Store.prototype, 'dispatch', oldDispatch);
    for (const [prototype, descriptor] of patchedReducerPrototypes) {
      Object.defineProperty(prototype, 'reduceEffect', descriptor);
    }
  }
}

module.exports = {
  VERSION,
  cardsOf,
  publicPrinting,
  publicSlotSnapshot,
  publicCardOwnerSeat,
  eligiblePromptCards,
  promptZoneMatches,
  attackFingerprint,
  findMethodOwner,
  withIssue25PublicPromptZoneAuditV3
};
