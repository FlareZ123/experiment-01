'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { createHash } = require('node:crypto');

const { actorObservation } = require('../actor-observation-contract.cjs');
const {
  QUARANTINE_ACTIVE,
  VERSION: QUARANTINE_VERSION,
  CODE: QUARANTINE_CODE
} = require('../agent4-raw-state-native-fallback-quarantine.cjs');
const {
  SOURCE_PRINTING,
  SOURCE_ABILITY
} = require('../agent30/stunfisk-snap-trap-prompt-marker-v3.cjs');

const OUTPUT = path.resolve(
  __dirname,
  '../../../vendor/twinleaf/ptcg-server/output'
);
const VERSION = 'agent36-snap-trap-owner-prompt-evidence-v1';

/** @returns {{Store:Function,SimpleTacticsAi:Function,types:object}} */
function loadDependencies() {
  const { Store } = require(path.join(OUTPUT, 'game/store/store'));
  const { SimpleTacticsAi } = require(
    path.join(OUTPUT, 'simple-bot/simple-tactics-ai')
  );
  const { GameMessage } = require(path.join(OUTPUT, 'game/game-message'));
  const { SuperType } = require(
    path.join(OUTPUT, 'game/store/card/card-types')
  );
  return { Store, SimpleTacticsAi, types: { GameMessage, SuperType } };
}

/** @param {unknown} value @returns {string} */
function sha256(value) {
  return createHash('sha256')
    .update(JSON.stringify(value) ?? String(value))
    .digest('hex');
}

/** @param {object} prompt @returns {object} */
function promptOptions(prompt) {
  const options = prompt.options ?? {};
  return {
    min: Number.isSafeInteger(options.min) ? options.min : null,
    max: Number.isSafeInteger(options.max) ? options.max : null,
    allowCancel: typeof options.allowCancel === 'boolean' ?
      options.allowCancel : null,
    isSecret: typeof options.isSecret === 'boolean' ?
      options.isSecret : null,
    blockedCount: Array.isArray(options.blocked) ?
      options.blocked.length : null
  };
}

/** @param {object} prompt @param {object} types @returns {object} */
function promptFilter(prompt, types) {
  const filter = prompt.filter ?? {};
  const values = {};
  for (const [key, value] of Object.entries(filter)) {
    if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
      values[key] = value === types.SuperType?.ENERGY ? 'ENERGY' : value;
    } else {
      values[key] = typeof value;
    }
  }
  return { keys: Object.keys(filter).sort(), values };
}

/**
 * Identify only the public Snap Trap prompt contract. This function reads
 * active Pokémon and the face-up Energy zone; it never inspects either hand,
 * either deck, or face-down Prize identities.
 *
 * @param {object} state
 * @param {object} prompt
 * @param {object} types
 * @returns {object|null}
 */
function identifySnapTrapPrompt(state, prompt, types) {
  if (prompt?.constructor?.name !== 'ChooseCardsPrompt' ||
      prompt.message !== types.GameMessage?.CHOOSE_CARD_TO_DISCARD ||
      typeof prompt.validate !== 'function') return null;

  const filter = prompt.filter ?? {};
  const options = prompt.options ?? {};
  if (Object.keys(filter).length !== 1 ||
      filter.superType !== types.SuperType?.ENERGY ||
      options.min !== 1 || options.max !== 1 ||
      options.allowCancel !== false || options.isSecret === true) return null;

  const players = Array.isArray(state?.players) ? state.players : [];
  const sourceSeat = players.findIndex(player =>
    player.id === prompt.playerId
  );
  if (sourceSeat !== 0 && sourceSeat !== 1) return null;

  const sourceOwner = players[sourceSeat];
  const sourceActive = sourceOwner.active;
  const sourceCard = sourceActive?.getPokemonCard?.();
  if (sourceCard?.fullName !== SOURCE_PRINTING ||
      sourceCard.powers?.[0]?.name !== SOURCE_ABILITY) return null;

  const attackerSeat = players.findIndex(player =>
    player.active === prompt.cards
  );
  if (attackerSeat !== 0 && attackerSeat !== 1 ||
      attackerSeat === sourceSeat) return null;

  const attackerOwner = players[attackerSeat];
  const attackerActive = attackerOwner.active;
  const attackerCard = attackerActive?.getPokemonCard?.();
  if (!attackerCard || prompt.cards !== attackerActive ||
      prompt.cards.energies !== attackerActive.energies ||
      !Array.isArray(prompt.cards.energies?.cards)) return null;

  return {
    public: {
      sourceSeat,
      attackerSeat,
      sourcePrinting: sourceCard.fullName,
      sourceAbility: sourceCard.powers[0].name,
      attackerPrinting: attackerCard.fullName,
      turn: Number.isSafeInteger(state.turn) ? state.turn : null,
      phase: state.phase ?? null,
      publicAttachedEnergyPrintings:
        prompt.cards.energies.cards.map(card => card.fullName ?? null)
    },
    private: {
      sourceOwner,
      attackerOwner,
      attackerActive,
      preEnergyCards: [...prompt.cards.energies.cards]
    }
  };
}

/**
 * Observe the exact owner-visible prompt and its native response without
 * changing the decision policy. The wrapper must be installed while the
 * Agent4 raw-State fallback quarantine is active.
 *
 * @param {Function} next
 * @param {object} [deps]
 * @returns {{result:unknown,audit:object}}
 */
function withSnapTrapOwnerPromptEvidenceV1(next, deps = {}) {
  assert.equal(typeof next, 'function');
  const loaded = deps.Store && deps.SimpleTacticsAi && deps.types ?
    null : loadDependencies();
  const Store = deps.Store ?? loaded.Store;
  const SimpleTacticsAi = deps.SimpleTacticsAi ?? loaded.SimpleTacticsAi;
  const types = deps.types ?? loaded.types;
  const observe = deps.actorObservation ?? actorObservation;
  const getRootStore = deps.getRootStore;
  const rootActionContext = deps.rootActionContext ?? {};
  assert.equal(typeof getRootStore, 'function');
  assert.equal(typeof observe, 'function');

  const quarantine = Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,
    QUARANTINE_ACTIVE
  )?.value;
  assert.ok(
    quarantine?.version === QUARANTINE_VERSION &&
    quarantine?.code === QUARANTINE_CODE,
    'Snap Trap owner evidence must install inside Agent4 raw-State quarantine'
  );

  const promptDescriptor = Object.getOwnPropertyDescriptor(
    Store.prototype, 'prompt'
  );
  const dispatchDescriptor = Object.getOwnPropertyDescriptor(
    Store.prototype, 'dispatch'
  );
  assert.ok(promptDescriptor && typeof promptDescriptor.value === 'function');
  assert.ok(dispatchDescriptor && typeof dispatchDescriptor.value === 'function');

  const promptMetaByObject = new WeakMap();
  const privatePromptContext = new WeakMap();
  const responseByAction = new WeakMap();
  const audit = {
    version: VERSION,
    quarantineActiveAtInstall: true,
    rootStoreIdentityRequired: true,
    ownerObservationContract: 'actor-observation-contract.cjs',
    snapTrapPrompt: null,
    nextOwnerPrompt: null,
    postSnapTrapPrompts: [],
    promptRecords: [],
    responseRecords: [],
    readsOpponentHidden: false,
    readsOpponentHand: false,
    readsOpponentDeck: false,
    readsUnopenedDeck: false,
    readsFaceDownPrizeIdentities: false,
    readsOwnDeckIdentities: false,
    competitiveGamesQualified: 0
  };

  let promptOrdinal = 0;
  let snapTrapResolutionInFlight = false;
  let snapTrapSettled = false;

  function captureObservation(state, seat) {
    if (seat !== 0 && seat !== 1) {
      return { value: null, sha256: null, error: 'owner-seat-unresolved' };
    }
    try {
      const value = observe(state, seat);
      return { value, sha256: sha256(value), error: null };
    } catch (error) {
      return {
        value: null,
        sha256: null,
        error: error?.message ?? String(error)
      };
    }
  }

  function capturePrompt(state, prompt, store, promptIdBeforeStore) {
    const identity = identifySnapTrapPrompt(state, prompt, types);
    const isPostSnapTrap = !identity &&
      (snapTrapResolutionInFlight || snapTrapSettled);
    if (!identity && !isPostSnapTrap) return null;

    const ownerSeat = state.players.findIndex(player =>
      player.id === prompt.playerId
    );
    const record = {
      ordinal: ++promptOrdinal,
      kind: identity ? 'snap-trap' :
        audit.nextOwnerPrompt === null ?
          'next-owner-prompt' : 'post-snap-trap-prompt',
      promptIdBeforeStore: promptIdBeforeStore ?? null,
      promptIdAfterStore: prompt.id ?? null,
      promptType: prompt.constructor?.name ?? null,
      message: prompt.message ?? null,
      ownerSeat: ownerSeat === 0 || ownerSeat === 1 ? ownerSeat : null,
      turn: Number.isSafeInteger(state.turn) ? state.turn : null,
      phase: state.phase ?? null,
      options: promptOptions(prompt),
      filter: promptFilter(prompt, types),
      cardsContainer: prompt.cards?.constructor?.name ?? null,
      sameRootStore: store === getRootStore() &&
        state === getRootStore()?.state,
      ownerObservationAtPromptCreation: null,
      ownerObservationAtPromptCreationSha256: null,
      ownerObservationAtPromptCreationError: null,
      response: null
    };

    if (ownerSeat === 0 || ownerSeat === 1) {
      const observed = captureObservation(state, ownerSeat);
      record.ownerObservationAtPromptCreation = observed.value;
      record.ownerObservationAtPromptCreationSha256 = observed.sha256;
      record.ownerObservationAtPromptCreationError = observed.error;
    }

    if (identity) {
      record.snapTrapIdentity = identity.public;
      audit.snapTrapPrompt = record;
      privatePromptContext.set(prompt, identity.private);
    } else {
      if (audit.nextOwnerPrompt === null) {
        audit.nextOwnerPrompt = record;
      }
      audit.postSnapTrapPrompts.push(record);
    }
    promptMetaByObject.set(prompt, record);
    audit.promptRecords.push(record);
    return record;
  }

  function observedPrompt(state, prompt, ...args) {
    const promptIdBeforeStore = prompt.id ?? null;
    const result = promptDescriptor.value.apply(this, [state, prompt, ...args]);
    capturePrompt(state, prompt, this, promptIdBeforeStore);
    return result;
  }

  function responseShape(action, prompt, record, state, store) {
    const value = action.result;
    const isArray = Array.isArray(value);
    const selected = record.kind === 'snap-trap' && isArray &&
      value.length === 1 ? value[0] : null;
    const seat = state.players.findIndex(player =>
      player.id === prompt.playerId
    );
    const observed = captureObservation(state, seat);
    let nativeValidateAccepted = null;
    if (typeof prompt.validate === 'function') {
      try {
        nativeValidateAccepted = prompt.validate(value) === true;
      } catch (error) {
        nativeValidateAccepted = false;
      }
    }
    return {
      promptId: record.promptIdAfterStore,
      actionPromptId: action.id ?? null,
      samePromptId: String(record.promptIdAfterStore) === String(action.id),
      actionType: action.constructor?.name ?? null,
      responseKind: isArray ? 'array' :
        value === null ? 'null' : typeof value,
      responseLength: isArray ? value.length : null,
      responseBoolean: typeof value === 'boolean' ? value : null,
      selectedCardPrinting: selected?.fullName ?? null,
      selectedCardIsEnergy: selected ?
        selected.superType === types.SuperType?.ENERGY : null,
      selectedCardInPromptParent: selected ?
        prompt.cards?.cards?.includes(selected) === true : null,
      selectedCardInEnergySublist: selected ?
        prompt.cards?.energies?.cards?.includes(selected) === true : null,
      nativeValidateAccepted,
      options: record.options,
      filter: record.filter,
      ownerSeat: record.ownerSeat,
      ownerObservationAtDecision: observed.value,
      ownerObservationAtDecisionSha256: observed.sha256,
      ownerObservationAtDecisionError: observed.error,
      sameRootStore: store === getRootStore() &&
        state === getRootStore()?.state,
      actionOrdinal: null,
      actingSeat: null,
      turnBefore: null,
      rootStoreMatchesAtActionCallback: null,
      dispatchReturnedWithoutThrow: false,
      promptResultMatches: false,
      physicalZoneAfter: null,
      physicalZoneSettled: null
    };
  }

  function observedDispatch(action, ...args) {
    const state = this.state;
    const pending = action?.constructor?.name === 'ResolvePromptAction' ?
      state.prompts?.find(prompt =>
        prompt.result === undefined &&
        String(prompt.id) === String(action.id)
      ) ?? null : null;
    const record = pending ? promptMetaByObject.get(pending) ?? null : null;
    const promptItem = pending ?
      this.promptItems?.find(item => item.ids?.includes(pending.id)) ?? null : null;
    let response = null;
    let privateContext = null;

    if (pending && record) {
      response = responseShape(action, pending, record, state, this);
      response.promptItemFoundBeforeDispatch = Boolean(promptItem);
      response.promptItemIdsBeforeDispatch = promptItem ?
        [...promptItem.ids] : [];
      response.promptResultDefined = false;
      response.promptItemRemovedAfterDispatch = false;
      record.response = response;
      responseByAction.set(action, response);
      audit.responseRecords.push(response);
      if (record.kind === 'snap-trap') {
        snapTrapResolutionInFlight = true;
        privateContext = privatePromptContext.get(pending) ?? null;
      }
    }

    try {
      const result = dispatchDescriptor.value.apply(this, [action, ...args]);
      if (response) {
        response.dispatchReturnedWithoutThrow = true;
        response.promptResultDefined = pending.result !== undefined;
        response.promptResultMatches = pending.result === action.result;
        response.promptItemRemovedAfterDispatch = Boolean(
          promptItem && !this.promptItems.includes(promptItem)
        );
        if (record.kind === 'snap-trap') {
          const selected = Array.isArray(action.result) &&
            action.result.length === 1 ? action.result[0] : null;
          const active = privateContext?.attackerActive;
          const attackerOwner = privateContext?.attackerOwner;
          const currentEnergyCards = active?.energies?.cards ?? [];
          const expectedEnergyCards = privateContext?.preEnergyCards
            ?.filter(card => card !== selected) ?? [];
          const sameRemainingEnergyReferences =
            expectedEnergyCards.length === currentEnergyCards.length &&
            expectedEnergyCards.every(card =>
              currentEnergyCards.includes(card)
            );
          const inDiscard = selected ?
            attackerOwner?.discard?.cards?.includes(selected) === true : false;
          const inLostZone = selected ?
            attackerOwner?.lostzone?.cards?.includes(selected) === true : false;
          const stillInActive = selected ?
            active?.cards?.includes(selected) === true ||
              currentEnergyCards.includes(selected) : false;
          const destination = inDiscard ? 'attacker-discard' :
            inLostZone ? 'attacker-lost-zone' : 'other-or-unresolved';
          response.physicalZoneAfter = {
            destination,
            selectedCardStillInAttackerActive: stillInActive,
            selectedCardInAttackerDiscard: inDiscard,
            selectedCardInAttackerLostZone: inLostZone,
            sameRemainingEnergyReferences,
            promptResultMatches: response.promptResultMatches
          };
          response.physicalZoneSettled = Boolean(
            selected && !stillInActive && (inDiscard || inLostZone) &&
            sameRemainingEnergyReferences && response.promptResultMatches
          );
          snapTrapSettled = response.physicalZoneSettled;
        }
      }
      return result;
    } catch (error) {
      if (response) {
        response.dispatchReturnedWithoutThrow = false;
        response.promptResultDefined = pending.result !== undefined;
        response.promptResultMatches = pending.result === action.result;
        response.promptItemRemovedAfterDispatch = Boolean(
          promptItem && !this.promptItems.includes(promptItem)
        );
        response.dispatchError = error?.message ?? String(error);
      }
      throw error;
    } finally {
      if (record?.kind === 'snap-trap') {
        snapTrapResolutionInFlight = false;
      }
    }
  }

  rootActionContext.onRootActionDispatched = (
    store, action, actionOrdinal, seat, turnBefore
  ) => {
    const response = responseByAction.get(action);
    if (!response) return;
    response.actionOrdinal = actionOrdinal;
    response.actingSeat = seat;
    response.turnBefore = turnBefore;
    response.rootStoreMatchesAtActionCallback = store === getRootStore();
  };

  Object.defineProperty(Store.prototype, 'prompt', {
    ...promptDescriptor,
    value: observedPrompt
  });
  Object.defineProperty(Store.prototype, 'dispatch', {
    ...dispatchDescriptor,
    value: observedDispatch
  });

  const buildAudit = () => ({
    ...audit,
    promptRecords: [...audit.promptRecords],
    responseRecords: [...audit.responseRecords],
    postSnapTrapPrompts: [...audit.postSnapTrapPrompts],
    snapTrapPromptCount: audit.snapTrapPrompt ? 1 : 0,
    nextOwnerPromptCount: audit.nextOwnerPrompt ? 1 : 0,
    postSnapTrapPromptCount: audit.postSnapTrapPrompts.length,
    ownerObservationCapturedCount: audit.promptRecords.filter(record =>
      record.ownerObservationAtPromptCreation !== null
    ).length,
    snapTrapSettled: snapTrapSettled,
    nextOwnerPromptResponseObserved: Boolean(
      audit.nextOwnerPrompt?.response
    )
  });

  try {
    const result = next();
    return { result, audit: buildAudit() };
  } catch (error) {
    if (error && typeof error === 'object') {
      error.snapTrapOwnerPromptEvidenceAudit = buildAudit();
    }
    throw error;
  } finally {
    try {
      assert.strictEqual(Store.prototype.prompt, observedPrompt);
      assert.strictEqual(Store.prototype.dispatch, observedDispatch);
    } finally {
      Object.defineProperty(Store.prototype, 'prompt', promptDescriptor);
      Object.defineProperty(Store.prototype, 'dispatch', dispatchDescriptor);
    }
  }
}

module.exports = {
  VERSION,
  identifySnapTrapPrompt,
  withSnapTrapOwnerPromptEvidenceV1
};
