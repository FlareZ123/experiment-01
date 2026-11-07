'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {
  VERSION: ENERGY_CHOICE_VERSION,
  chooseSnapTrapEnergy
} = require('./snap-trap-energy-choice-v1.cjs');
const {
  SOURCE_PRINTING,
  SOURCE_ABILITY,
  withStunfiskSnapTrapPromptMarker
} = require('../agent30/stunfisk-snap-trap-prompt-marker-v2.cjs');

const OUTPUT = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
const VERSION = 'agent36-snap-trap-owner-prompt-policy-v1';

/**
 * Load a pinned Twinleaf module.
 * @param {string} relative
 * @returns {object}
 */
function loadEngine(relative) {
  return require(path.join(OUTPUT, relative));
}

/**
 * Load the engine classes and enums needed by this prompt policy.
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
 * Verify that the marker proof and the live native prompt still describe the
 * same public Active-to-Active Snap Trap choice.
 *
 * @param {object} state
 * @param {object} prompt
 * @param {object} proof
 * @param {object} ai
 * @param {object} types
 * @param {Function} ChooseCardsPrompt
 * @returns {{sourceSeat:number,attackerSeat:number,sourceOwner:object,
 *   attacker:object,sourceCard:object,sourceEffect:object}}
 */
function verifySnapTrapPrompt(state, prompt, proof, ai, types, ChooseCardsPrompt) {
  const {GameMessage, SuperType} = types;
  const fail = message => {
    throw new Error('Snap Trap owner prompt contract failed: ' + message);
  };

  if (!(prompt instanceof ChooseCardsPrompt)) fail('prompt class');
  if (!state?.players || state.players.length !== 2) fail('two-player state');
  if (proof?.sourcePrinting !== SOURCE_PRINTING) fail('source printing');
  if (proof?.sourceAbility !== SOURCE_ABILITY) fail('source ability');
  if (proof?.sourceZone !== 'owner-active-pokemon-list') fail('source zone');
  if (proof?.attackerZone !== 'opponent-active-pokemon-list') fail('attacker zone');
  if (proof?.sourceCardPublic !== true) fail('source visibility');
  if (proof?.promptCardsIsAttackingPokemonList !== true) fail('parent-list identity proof');
  if (proof?.promptEnergyListIsAttackingEnergySublist !== true) fail('Energy-sublist identity proof');
  if (proof?.eligibleSubzone !== 'attacker-active-energies') fail('eligible subzone');
  if (proof?.promptType !== 'ChooseCardsPrompt') fail('proof prompt type');
  if (proof?.promptMessage !== 'CHOOSE_CARD_TO_DISCARD') fail('proof prompt message');
  if (proof?.moveSourceCard !== SOURCE_PRINTING ||
      proof?.moveSourceEffect !== SOURCE_ABILITY) fail('MoveCardsEffect source identity');
  if (proof?.promptCardsClass !== prompt.cards?.constructor?.name) fail('prompt parent-list class');
  if (proof?.promptIdAssignedByStore !== true) fail('Store-assigned prompt ID');
  if (proof?.pendingNativePromptId !== String(prompt.id)) fail('pending prompt ID');
  if (String(proof?.promptIdAfterStore) !== String(prompt.id)) fail('post-Store prompt ID');
  if (proof?.moveSourceCard !== SOURCE_PRINTING ||
      proof?.moveSourceEffect !== SOURCE_ABILITY) fail('MoveCardsEffect source identity');
  if (proof?.promptOwnerSeat !== proof.sourceSeat) fail('prompt owner seat');
  if (!Number.isInteger(proof.sourceSeat) || !Number.isInteger(proof.attackerSeat) ||
      proof.sourceSeat === proof.attackerSeat ||
      proof.sourceSeat < 0 || proof.sourceSeat > 1 ||
      proof.attackerSeat < 0 || proof.attackerSeat > 1) fail('seat pair');
  if (proof.turn !== state.turn) fail('turn identity');

  const sourceOwner = state.players[proof.sourceSeat];
  const attacker = state.players[proof.attackerSeat];
  if (sourceOwner?.id !== ai.client?.id) fail('AI is not source owner');
  if (prompt.playerId !== sourceOwner.id || prompt.player !== sourceOwner) {
    fail('native prompt player identity');
  }
  if (state.players.indexOf(sourceOwner) !== proof.sourceSeat ||
      state.players.indexOf(attacker) !== proof.attackerSeat) fail('seat references');
  if (prompt.result !== undefined || !state.prompts.includes(prompt)) {
    fail('prompt is not the live pending prompt');
  }
  if (prompt.message !== GameMessage.CHOOSE_CARD_TO_DISCARD) fail('message');
  if (prompt.filter?.superType !== SuperType.ENERGY ||
      Object.keys(prompt.filter ?? {}).sort().join(',') !== 'superType') {
    fail('exact Energy filter');
  }
  if (prompt.options?.min !== 1 || prompt.options?.max !== 1 ||
      prompt.options?.allowCancel !== false || prompt.options?.isSecret === true) {
    fail('mandatory one-card non-secret options');
  }
  if (JSON.stringify(proof.filterKeys) !== JSON.stringify(['superType']) ||
      proof.min !== 1 || proof.max !== 1 ||
      proof.allowCancel !== false || proof.isSecret !== false) {
    fail('source proof prompt options');
  }

  const sourceCard = sourceOwner.active?.getPokemonCard?.();
  const sourceEffect = sourceCard?.powers?.[0];
  const attackerPokemon = attacker.active?.getPokemonCard?.();
  if (sourceCard?.fullName !== SOURCE_PRINTING ||
      sourceEffect?.name !== SOURCE_ABILITY ||
      !sourceOwner.active.cards.includes(sourceCard)) fail('live source identity');
  if (attackerPokemon?.fullName !== proof.attackerPrinting ||
      !attacker.active.cards.includes(attackerPokemon)) fail('live attacker identity');
  if (prompt.cards !== attacker.active ||
      prompt.cards?.energies !== attacker.active?.energies) {
    fail('exact attacking Active and Energy sublist references');
  }

  const eligibleEnergy = attacker.active.energies.cards.filter(card =>
    card?.superType === SuperType.ENERGY
  );
  const publicPrinting = card =>
    typeof card?.fullName === 'string' ? card.fullName :
      typeof card?.name === 'string' ? card.name : null;
  const eligiblePrintings = eligibleEnergy.map(publicPrinting);
  if (eligibleEnergy.length !== proof.eligibleEnergyCount ||
      JSON.stringify(eligiblePrintings) !== JSON.stringify(proof.eligibleEnergyPrintings)) {
    fail('attached Energy count/printing join');
  }
  if (typeof prompt.validate !== 'function') fail('native validator');

  return {
    sourceSeat: proof.sourceSeat,
    attackerSeat: proof.attackerSeat,
    sourceOwner,
    attacker,
    sourceCard,
    sourceEffect
  };
}

/**
 * Resolve only a source-marked, live Galarian Stunfisk SSH Snap Trap prompt.
 * Every unrelated prompt delegates to the previously installed decoder,
 * preserving the native raw-State fallback quarantine.
 *
 * @template T
 * @param {()=>T} run One synchronous native match.
 * @param {object} deps Pinned engine dependencies and scoped origin lookup.
 * @returns {{result:T,audit:object}}
 */
function withOwnerSnapTrapPromptResolution(run, deps = {}) {
  assert.equal(typeof run, 'function');
  assert.equal(typeof deps.getOriginForPrompt, 'function',
    'A scoped same-prompt source-origin lookup is required');

  const needsLoad = !deps.SimpleTacticsAi || !deps.Store ||
    !deps.ResolvePromptAction || !deps.ChooseCardsPrompt ||
    !deps.MoveCardsEffect || !deps.types;
  const loaded = needsLoad ? loadDependencies() : null;
  const SimpleTacticsAi = deps.SimpleTacticsAi ?? loaded?.SimpleTacticsAi;
  const Store = deps.Store ?? loaded?.Store;
  const ResolvePromptAction = deps.ResolvePromptAction ?? loaded?.ResolvePromptAction;
  const ChooseCardsPrompt = deps.ChooseCardsPrompt ?? loaded?.ChooseCardsPrompt;
  const MoveCardsEffect = deps.MoveCardsEffect ?? loaded?.MoveCardsEffect;
  const types = deps.types ?? loaded?.types;
  const chooseEnergy = deps.chooseEnergy ?? chooseSnapTrapEnergy;

  assert.equal(typeof SimpleTacticsAi, 'function');
  assert.equal(typeof Store, 'function');
  assert.equal(typeof ResolvePromptAction, 'function');
  assert.equal(typeof ChooseCardsPrompt, 'function');
  assert.equal(typeof MoveCardsEffect, 'function');
  assert.equal(typeof chooseEnergy, 'function');
  assert.ok(types?.GameMessage?.CHOOSE_CARD_TO_DISCARD !== undefined);
  assert.ok(types?.SuperType?.ENERGY !== undefined);
  assert.ok(types?.CardTag?.PRISM_STAR !== undefined);

  const aiDescriptor = Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype, 'decodeNextAction');
  const storeDescriptor = Object.getOwnPropertyDescriptor(
    Store.prototype, 'dispatch');
  assert.equal(typeof aiDescriptor?.value, 'function');
  assert.equal(typeof storeDescriptor?.value, 'function');
  assert.equal(aiDescriptor.configurable, true);
  assert.equal(storeDescriptor.configurable, true);

  const audit = {
    version: VERSION,
    energyChoiceVersion: ENERGY_CHOICE_VERSION,
    liveStoresObserved: 0,
    sourceProofPromptsSeen: 0,
    exactPromptContracts: 0,
    promptContractFailures: 0,
    delegatedUnmarkedPrompts: 0,
    delegatedNonLiveStates: 0,
    ownerChoices: 0,
    choiceFailures: 0,
    promptDispatchFailures: 0,
    physicalSettlements: 0,
    physicalSettlementFailures: 0,
    choices: [],
    hiddenCardIdentitiesInspected: false,
    competitiveGamesQualified: 0
  };
  let liveStore = null;
  const submitted = new WeakMap();

  function dispatch(action, ...args) {
    if (action?.constructor?.name === 'AddPlayerAction' && liveStore !== this) {
      liveStore = this;
      audit.liveStoresObserved++;
    }

    const selected = submitted.get(action);
    if (!selected) return storeDescriptor.value.apply(this, [action, ...args]);
    assert.strictEqual(this, selected.store,
      'Snap Trap response was dispatched through a different Store');
    assert.strictEqual(this, liveStore,
      'Snap Trap response was dispatched through a non-live Store');

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
      result = storeDescriptor.value.apply(this, [action, ...args]);
    } catch (error) {
      audit.promptDispatchFailures++;
      throw error;
    } finally {
      if (ownReduceDescriptor) {
        Object.defineProperty(this, 'reduceEffect', ownReduceDescriptor);
      } else {
        delete this.reduceEffect;
      }
    }

    const promptSettled = selected.prompt.result !== undefined &&
      selected.prompt.result === action.result &&
      Array.isArray(action.result) &&
      action.result.length === 1 &&
      action.result[0] === selected.card;
    const matchingReceipts = receipts.filter(receipt =>
      receipt.cards.length === 1 && receipt.cards[0] === selected.card
    );
    const receipt = matchingReceipts[0];
    const prismStar = Array.isArray(selected.card.tags) &&
      selected.card.tags.includes(types.CardTag.PRISM_STAR);
    const inDiscard = selected.attackerDiscard.cards.includes(selected.card);
    const inLostzone = selected.attackerLostzone.cards.includes(selected.card);
    const physicallyTransferred =
      !selected.attackerActive.cards.includes(selected.card) &&
      !selected.attackerActive.energies.cards.includes(selected.card) &&
      (prismStar ? inLostzone && !inDiscard : inDiscard && !inLostzone);
    const exactEffectReceipt = matchingReceipts.length === 1 &&
      receipt.source === selected.attackerActive &&
      receipt.destination === selected.attackerDiscard &&
      receipt.sourceCard === selected.sourceCard &&
      receipt.sourceEffect === selected.sourceEffect &&
      receipt.sourceCard.fullName === SOURCE_PRINTING &&
      receipt.sourceEffect.name === SOURCE_ABILITY;

    if (!promptSettled || !physicallyTransferred || !exactEffectReceipt) {
      audit.physicalSettlementFailures++;
      throw new Error('Snap Trap owner response did not settle the exact physical Energy through the printed source effect');
    }

    audit.physicalSettlements++;
    audit.choices.push({
      promptId: String(selected.prompt.id),
      sourceSeat: selected.sourceSeat,
      attackerSeat: selected.attackerSeat,
      energyPrinting: selected.card.fullName ?? null,
      prismStar,
      denialScore: selected.choice.denialScore,
      deniedAttacks: selected.choice.deniedAttacks,
      payableAttackCount: selected.choice.payableAttackCount,
      eligibleCount: selected.choice.eligibleCount,
      actualDestination: prismStar ? 'lostzone' : 'discard',
      sourcePrinting: SOURCE_PRINTING,
      sourceAbility: SOURCE_ABILITY
    });
    return result;
  }

  function decode(state, ...args) {
    if (state !== liveStore?.state) {
      audit.delegatedNonLiveStates++;
      return aiDescriptor.value.call(this, state, ...args);
    }

    const ownerId = this.client?.id;
    const pending = Array.isArray(state?.prompts)
      ? state.prompts.filter(prompt =>
        prompt.playerId === ownerId && prompt.result === undefined)
      : [];
    const matches = pending.map(prompt => ({
      prompt,
      proof: deps.getOriginForPrompt(prompt)
    })).filter(item => item.proof);

    if (matches.length === 0) {
      audit.delegatedUnmarkedPrompts++;
      return aiDescriptor.value.call(this, state, ...args);
    }
    if (matches.length !== 1) {
      throw new Error('Multiple source-marked Snap Trap prompts are pending for one owner');
    }

    const {prompt, proof} = matches[0];
    audit.sourceProofPromptsSeen++;
    let verified;
    try {
      verified = verifySnapTrapPrompt(
        state, prompt, proof, this, types, ChooseCardsPrompt
      );
      audit.exactPromptContracts++;
    } catch (error) {
      audit.promptContractFailures++;
      throw error;
    }

    const choice = chooseEnergy(prompt, verified.attacker.active, types);
    if (!choice || !choice.card || !prompt.validate([choice.card])) {
      audit.choiceFailures++;
      throw new Error('Snap Trap public Energy selector returned no native-valid physical Card');
    }
    if (!prompt.cards.cards.includes(choice.card) ||
        !prompt.cards.energies.cards.includes(choice.card)) {
      audit.choiceFailures++;
      throw new Error('Snap Trap selector returned a card outside the exact public attached-Energy sublist');
    }

    const action = new ResolvePromptAction(prompt.id, [choice.card]);
    submitted.set(action, {
      store: liveStore,
      prompt,
      card: choice.card,
      choice,
      sourceSeat: verified.sourceSeat,
      attackerSeat: verified.attackerSeat,
      sourceCard: verified.sourceCard,
      sourceEffect: verified.sourceEffect,
      attackerActive: verified.attacker.active,
      attackerDiscard: verified.attacker.discard,
      attackerLostzone: verified.attacker.lostzone
    });
    audit.ownerChoices++;
    return action;
  }

  Object.defineProperty(SimpleTacticsAi.prototype, 'decodeNextAction', {
    ...aiDescriptor,
    value: decode
  });
  Object.defineProperty(Store.prototype, 'dispatch', {
    ...storeDescriptor,
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
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    Object.defineProperty(SimpleTacticsAi.prototype, 'decodeNextAction', aiDescriptor);
    Object.defineProperty(Store.prototype, 'dispatch', storeDescriptor);
  }
}

/**
 * Compose Agent30's exact-source marker with the owner-only response policy.
 * The marker is installed first, so the policy wraps its decoder and handles
 * only the WeakMap-stamped prompt. Every other prompt delegates through the
 * marker to the pre-existing fail-closed decoder.
 *
 * @template T
 * @param {()=>T} run
 * @param {object} [deps]
 * @returns {{result:T,audit:object}}
 */
function withSnapTrapOwnerPolicy(run, deps = {}) {
  const markerLayer = deps.markerLayer ?? withStunfiskSnapTrapPromptMarker;
  assert.equal(typeof markerLayer, 'function');
  const marked = markerLayer(getOriginForPrompt =>
    withOwnerSnapTrapPromptResolution(run, {
      ...deps,
      getOriginForPrompt
    }), deps.markerDeps);
  return {
    result: marked.result.result,
    audit: {
      version: VERSION,
      marker: marked.audit,
      ownerPolicy: marked.result.audit,
      competitiveGamesQualified: 0
    }
  };
}

/**
 * Install the marker and owner-only resolver inside every actual native
 * headless.runMatch call. This places the resolver after outer quarantine and
 * existing owner-policy wrappers while preserving their fallback behavior.
 *
 * @template T
 * @param {()=>T} next
 * @param {object} [deps]
 * @returns {{result:T,audit:object}}
 */
function withSnapTrapInsideNativeMatches(next, deps = {}) {
  assert.equal(typeof next, 'function');
  const headless = deps.headless ?? require('../headless.cjs');
  const oldRunMatch = headless.runMatch;
  assert.equal(typeof oldRunMatch, 'function');
  const matches = [];

  function wrappedRunMatch(request) {
    const label = request?.label ?? null;
    try {
      const outcome = withSnapTrapOwnerPolicy(
        () => oldRunMatch(request),
        deps.policyDeps ?? deps
      );
      matches.push({
        label,
        disposition: 'returned-unqualified',
        marker: outcome.audit.marker,
        ownerPolicy: outcome.audit.ownerPolicy,
        competitiveGamesQualified: 0
      });
      return outcome.result;
    } catch (error) {
      matches.push({
        label,
        disposition: 'engine-aborted-unqualified',
        marker: error?.stunfiskSnapTrapPromptMarkerAudit ?? null,
        ownerPolicy: error?.snapTrapOwnerPromptPolicyAudit ?? null,
        competitiveGamesQualified: 0
      });
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
        ownerOnlySnapTrapPromptPolicy: true,
        sourceIndependentBothSeats: true,
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
  verifySnapTrapPrompt,
  withOwnerSnapTrapPromptResolution,
  withSnapTrapOwnerPolicy,
  withSnapTrapInsideNativeMatches
};
