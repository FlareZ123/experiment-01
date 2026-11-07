'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {
  SOURCE_PRINTING,
  SOURCE_ABILITY,
  withStunfiskSnapTrapPromptMarker
} = require('../agent30/stunfisk-snap-trap-prompt-marker-v3.cjs');
const {
  VERSION: QUARANTINE_VERSION,
  CODE: QUARANTINE_CODE,
  QUARANTINE_ACTIVE
} = require('../agent4-raw-state-native-fallback-quarantine.cjs');
const {
  verifySnapTrapPrompt
} = require('./snap-trap-owner-prompt-policy-v1.cjs');
const {
  VERSION: ENERGY_CHOICE_VERSION,
  chooseSnapTrapEnergyV2
} = require('./snap-trap-energy-choice-v2.cjs');

const OUTPUT = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
const VERSION = 'agent36-snap-trap-owner-prompt-policy-v2';

/**
 * Load a pinned Twinleaf module.
 * @param {string} relative
 * @returns {object}
 */
function loadEngine(relative) {
  return require(path.join(OUTPUT, relative));
}

/**
 * Load the native classes and enums used by the policy.
 * @returns {object}
 */
function loadDependencies() {
  const {SimpleTacticsAi} = loadEngine('simple-bot/simple-tactics-ai');
  const {Store} = loadEngine('game/store/store');
  const {ResolvePromptAction} = loadEngine('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt} = loadEngine('game/store/prompts/choose-cards-prompt');
  const {MoveCardsEffect} = loadEngine('game/store/effects/move-cards-effect');
  const types = {
    ...loadEngine('game/store/card/card-types'),
    GameMessage: loadEngine('game/game-message').GameMessage,
    StateUtils: loadEngine('game/store/state-utils').StateUtils
  };
  return {
    SimpleTacticsAi,
    Store,
    ResolvePromptAction,
    ChooseCardsPrompt,
    MoveCardsEffect,
    types
  };
}

/**
 * @param {object[]} left
 * @param {object[]} right
 * @returns {boolean}
 */
function sameCardReferences(left, right) {
  return Array.isArray(left) && Array.isArray(right) &&
    left.length === right.length &&
    left.every(card => right.includes(card)) &&
    right.every(card => left.includes(card));
}

/**
 * @param {object[]} cards
 * @param {object} selected
 * @returns {object[]}
 */
function withoutSelected(cards, selected) {
  const index = cards.indexOf(selected);
  assert.notEqual(index, -1, 'selected physical Card must exist in the source snapshot');
  return cards.filter((_card, cardIndex) => cardIndex !== index);
}

/**
 * @param {object[]} cards
 * @param {object} selected
 * @returns {object[]}
 */
function withSelected(cards, selected) {
  return [...cards, selected];
}

/**
 * Resolve only a same-prompt, same-Store, same-physical-card Snap Trap event.
 * This wrapper must execute inside Agent4's real native raw-State quarantine.
 *
 * @template T
 * @param {()=>T} run
 * @param {object} deps
 * @returns {{result:T,audit:object}}
 */
function withOwnerSnapTrapPromptResolutionV2(run, deps = {}) {
  assert.equal(typeof run, 'function');
  assert.equal(typeof deps.getOriginForPrompt, 'function');
  assert.equal(typeof deps.getStoreForPrompt, 'function',
    'Private same-prompt Store identity lookup from marker v3 is required');
  assert.equal(typeof deps.getRootStore, 'function',
    'Exact onRootStoreCreated Store capture is required');

  const needsLoad = !deps.SimpleTacticsAi || !deps.Store ||
    !deps.ResolvePromptAction || !deps.ChooseCardsPrompt ||
    !deps.MoveCardsEffect || !deps.types;
  const loaded = needsLoad ? loadDependencies() : null;
  const SimpleTacticsAi = deps.SimpleTacticsAi ?? loaded.SimpleTacticsAi;
  const Store = deps.Store ?? loaded.Store;
  const ResolvePromptAction = deps.ResolvePromptAction ?? loaded.ResolvePromptAction;
  const ChooseCardsPrompt = deps.ChooseCardsPrompt ?? loaded.ChooseCardsPrompt;
  const MoveCardsEffect = deps.MoveCardsEffect ?? loaded.MoveCardsEffect;
  const types = deps.types ?? loaded.types;
  const chooseEnergy = deps.chooseEnergy ?? chooseSnapTrapEnergyV2;
  const energyOptions = deps.energyOptions ?? {};

  assert.equal(typeof SimpleTacticsAi, 'function');
  assert.equal(typeof Store, 'function');
  assert.equal(typeof ResolvePromptAction, 'function');
  assert.equal(typeof ChooseCardsPrompt, 'function');
  assert.equal(typeof MoveCardsEffect, 'function');
  assert.equal(typeof chooseEnergy, 'function');
  assert.ok(types?.GameMessage?.CHOOSE_CARD_TO_DISCARD !== undefined);
  assert.ok(types?.SuperType?.ENERGY !== undefined);
  assert.ok(types?.CardTag?.PRISM_STAR !== undefined);

  const quarantineMarker = Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype, QUARANTINE_ACTIVE
  )?.value;
  assert.ok(
    quarantineMarker?.version === QUARANTINE_VERSION &&
    quarantineMarker?.code === QUARANTINE_CODE,
    'Agent4 native raw-State fallback quarantine must be active before owner policy installation'
  );

  const aiDescriptor = Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype, 'decodeNextAction');
  const promptDescriptor = Object.getOwnPropertyDescriptor(Store.prototype, 'prompt');
  const dispatchDescriptor = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof aiDescriptor?.value, 'function');
  assert.equal(typeof promptDescriptor?.value, 'function');
  assert.equal(typeof dispatchDescriptor?.value, 'function');
  assert.equal(aiDescriptor.configurable, true);
  assert.equal(promptDescriptor.configurable, true);
  assert.equal(dispatchDescriptor.configurable, true);

  const promptStoreByPrompt = new WeakMap();
  const originIdentityByPrompt = new WeakMap();
  const submitted = new WeakMap();
  const audit = {
    version: VERSION,
    energyChoiceVersion: ENERGY_CHOICE_VERSION,
    quarantineVersion: quarantineMarker.version,
    quarantineActiveAtInstall: true,
    rootStoreLookups: 0,
    promptStoreJoins: 0,
    markerStoreIdentityJoins: 0,
    exactPromptIdentityJoins: 0,
    sourceProofPromptsSeen: 0,
    exactPromptContracts: 0,
    promptContractFailures: 0,
    delegatedUnmarkedPrompts: 0,
    delegatedNonLiveStates: 0,
    ownerChoices: 0,
    choiceFailures: 0,
    dispatchRevalidations: 0,
    dispatchRevalidationFailures: 0,
    moveCardsEffectReceiptCount: 0,
    physicalSettlements: 0,
    physicalSettlementFailures: 0,
    choices: [],
    hiddenCardIdentitiesInspected: false,
    bothSeatCoverageEstablished: false,
    competitiveGamesQualified: 0
  };

  function requireRootStore() {
    audit.rootStoreLookups++;
    const rootStore = deps.getRootStore();
    assert.ok(rootStore, 'headless onRootStoreCreated has not supplied the exact root Store');
    return rootStore;
  }

  function prompt(...args) {
    const state = args[0];
    const promptArgument = args[1];
    const result = promptDescriptor.value.apply(this, args);
    const createdPrompt = promptArgument?.constructor?.name === 'ChooseCardsPrompt'
      ? promptArgument
      : result?.prompt ?? result;
    if (!createdPrompt || typeof createdPrompt !== 'object') return result;

    const proof = deps.getOriginForPrompt(createdPrompt);
    if (!proof) return result;

    const rootStore = requireRootStore();
    assert.equal(proof.sourceStoreIdentityCaptured, true,
      'marker v3 must capture the exact prompt Store in its private WeakMap');
    assert.strictEqual(deps.getStoreForPrompt(createdPrompt), this,
      'marker v3 prompt-to-Store identity does not match Store.prompt receiver');
    audit.markerStoreIdentityJoins++;
    assert.strictEqual(this, rootStore,
      'source-marked prompt was created by a Store other than onRootStoreCreated');
    assert.strictEqual(state, rootStore.state,
      'source-marked prompt State argument is not the exact root Store State');

    const sourceSeat = proof.sourceSeat;
    const sourceOwner = state.players?.[sourceSeat];
    assert.ok(sourceOwner, 'source owner must exist in the exact prompt State');
    assert.equal(createdPrompt.constructor?.name, 'ChooseCardsPrompt');
    const sourceOwner = state.players?.[proof.sourceSeat];
    const attacker = state.players?.[proof.attackerSeat];
    assert.ok(sourceOwner && attacker, 'source and attacker seats must exist');
    const sourceCard = sourceOwner.active?.getPokemonCard?.();
    const sourceEffect = sourceCard?.powers?.[0];
    const attackerActive = attacker.active;
    const attackerPokemon = attackerActive?.getPokemonCard?.();
    const energySublist = attackerActive?.energies;
    assert.ok(sourceCard && sourceEffect && attackerPokemon && energySublist);
    assert.strictEqual(createdPrompt.player, sourceOwner);
    assert.strictEqual(createdPrompt.cards, attackerActive);
    assert.strictEqual(createdPrompt.cards.energies, energySublist);
    const eligibleEnergyCards = energySublist.cards.filter(card =>
      card?.superType === types.SuperType.ENERGY
    );

    // Capture physical references now. Marker v3 completes promptIdAfterStore
    // after this Store.prompt wrapper returns, so full proof validation occurs
    // later in decodeNextAction, when the same proof object is complete.
    const identity = {
      store: this,
      state,
      proof,
      sourceOwner,
      attacker,
      sourceActive: sourceOwner.active,
      sourceCard,
      sourceEffect,
      sourceActiveCards: [...sourceOwner.active.cards],
      attackerActive,
      attackerPokemon,
      attackerParentCards: [...attackerActive.cards],
      energySublist,
      energySublistCards: [...energySublist.cards],
      eligibleEnergyCards: [...eligibleEnergyCards],
      attackerDiscard: attacker.discard,
      attackerLostzone: attacker.lostzone
    };
    promptStoreByPrompt.set(createdPrompt, this);
    originIdentityByPrompt.set(createdPrompt, identity);
    audit.promptStoreJoins++;
    audit.exactPromptIdentityJoins++;
    return result;
  }

  function decode(state, ...args) {
    const rootStore = requireRootStore();
    if (state !== rootStore.state) {
      audit.delegatedNonLiveStates++;
      return aiDescriptor.value.call(this, state, ...args);
    }

    const ownerId = this.client?.id;
    const pending = Array.isArray(state?.prompts)
      ? state.prompts.filter(item =>
        item.playerId === ownerId && item.result === undefined)
      : [];
    const matches = pending.map(item => ({
      prompt: item,
      proof: deps.getOriginForPrompt(item)
    })).filter(item => item.proof);

    if (matches.length === 0) {
      audit.delegatedUnmarkedPrompts++;
      return aiDescriptor.value.call(this, state, ...args);
    }
    if (matches.length !== 1) {
      throw new Error('Multiple source-marked Snap Trap prompts are pending for one owner');
    }

    const {prompt: livePrompt, proof} = matches[0];
    audit.sourceProofPromptsSeen++;
    const identity = originIdentityByPrompt.get(livePrompt);
    if (!identity) {
      audit.promptContractFailures++;
      throw new Error('Source proof exists without same-prompt Store/card identity metadata');
    }
    if (identity.store !== rootStore ||
        promptStoreByPrompt.get(livePrompt) !== rootStore ||
        deps.getStoreForPrompt(livePrompt) !== rootStore ||
        identity.state !== state ||
        identity.proof !== proof) {
      audit.promptContractFailures++;
      throw new Error('Snap Trap origin Store/State/proof identity join failed');
    }

    let verified;
    try {
      verified = verifySnapTrapPrompt(
        state, livePrompt, proof, this, types, ChooseCardsPrompt
      );
      assert.strictEqual(verified.sourceOwner, identity.sourceOwner);
      assert.strictEqual(verified.attacker, identity.attacker);
      assert.strictEqual(verified.sourceCard, identity.sourceCard);
      assert.strictEqual(verified.sourceEffect, identity.sourceEffect);
      assert.strictEqual(verified.attacker.active, identity.attackerActive);
      assert.strictEqual(verified.attacker.active.getPokemonCard(), identity.attackerPokemon);
      assert.ok(sameCardReferences(verified.sourceOwner.active.cards, identity.sourceActiveCards));
      assert.ok(sameCardReferences(verified.attacker.active.cards, identity.attackerParentCards));
      assert.ok(sameCardReferences(
        verified.attacker.active.energies.cards,
        identity.energySublistCards
      ));
      assert.ok(sameCardReferences(
        identity.eligibleEnergyCards,
        verified.attacker.active.energies.cards.filter(card =>
          card?.superType === types.SuperType.ENERGY)
      ));
      assert.equal(promptStoreByPrompt.get(livePrompt), rootStore);
      audit.exactPromptContracts++;
    } catch (error) {
      audit.promptContractFailures++;
      throw error;
    }

    const choice = chooseEnergy(
      livePrompt,
      verified.attacker.active,
      types,
      energyOptions
    );
    if (!choice?.card ||
        !identity.eligibleEnergyCards.includes(choice.card) ||
        !livePrompt.validate([choice.card]) ||
        !livePrompt.cards.cards.includes(choice.card) ||
        !livePrompt.cards.energies.cards.includes(choice.card)) {
      audit.choiceFailures++;
      throw new Error('Snap Trap v2 selector returned no same-prompt native-valid physical Energy Card');
    }

    const action = new ResolvePromptAction(livePrompt.id, [choice.card]);
    submitted.set(action, {
      store: rootStore,
      state,
      prompt: livePrompt,
      proof,
      identity,
      card: choice.card,
      choice
    });
    audit.ownerChoices++;
    return action;
  }

  function dispatch(action, ...args) {
    const selected = submitted.get(action);
    if (!selected) return dispatchDescriptor.value.apply(this, [action, ...args]);

    const fail = message => {
      audit.dispatchRevalidationFailures++;
      throw new Error('Snap Trap dispatch revalidation failed: ' + message);
    };
    const rootStore = requireRootStore();
    const {identity, prompt: livePrompt, card, proof} = selected;
    if (!(action instanceof ResolvePromptAction)) fail('action class');
    if (action.promptId !== livePrompt.id) fail('prompt ID');
    if (!Array.isArray(action.result) ||
        action.result.length !== 1 ||
        action.result[0] !== card) fail('exact one-card action result');
    if (this !== rootStore || this !== selected.store || identity.store !== rootStore) {
      fail('exact root Store identity');
    }
    if (this.state !== selected.state || rootStore.state !== selected.state ||
        identity.state !== selected.state) fail('exact live Store State identity');
    if (promptStoreByPrompt.get(livePrompt) !== rootStore ||
        deps.getStoreForPrompt(livePrompt) !== rootStore ||
        originIdentityByPrompt.get(livePrompt) !== identity ||
        deps.getOriginForPrompt(livePrompt) !== proof ||
        identity.proof !== proof) fail('same-prompt origin identity');
    if (selected.state.turn !== proof.turn) fail('turn identity');
    let reverified;
    try {
      reverified = verifySnapTrapPrompt(
        selected.state,
        livePrompt,
        proof,
        {client: {id: identity.sourceOwner.id}},
        types,
        ChooseCardsPrompt
      );
    } catch (error) {
      fail('native prompt contract changed: ' + error.message);
    }
    if (reverified.sourceCard !== identity.sourceCard ||
        reverified.sourceEffect !== identity.sourceEffect ||
        reverified.attacker.active !== identity.attackerActive) {
      fail('source or attacker physical identity changed');
    }
    if (!selected.state.prompts.includes(livePrompt) ||
        livePrompt.result !== undefined) fail('pending unresolved prompt');
    if (livePrompt.cards !== identity.attackerActive ||
        livePrompt.cards.energies !== identity.energySublist) fail('parent/sublist references');
    if (!sameCardReferences(livePrompt.cards.cards, identity.attackerParentCards) ||
        !sameCardReferences(livePrompt.cards.energies.cards, identity.energySublistCards)) {
      fail('prompt card lists changed after decision');
    }
    if (!identity.eligibleEnergyCards.includes(card) ||
        !livePrompt.cards.cards.includes(card) ||
        !livePrompt.cards.energies.cards.includes(card) ||
        !livePrompt.validate([card])) fail('selected physical Energy no longer validates');
    if (identity.sourceOwner.active !== identity.sourceActive ||
        identity.sourceOwner.active.getPokemonCard() !== identity.sourceCard ||
        identity.sourceCard.powers?.[0] !== identity.sourceEffect ||
        identity.attacker.active !== identity.attackerActive ||
        identity.attacker.active.getPokemonCard() !== identity.attackerPokemon) {
      fail('source or attacker Active identity changed');
    }
    if (selected.state.players[proof.sourceSeat] !== identity.sourceOwner ||
        selected.state.players[proof.attackerSeat] !== identity.attacker) {
      fail('source/attacker seat references changed');
    }
    audit.dispatchRevalidations++;

    const prismStar = Array.isArray(card.tags) &&
      card.tags.includes(types.CardTag.PRISM_STAR);
    const before = {
      sourceActiveCards: [...identity.sourceActive.cards],
      attackerParentCards: [...identity.attackerActive.cards],
      energySublistCards: [...identity.energySublist.cards],
      discardCards: [...identity.attackerDiscard.cards],
      lostzoneCards: [...identity.attackerLostzone.cards]
    };
    const ownReduceDescriptor = Object.getOwnPropertyDescriptor(this, 'reduceEffect');
    const originalReduce = this.reduceEffect;
    assert.equal(typeof originalReduce, 'function');
    const receipts = [];
    const instrumentedReduce = function(state, effect, ...reduceArgs) {
      if (effect instanceof MoveCardsEffect) {
        receipts.push({
          effect,
          source: effect.source,
          destination: effect.destination,
          cards: Array.isArray(effect.cards) ? [...effect.cards] : [],
          sourceCard: effect.sourceCard,
          sourceEffect: effect.sourceEffect
        });
      }
      return originalReduce.call(this, state, effect, ...reduceArgs);
    };
    Object.defineProperty(this, 'reduceEffect', {
      configurable: true,
      enumerable: ownReduceDescriptor?.enumerable ?? false,
      writable: true,
      value: instrumentedReduce
    });

    let result;
    try {
      result = dispatchDescriptor.value.apply(this, [action, ...args]);
    } catch (error) {
      audit.physicalSettlementFailures++;
      throw error;
    } finally {
      if (ownReduceDescriptor) {
        Object.defineProperty(this, 'reduceEffect', ownReduceDescriptor);
      } else {
        delete this.reduceEffect;
      }
    }

    audit.moveCardsEffectReceiptCount += receipts.length;
    const receipt = receipts[0];
    const expectedDiscard = prismStar
      ? before.discardCards
      : withSelected(before.discardCards, card);
    const expectedLostzone = prismStar
      ? withSelected(before.lostzoneCards, card)
      : before.lostzoneCards;
    const afterState = rootStore.state;
    const afterAttacker = afterState.players[proof.attackerSeat];
    const afterSourceOwner = afterState.players[proof.sourceSeat];
    const exactReceipt = receipts.length === 1 &&
      receipt.cards.length === 1 &&
      receipt.cards[0] === card &&
      receipt.source === identity.attackerActive &&
      receipt.destination === identity.attackerDiscard &&
      receipt.sourceCard === identity.sourceCard &&
      receipt.sourceEffect === identity.sourceEffect;
    const exactPromptResult = livePrompt.result === action.result &&
      Array.isArray(livePrompt.result) &&
      livePrompt.result.length === 1 &&
      livePrompt.result[0] === card;
    const exactZoneSettlement =
      !identity.attackerActive.cards.includes(card) &&
      !identity.energySublist.cards.includes(card) &&
      sameCardReferences(
        identity.attackerActive.cards,
        withoutSelected(before.attackerParentCards, card)
      ) &&
      sameCardReferences(
        identity.energySublist.cards,
        withoutSelected(before.energySublistCards, card)
      ) &&
      sameCardReferences(identity.attackerDiscard.cards, expectedDiscard) &&
      sameCardReferences(identity.attackerLostzone.cards, expectedLostzone) &&
      sameCardReferences(identity.sourceActive.cards, before.sourceActiveCards) &&
      afterAttacker.id === identity.attacker.id &&
      afterAttacker.active === identity.attackerActive &&
      afterAttacker.discard === identity.attackerDiscard &&
      afterAttacker.lostzone === identity.attackerLostzone &&
      afterSourceOwner.id === identity.sourceOwner.id &&
      afterSourceOwner.active === identity.sourceActive;

    if (!exactReceipt || !exactPromptResult || !exactZoneSettlement) {
      audit.physicalSettlementFailures++;
      throw new Error('Snap Trap response did not produce exactly one same-card MoveCardsEffect and the expected physical zone transition');
    }

    audit.physicalSettlements++;
    audit.choices.push({
      promptId: String(livePrompt.id),
      sourceSeat: proof.sourceSeat,
      attackerSeat: proof.attackerSeat,
      energyPrinting: card.fullName ?? card.name ?? null,
      prismStar,
      bestBeforeAttackDamage: choice.bestBeforeAttackDamage,
      bestRemainingAttackDamage: choice.bestRemainingAttackDamage,
      bestAttackDenial: choice.bestAttackDenial,
      deniedAttacks: choice.deniedAttacks,
      deniedBaseDamage: choice.deniedBaseDamage,
      energyMapModel: choice.energyMapModel,
      damageModel: choice.damageModel,
      dynamicEnergyOverrides: choice.dynamicEnergyOverrides,
      specialEnergyBlocked: choice.specialEnergyBlocked,
      specialEnergyBlockStatus: choice.specialEnergyBlockStatus,
      actualDestination: prismStar ? 'lostzone' : 'discard',
      sourcePrinting: SOURCE_PRINTING,
      sourceAbility: SOURCE_ABILITY,
      exactRootStoreJoin: true,
      exactPromptCardIdentityJoin: true,
      exactlyOneMoveCardsEffect: true,
      noOtherPublicCardMoved: true
    });
    return result;
  }

  Object.defineProperty(SimpleTacticsAi.prototype, 'decodeNextAction', {
    ...aiDescriptor,
    value: decode
  });
  Object.defineProperty(Store.prototype, 'prompt', {
    ...promptDescriptor,
    value: prompt
  });
  Object.defineProperty(Store.prototype, 'dispatch', {
    ...dispatchDescriptor,
    value: dispatch
  });

  try {
    return {result: run(), audit};
  } catch (error) {
    if (error && typeof error === 'object') {
      error.snapTrapOwnerPromptPolicyAudit = {...audit};
    }
    throw error;
  } finally {
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction, decode);
    assert.strictEqual(Store.prototype.prompt, prompt);
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    Object.defineProperty(SimpleTacticsAi.prototype, 'decodeNextAction', aiDescriptor);
    Object.defineProperty(Store.prototype, 'prompt', promptDescriptor);
    Object.defineProperty(Store.prototype, 'dispatch', dispatchDescriptor);
  }
}

/**
 * Compose Agent30's source marker with the exact-Store owner policy. The caller
 * must already have installed Agent4's raw-State quarantine.
 *
 * @template T
 * @param {()=>T} run
 * @param {object} deps
 * @returns {{result:T,audit:object}}
 */
function withSnapTrapOwnerPolicyV2(run, deps = {}) {
  const markerLayer = deps.markerLayer ?? withStunfiskSnapTrapPromptMarker;
  assert.equal(typeof markerLayer, 'function');
  const marked = markerLayer((getOriginForPrompt, getStoreForPrompt) =>
    withOwnerSnapTrapPromptResolutionV2(run, {
      ...deps,
      getOriginForPrompt,
      getStoreForPrompt
    }), deps.markerDeps);
  return {
    result: marked.result.result,
    audit: {
      version: VERSION,
      marker: marked.audit,
      ownerPolicy: marked.result.audit,
      bothSeatCoverageEstablished: false,
      competitiveGamesQualified: 0
    }
  };
}

/**
 * Clone a match request while chaining its exact root-Store callback.
 * @param {object} request
 * @param {(store:object)=>void} capture
 * @returns {object}
 */
function requestWithRootStoreCapture(request, capture) {
  assert.ok(request && typeof request === 'object');
  const originalCallback = request.onRootStoreCreated;
  const descriptors = Object.getOwnPropertyDescriptors(request);
  delete descriptors.onRootStoreCreated;
  const wrapped = Object.create(Object.getPrototypeOf(request), descriptors);
  Object.defineProperty(wrapped, 'onRootStoreCreated', {
    configurable: true,
    enumerable: true,
    writable: true,
    value(store) {
      capture(store);
      return typeof originalCallback === 'function'
        ? originalCallback.call(request, store)
        : undefined;
    }
  });
  return wrapped;
}

/**
 * Install the source marker and owner policy inside every actual native
 * headless.runMatch call. Install this wrapper before the canonical runner so
 * its other per-match wrappers are established before the policy is installed.
 *
 * @template T
 * @param {()=>T} next
 * @param {object} [deps]
 * @returns {{result:T,audit:object}}
 */
function withSnapTrapInsideNativeMatchesV2(next, deps = {}) {
  assert.equal(typeof next, 'function');
  const headless = deps.headless ?? require('../headless.cjs');
  const oldRunMatch = headless.runMatch;
  assert.equal(typeof oldRunMatch, 'function');
  const matches = [];

  function wrappedRunMatch(request) {
    let rootStore = null;
    let rootStoreCaptureCount = 0;
    const label = request?.label ?? null;
    const wrappedRequest = requestWithRootStoreCapture(request, store => {
      if (rootStore !== null && rootStore !== store) {
        throw new Error('A single native match created multiple root Store identities');
      }
      rootStore = store;
      rootStoreCaptureCount++;
    });

    try {
      const outcome = withSnapTrapOwnerPolicyV2(
        () => oldRunMatch(wrappedRequest),
        {
          ...(deps.policyDeps ?? deps),
          getRootStore: () => rootStore
        }
      );
      assert.equal(rootStoreCaptureCount, 1,
        'the genuine headless onRootStoreCreated callback must fire exactly once');
      matches.push({
        label,
        disposition: 'returned-unqualified',
        rootStoreCaptureCount,
        rootStoreCaptured: rootStore !== null,
        marker: outcome.audit.marker,
        ownerPolicy: outcome.audit.ownerPolicy,
        competitiveGamesQualified: 0
      });
      return outcome.result;
    } catch (error) {
      matches.push({
        label,
        disposition: 'engine-aborted-unqualified',
        rootStoreCaptureCount,
        rootStoreCaptured: rootStore !== null,
        marker: error?.stunfiskSnapTrapPromptMarkerAudit ?? null,
        ownerPolicy: error?.snapTrapOwnerPromptPolicyAudit ?? null,
        competitiveGamesQualified: 0
      });
      if (error && typeof error === 'object') {
        error.snapTrapInsideNativeMatchesAudit = {
          version: VERSION,
          nativeMatchAttempts: [...matches],
          bothSeatCoverageEstablished: false,
          competitiveGamesQualified: 0
        };
      }
      throw error;
    }
  }

  headless.runMatch = wrappedRunMatch;
  try {
    return {
      result: next(),
      audit: {
        version: VERSION,
        nativeMatchCalls: matches.length,
        nativeMatchAttempts: matches,
        exactOnRootStoreCaptureRequired: true,
        bothSeatCoverageEstablished: false,
        competitiveGamesQualified: 0
      }
    };
  } finally {
    assert.strictEqual(headless.runMatch, wrappedRunMatch,
      'Concurrent headless.runMatch patch survived Snap Trap owner policy');
    headless.runMatch = oldRunMatch;
  }
}

module.exports = {
  VERSION,
  sameCardReferences,
  withOwnerSnapTrapPromptResolutionV2,
  withSnapTrapOwnerPolicyV2,
  requestWithRootStoreCapture,
  withSnapTrapInsideNativeMatchesV2
};
