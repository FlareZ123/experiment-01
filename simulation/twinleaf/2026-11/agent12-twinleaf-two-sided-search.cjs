'use strict';

const assert = require('node:assert/strict');
const {
  canonicalJson,
  createInformationSetMcts
} = require('./agent5-information-set-mcts.cjs');
const {
  EXPECTED_ENGINE_PIN,
  createKnownCapFreeActionEnumerator,
  assertKnownCapFreeAdapterAdmissionClear
} = require('../../evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');
const {
  buildNativeActionFrontier,
  actionSignature
} = require('../../evaluation/2026-11/agent36-native-action-frontier.cjs');
const {
  createStoreStateSnapshotter
} = require('../../evaluation/2026-11/agent49-native-fixture-game.cjs');

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function frozenActorView(value) {
  return deepFreeze(JSON.parse(canonicalJson(value)));
}

function firstPendingPrompt(state) {
  return (state.prompts ?? []).find(prompt => prompt.result === undefined) ?? null;
}

function defaultPromptSeat(prompt, state) {
  return state.players.findIndex(player => player.id === prompt.playerId);
}

function withRandom(random, callback) {
  const previous = Math.random;
  Math.random = random;
  try {
    return callback();
  } finally {
    Math.random = previous;
  }
}

/**
 * Deck-agnostic, two-sided Twinleaf search adapter.
 *
 * The search tree and action selection are shared across both physical seats.
 * Each seat's PUCT node maximizes that seat's own win probability. Player
 * prompts are search decisions; engine/chance prompts are resolved by a
 * trusted host callback. Policy/value callbacks receive only actor views.
 *
 * This adapter is deliberately fail-closed: the pinned uncapped action
 * enumerator and the existing native frontier projector must account for
 * every legal action. Unsupported or truncated frontiers are rejected.
 */
function createTwinleafTwoSidedSearchAdapter(deps, options = {}) {
  const required = [
    'native',
    'enginePin',
    'actorObservation',
    'projectPrompt',
    'enumeratePromptChoices',
    'isAutomaticPrompt',
    'resolveAutomaticPrompt',
    'redeterminize',
    'terminalValues',
    'evaluateObservationValues'
  ];
  for (const name of required) {
    assert.ok(deps[name] !== undefined && deps[name] !== null,
      'Missing Twinleaf two-sided search dependency: ' + name);
  }
  const native = deps.native;
  assert.equal(deps.enginePin, EXPECTED_ENGINE_PIN,
    'Two-sided search is reviewed only for the pinned Twinleaf revision');
  assert.ok(typeof native.Simulator === 'function' &&
    typeof native.ActionEnumerator === 'function' &&
    typeof native.ResolvePromptAction === 'function' &&
    native.GamePhase?.FINISHED !== undefined,
  'Pinned Twinleaf Simulator, ActionEnumerator, prompt action and terminal phase are required');
  assert.equal(typeof deps.actorObservation, 'function');
  assert.equal(typeof deps.projectPrompt, 'function');
  assert.ok(typeof deps.rulesProfileId === 'string' && deps.rulesProfileId.length > 0,
    'Twinleaf rulesProfileId is required for reproducible state observations');
  assert.equal(typeof deps.enumeratePromptChoices, 'function');
  assert.equal(typeof deps.isAutomaticPrompt, 'function');
  assert.equal(typeof deps.resolveAutomaticPrompt, 'function');
  assert.equal(typeof deps.redeterminize, 'function');
  assert.equal(typeof deps.terminalValues, 'function');
  assert.equal(typeof deps.evaluateObservationValues, 'function');

  const simulatorOptions = deps.simulatorOptions ?? {};
  if (deps.BotFlipMode && deps.BotShuffleMode) {
    assert.equal(simulatorOptions.flipMode, deps.BotFlipMode.RANDOM,
      'Search simulations must use random coin flips');
    assert.equal(simulatorOptions.shuffleMode, deps.BotShuffleMode.RANDOM,
      'Search simulations must use random deck shuffles');
  }

  const enumerator = deps.enumerator ??
    createKnownCapFreeActionEnumerator({ native, enginePin: deps.enginePin });
  const promptSeat = deps.promptSeat ?? defaultPromptSeat;
  assert.equal(typeof promptSeat, 'function');
  const maxItems = options.maxActionFrontierItems ?? 256;
  const maxAutomaticPromptResolutions = options.maxAutomaticPromptResolutions ?? 64;
  assert.ok(Number.isSafeInteger(maxAutomaticPromptResolutions) &&
    maxAutomaticPromptResolutions > 0 && maxAutomaticPromptResolutions <= 256);

  const metadataByState = deps.metadataByState ??
    deps.redeterminize.metadataByState ?? null;
  const refreshMetadata = deps.refreshMetadata ??
    deps.redeterminize.refreshMetadata ?? null;
  const knowledgeBySeat = deps.knowledgeBySeat ??
    deps.redeterminize.knowledgeBySeat ?? null;
  assert.ok(metadataByState && typeof metadataByState.has === 'function' &&
    typeof metadataByState.get === 'function',
  'Actor-relative determinization requires a per-State metadata WeakMap');
  assert.equal(typeof refreshMetadata, 'function',
    'Sampled-state metadata requires a refreshMetadata transition hook');
  assert.equal(typeof knowledgeBySeat, 'function',
    'Actor-relative determinization requires the same per-seat knowledge provider');
  if (deps.knowledgeBySeat && deps.redeterminize.knowledgeBySeat) {
    assert.equal(deps.knowledgeBySeat, deps.redeterminize.knowledgeBySeat,
      'Observation and determinization must share one knowledge provider');
  }

  const snapshotState = createStoreStateSnapshotter();
  const nativePayloadByAction = new WeakMap();
  const counters = {
    nativeFrontiers: 0,
    promptFrontiers: 0,
    automaticPromptResolutions: 0,
    nativeTransitions: 0,
    promptTransitions: 0,
    validatedNativeActions: 0,
    unsupportedNativeActions: 0,
    truncatedNativeFrontiers: 0
  };

  function transferMetadata(fromState, toState) {
    if (!metadataByState?.has(fromState)) return;
    assert.equal(refreshMetadata(fromState, toState), true,
      'Twinleaf transition lost the actor-private belief ledger');
  }

  function unresolvedDecisionSeat(prompt, state) {
    if (deps.isAutomaticPrompt(prompt, state)) return null;
    const seat = promptSeat(prompt, state);
    assert.ok(seat === 0 || seat === 1,
      'Unclassified non-automatic prompt has no physical player owner');
    return seat;
  }

  function isStable(state) {
    const prompt = firstPendingPrompt(state);
    if (!prompt) return true;
    return unresolvedDecisionSeat(prompt, state) !== null;
  }

  function activeSeat(state) {
    const prompt = firstPendingPrompt(state);
    if (prompt) {
      const seat = unresolvedDecisionSeat(prompt, state);
      assert.ok(seat === 0 || seat === 1,
        'Automatic prompts must be resolved before a search decision');
      return seat;
    }
    const seat = state.activePlayer;
    assert.ok(seat === 0 || seat === 1,
      'Twinleaf activePlayer must be a physical seat index');
    return seat;
  }

  function observe(state, seat, context) {
    assert.equal(activeSeat(state), seat,
      'Actor observation requested for a non-acting physical seat');
    const sampled = metadataByState.has(state);
    if (!sampled) {
      assert.equal(seat, context?.rootSeat,
        'The undeterminized State may be observed only by the root actor');
    }
    const ledgers = sampled ?
      [0, 1].map(physicalSeat => knowledgeBySeat(state, physicalSeat, context)) :
      [null, null];
    const ownerLedger = sampled ? ledgers[seat] :
      knowledgeBySeat(state, seat, context);
    for (const [physicalSeat, ledger] of (sampled ?
      ledgers.map((value, index) => [index, value]) : [[seat, ownerLedger]])) {
      assert.ok(ledger && ledger.verified === true &&
        ['K0', 'K1', 'PARTIAL'].includes(ledger.mode),
      'Actor observation requires verified K0/K1/PARTIAL ledgers for both sampled seats');
      assert.ok(ledger.ownerK1Snapshot === null ||
        (ledger.ownerK1Snapshot && typeof ledger.ownerK1Snapshot === 'object'),
      'Seat ' + physicalSeat + ' has an invalid owner K1 snapshot');
    }
    const base = deps.actorObservation(state, seat, {
      ownerK1Snapshot: ownerLedger.ownerK1Snapshot ?? null
    });
    assert.ok(base && typeof base === 'object' && !Array.isArray(base));
    assert.equal(base.actorSeat, seat,
      'Twinleaf actor observation belongs to a different physical seat');
    assert.deepEqual(base.ownerK1, ownerLedger.ownerK1Snapshot ?? null,
      'Actor observation omitted or changed its owner K1 snapshot');
    const ownTurnResources = {
      ...(base.ownTurnResources ?? {}),
      attacksThisTurn: state.players[seat].active?.attacksThisTurn ?? 0
    };
    const sampledMetadata = metadataByState.get(state);
    const ownDecklistId = sampledMetadata?.decklistIds?.[seat] ??
      (seat === deps.ownDecklistSeat ? deps.ownDecklistId : null);
    const view = {
      ...base,
      ownTurnResources,
      ownerKnowledgeLedger: ownerLedger,
      rulesProfileId: deps.rulesProfileId,
      ...(typeof ownDecklistId === 'string' && ownDecklistId.length > 0 ?
        { ownDecklistId } : {})
    };
    const prompt = firstPendingPrompt(state);
    if (!prompt) return frozenActorView(view);
    assert.equal(unresolvedDecisionSeat(prompt, state), seat);
    const projectedPrompt = deps.projectPrompt(state, prompt, seat, view, context);
    assert.ok(projectedPrompt && typeof projectedPrompt === 'object' &&
      !Array.isArray(projectedPrompt),
    'Prompt projector must return an actor-visible object');
    return frozenActorView({ ...view, pendingPrompt: projectedPrompt });
  }

  function enumeratePromptActions(state, seat, context) {
    const prompt = firstPendingPrompt(state);
    assert.ok(prompt);
    assert.equal(unresolvedDecisionSeat(prompt, state), seat);
    const observation = observe(state, seat, context);
    const projectedPrompt = observation.pendingPrompt;
    const promptType = typeof projectedPrompt.type === 'string' ?
      projectedPrompt.type : (prompt.constructor?.name ?? 'prompt');
    const choices = deps.enumeratePromptChoices(projectedPrompt, observation, seat);
    assert.ok(Array.isArray(choices) && choices.length > 0,
      'Actor-visible prompt frontier must contain at least one choice');
    const seen = new Set();
    return choices.map(choice => {
      assert.ok(choice && typeof choice.key === 'string' && choice.key.length > 0,
        'Prompt choice requires a stable actor-visible key');
      assert.equal(seen.has(choice.key), false,
        'Prompt choice frontier contains duplicate keys');
      seen.add(choice.key);
      const action = {
        kind: 'prompt',
        key: 'PROMPT:' + promptType + ':' + choice.key,
        publicAction: {
          kind: 'prompt',
          promptType,
          choiceKey: choice.key,
          ...(typeof choice.label === 'string' ? { label: choice.label } : {})
        }
      };
      nativePayloadByAction.set(action, {
        kind: 'prompt',
        promptId: prompt.id,
        result: choice.result
      });
      return action;
    });
  }

  function enumerateNativeActions(state, seat) {
    const result = buildNativeActionFrontier({
      state,
      actorSeat: seat,
      native,
      enumerator,
      maxItems
    });
    const admission = assertKnownCapFreeAdapterAdmissionClear({
      enumerator,
      enginePin: deps.enginePin,
      frontierDiagnostics: result.diagnostics
    });
    counters.nativeFrontiers += 1;
    counters.validatedNativeActions += admission.frontierDiagnostics.validatedCount;
    counters.unsupportedNativeActions += admission.frontierDiagnostics.unsupportedCount;
    if (admission.frontierDiagnostics.truncated ||
        admission.frontierDiagnostics.omittedCount > 0) {
      counters.truncatedNativeFrontiers += 1;
    }

    const itemsByToken = new Map(result.actionFrontier.items.map(item =>
      [item.token, item]));
    return [...result.actionByToken.entries()].map(([token, nativeAction]) => {
      const item = itemsByToken.get(token);
      assert.ok(item, 'Native action token lost its actor-visible projection');
      const key = 'NATIVE:' + actionSignature(nativeAction);
      const action = {
        kind: 'native',
        key,
        publicAction: item
      };
      nativePayloadByAction.set(action, { kind: 'native', nativeAction });
      return action;
    });
  }

  function enumerateActions(state, seat, context) {
    assert.equal(activeSeat(state), seat);
    const prompt = firstPendingPrompt(state);
    if (prompt) {
      counters.promptFrontiers += 1;
      return enumeratePromptActions(state, seat, context);
    }
    return enumerateNativeActions(state, seat, context);
  }

  function resolveAutomaticPrompts(simulator, random) {
    let resolved = 0;
    while (true) {
      const state = simulator.store.state;
      const prompt = firstPendingPrompt(state);
      if (!prompt || !deps.isAutomaticPrompt(prompt, state)) return resolved;
      assert.ok(resolved < maxAutomaticPromptResolutions,
        'Automatic prompt resolution exceeded its safety bound');
      const result = deps.resolveAutomaticPrompt(prompt, random);
      assert.notEqual(result, undefined,
        'Automatic prompt resolver must return an explicit result (null is valid)');
      const previous = state;
      withRandom(random, () => simulator.store.dispatch(
        new native.ResolvePromptAction(prompt.id, result)));
      transferMetadata(previous, simulator.store.state);
      resolved += 1;
      counters.automaticPromptResolutions += 1;
    }
  }

  function applyAction(state, action, random, context) {
    const payload = nativePayloadByAction.get(action);
    assert.ok(payload, 'Search selected an action outside the current frontier');
    const simulator = withRandom(random, () =>
      new native.Simulator(state, simulatorOptions));
    assert.ok(simulator.store && typeof simulator.store.dispatch === 'function',
      'Twinleaf Simulator did not expose a dispatchable Store');
    transferMetadata(state, simulator.store.state);
    const before = snapshotState(simulator.store.state);

    if (payload.kind === 'prompt') {
      const prompt = firstPendingPrompt(simulator.store.state);
      assert.ok(prompt && prompt.id === payload.promptId,
        'Selected prompt action is stale for the current native state');
      assert.equal(unresolvedDecisionSeat(prompt, simulator.store.state),
        activeSeat(state));
      withRandom(random, () => simulator.store.dispatch(
        new native.ResolvePromptAction(prompt.id, payload.result)));
      transferMetadata(state, simulator.store.state);
      counters.promptTransitions += 1;
    } else {
      withRandom(random, () => simulator.store.dispatch(payload.nativeAction));
      transferMetadata(state, simulator.store.state);
      counters.nativeTransitions += 1;
    }

    resolveAutomaticPrompts(simulator, random);
    const after = snapshotState(simulator.store.state);
    assert.notDeepEqual(after, before,
      'Selected Twinleaf action produced no state transition');
    assert.equal(isStable(simulator.store.state), true,
      'Twinleaf action left an unresolved automatic prompt');
    return simulator.store.state;
  }

  function resetAudit() {
    for (const key of Object.keys(counters)) counters[key] = 0;
  }

  function audit() {
    return {
      schema: 'agent12-twinleaf-two-sided-search-adapter-v1',
      enginePin: deps.enginePin,
      uncappedEnumeratorSchema: enumerator.__agent3UncappedAdapter?.schema ?? null,
      knowledgeLedgerProtocol: 'verified-two-seat-k0-k1-partial-ledgers-v1',
      promptDecisionProtocol: 'actor-view-prompt-actions-plus-host-chance-resolution-v1',
      ...counters
    };
  }

  return Object.freeze({
    observe,
    activeSeat,
    enumerateActions,
    actionKey: action => action.key,
    applyAction,
    isTerminal: state => deps.isTerminal ?
      deps.isTerminal(state) : state.phase === native.GamePhase.FINISHED,
    terminalValues: state => deps.terminalValues(state),
    evaluateObservationValues: (observation, seat) =>
      deps.evaluateObservationValues(observation, seat),
    redeterminize: deps.redeterminize,
    isStable,
    actionPrior: deps.actionPrior ?
      (action, observation, seat) =>
        deps.actionPrior(action.publicAction, observation, seat) : undefined,
    resetAudit,
    audit
  });
}

function createTwinleafTwoSidedSearch(deps, options = {}) {
  const adapter = createTwinleafTwoSidedSearchAdapter(deps, options);
  const {
    resetAudit,
    audit,
    ...searchDependencies
  } = adapter;
  const search = createInformationSetMcts({
    ...searchDependencies,
    valueMode: 'seat-win-probability',
    iterations: options.iterations ?? 128,
    maxPlies: options.maxPlies ?? 32,
    cPuct: options.cPuct ?? 1.4,
    seed: options.seed ?? 1,
    maxDecisionMs: options.maxDecisionMs ?? Infinity,
    ...(options.now ? { now: options.now } : {}),
    ...(options.opponentActionPolicy ? {
      opponentActionPolicy: options.opponentActionPolicy,
      opponentPolicyId: options.opponentPolicyId
    } : {})
  });
  return Object.freeze({
    search(rootState, rootSeat) {
      resetAudit();
      const result = search.search(rootState, rootSeat);
      return {
        ...result,
        action: result.action.publicAction,
        audit: {
          ...result.audit,
          twinleafAdapter: audit()
        }
      };
    }
  });
}

module.exports = {
  createTwinleafTwoSidedSearchAdapter,
  createTwinleafTwoSidedSearch
};
