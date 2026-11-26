'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {
  canonicalJson,
  createInformationSetMcts
} = require('./agent5-information-set-mcts.cjs');
const {
  cloneActorSafeValue,
  createActorObservationWithHistory
} = require('../actor-history-projection.cjs');
const {
  EXPECTED_ENGINE_PIN,
  createKnownCapFreeActionEnumerator,
  assertKnownCapFreeAdapterAdmissionClear
} = require('../../evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');
const {
  buildNativeActionFrontier,
  actionSignature
} = require('../../evaluation/2026-11/agent36-native-action-frontier.cjs');
const nativePromptProjection =
  require('../../evaluation/2026-11/agent36-prompt-projection.cjs');
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

function observationSha256(value) {
  return crypto.createHash('sha256').update(canonicalJson(value)).digest('hex');
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
 * prompts are fixed same-Store subcalls, never MCTS decision nodes; engine/chance
 * prompts are resolved by a trusted host callback. Policy/value callbacks receive
 * only actor-relative views with per-seat decision history.
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
    'isAutomaticPrompt',
    'resolveAutomaticPrompt',
    'redeterminize',
    'terminalOutcomeProtocolId',
    'terminalOutcome',
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
  const promptResolutionMode = deps.promptResolutionMode ?? 'same-store-subcall';
  assert.equal(promptResolutionMode, 'same-store-subcall',
    'Competitive two-sided search must resolve player prompts on their registering Store, not as MCTS prompt nodes');
  if (promptResolutionMode === 'same-store-subcall') {
    assert.equal(typeof deps.resolvePlayerPrompt, 'function',
      'Same-Store prompt subcalls require a synchronous player prompt resolver');
    assert.ok(typeof deps.promptSubPolicyId === 'string' &&
      /v\d+$/.test(deps.promptSubPolicyId),
    'Same-Store prompt subcalls require a versioned prompt sub-policy ID');
  } else {
    assert.equal(typeof deps.projectPrompt, 'function');
  }
  assert.ok(typeof deps.rulesProfileId === 'string' && deps.rulesProfileId.length > 0,
    'Twinleaf rulesProfileId is required for reproducible state observations');
  if (deps.enumeratePromptChoices !== undefined) {
    assert.equal(typeof deps.enumeratePromptChoices, 'function');
  }
  assert.equal(typeof deps.isAutomaticPrompt, 'function');
  assert.equal(typeof deps.resolveAutomaticPrompt, 'function');
  assert.equal(typeof deps.redeterminize, 'function');
  assert.ok(typeof deps.terminalOutcomeProtocolId === 'string' &&
    /v\d+$/.test(deps.terminalOutcomeProtocolId),
  'Twinleaf terminal outcome protocol ID must be versioned');
  assert.equal(typeof deps.terminalOutcome, 'function');
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
  const maxPromptResolutions = options.maxPromptResolutions ?? 64;
  const requireCompleteHistory = options.requireCompleteHistory !== false;
  assert.ok(Number.isSafeInteger(maxPromptResolutions) &&
    maxPromptResolutions > 0 && maxPromptResolutions <= 256);

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
  const historyByState = new WeakMap();
  let latestHistoryMetadata = null;
  const nativePayloadByAction = new WeakMap();
  const promptChoicesByProjection = new Map();
  const counters = {
    nativeFrontiers: 0,
    promptFrontiers: 0,
    automaticPromptResolutions: 0,
    nativeTransitions: 0,
    promptTransitions: 0,
    playerPromptSubcalls: 0,
    promptEventsRecorded: 0,
    validatedNativeActions: 0,
    unsupportedNativeActions: 0,
    truncatedNativeFrontiers: 0
  };

  function freezeHistoryMetadata(input) {
    assert.ok(Array.isArray(input.historiesBySeat) && input.historiesBySeat.length === 2);
    assert.ok(Array.isArray(input.completeBySeat) && input.completeBySeat.length === 2 &&
      input.completeBySeat.every(value => typeof value === 'boolean'));
    assert.ok(Array.isArray(input.sourceBySeat) && input.sourceBySeat.length === 2 &&
      input.sourceBySeat.every(value => typeof value === 'string' && value.length > 0));
    const historiesBySeat = input.historiesBySeat.map(history => {
      assert.ok(Array.isArray(history));
      return Object.freeze(history.map(event =>
        deepFreeze(cloneActorSafeValue(event))));
    });
    return Object.freeze({
      historiesBySeat: Object.freeze(historiesBySeat),
      completeBySeat: Object.freeze(input.completeBySeat.slice()),
      sourceBySeat: Object.freeze(input.sourceBySeat.slice())
    });
  }

  function defaultHistoryMetadata() {
    return freezeHistoryMetadata({
      historiesBySeat: [[], []],
      completeBySeat: [false, false],
      sourceBySeat: ['unattested-root-prefix', 'unattested-root-prefix']
    });
  }

  function historyForState(state) {
    if (!historyByState.has(state)) {
      const metadata = defaultHistoryMetadata();
      historyByState.set(state, metadata);
      latestHistoryMetadata = metadata;
    }
    const metadata = historyByState.get(state);
    latestHistoryMetadata = metadata;
    return metadata;
  }

  function initializeHistory(rootState) {
    const prefix = deps.rootHistoryPrefixBySeat ?? [[], []];
    assert.ok(Array.isArray(prefix) && prefix.length === 2 &&
      prefix.every(Array.isArray),
    'Root own-decision history must provide one array per physical seat');
    const attestation = deps.rootHistoryAttestation ?? null;
    let completeBySeat = [false, false];
    let sourceBySeat = prefix.map(history => history.length > 0 ?
      'caller-provided-unattested-prefix' : 'unattested-root-prefix');
    if (attestation !== null) {
      assert.ok(attestation && typeof attestation === 'object' &&
        !Array.isArray(attestation));
      const attestationKeys = Reflect.ownKeys(attestation);
      assert.ok(attestationKeys.every(key => typeof key === 'string'),
        'Root history attestation cannot contain symbol keys');
      assert.deepEqual(attestationKeys.sort(), [
        'completeBySeat', 'rootStateDigest', 'schema', 'sourceId', 'verified'
      ].sort(), 'Root history attestation has an unexpected shape');
      assert.equal(attestation.schema, 'agent12-actor-history-attestation-v1');
      assert.equal(attestation.verified, true);
      assert.ok(typeof attestation.sourceId === 'string' &&
        attestation.sourceId.length > 0);
      assert.match(attestation.rootStateDigest, /^[a-f0-9]{64}$/);
      assert.ok(Array.isArray(attestation.completeBySeat) &&
        attestation.completeBySeat.length === 2 &&
        attestation.completeBySeat.every(value => typeof value === 'boolean'));
      completeBySeat = attestation.completeBySeat.slice();
      sourceBySeat = [attestation.sourceId, attestation.sourceId];
    }
    if (requireCompleteHistory) {
      assert.ok(completeBySeat.every(Boolean),
        'Complete perfect-recall history was required but root prefixes are unattested/incomplete');
    }
    const metadata = freezeHistoryMetadata({
      historiesBySeat: prefix,
      completeBySeat,
      sourceBySeat
    });
    historyByState.set(rootState, metadata);
    latestHistoryMetadata = metadata;
    return metadata;
  }

  function appendHistoryEvent(state, seat, event) {
    assert.ok(seat === 0 || seat === 1);
    const current = historyForState(state);
    const historiesBySeat = current.historiesBySeat.map(history => history.slice());
    historiesBySeat[seat].push(event);
    const next = freezeHistoryMetadata({
      historiesBySeat,
      completeBySeat: current.completeBySeat,
      sourceBySeat: current.sourceBySeat
    });
    historyByState.set(state, next);
    latestHistoryMetadata = next;
    return next;
  }

  function stripHistoryFields(actorView) {
    const base = cloneActorSafeValue(actorView);
    delete base.actorHistorySha256;
    delete base.actorVisibleHistory;
    delete base.actorOwnDecisionHistory;
    return base;
  }

  function historyOptionsForSeat(state, seat) {
    const metadata = historyForState(state);
    return {
      ownDecisionHistory: metadata.historiesBySeat[seat],
      historySource: metadata.sourceBySeat[seat],
      historyComplete: metadata.completeBySeat[seat],
      includeVisibleLogs: true,
      includeOwnDecisionHistory: true,
      requireComplete: requireCompleteHistory
    };
  }

  function transferMetadata(fromState, toState) {
    if (metadataByState?.has(fromState)) {
      assert.equal(refreshMetadata(fromState, toState), true,
        'Twinleaf transition lost the actor-private belief ledger');
    }
    const history = historyByState.get(fromState);
    if (history) {
      historyByState.set(toState, history);
      latestHistoryMetadata = history;
    }
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
    if (promptResolutionMode === 'same-store-subcall') return false;
    return unresolvedDecisionSeat(prompt, state) !== null;
  }

  function activeSeat(state) {
    const prompt = firstPendingPrompt(state);
    if (prompt) {
      assert.notEqual(promptResolutionMode, 'same-store-subcall',
        'Same-Store player prompts must be settled inside applyAction before search observes a state');
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

  function buildBaseActorView(state, seat, context) {
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
    return {
      ...base,
      ownTurnResources,
      ownerKnowledgeLedger: ownerLedger,
      rulesProfileId: deps.rulesProfileId,
      ...(typeof ownDecklistId === 'string' && ownDecklistId.length > 0 ?
        { ownDecklistId } : {})
    };
  }


  const buildActorView = createActorObservationWithHistory(
    buildBaseActorView,
    historyOptionsForSeat
  );
  function observe(state, seat, context) {
    assert.equal(activeSeat(state), seat,
      'Actor observation requested for a non-acting physical seat');
    const view = buildActorView(state, seat, context);
    const prompt = firstPendingPrompt(state);
    if (!prompt) return frozenActorView(view);
    assert.equal(promptResolutionMode, 'synthetic-search-node',
      'Unresolved native player prompts must be settled on their original Store before entering MCTS');
    assert.equal(unresolvedDecisionSeat(prompt, state), seat);
    const projectionResult = deps.projectPrompt(state, prompt, seat, view, context);
    assert.ok(projectionResult && typeof projectionResult === 'object' &&
      !Array.isArray(projectionResult),
    'Prompt projector must return an actor-visible object');
    assert.notEqual(projectionResult.hostOnly, true,
      'Host-only prompt reached the player-choice projection path');
    const projectedPrompt = projectionResult.promptProjection ??
      projectionResult;
    if (projectionResult.promptProjection &&
        projectionResult.choiceByToken instanceof Map) {
      const frozenProjection = frozenActorView(projectedPrompt);
      if (promptChoicesByProjection.size >= 1024) {
        promptChoicesByProjection.clear();
      }
      promptChoicesByProjection.set(canonicalJson(frozenProjection), {
        promptId: prompt.id,
        choiceByToken: projectionResult.choiceByToken,
        simulator: projectionResult.simulator ?? null
      });
      return frozenActorView({ ...view, pendingPrompt: frozenProjection });
    }
    return frozenActorView({ ...view,
      pendingPrompt: frozenActorView(projectedPrompt) });
  }

  function enumeratePromptActions(state, seat, context) {
    const prompt = firstPendingPrompt(state);
    assert.ok(prompt);
    assert.equal(unresolvedDecisionSeat(prompt, state), seat);
    const observation = observe(state, seat, context);
    const projectedPrompt = observation.pendingPrompt;
    const promptType = typeof projectedPrompt.type === 'string' ?
      projectedPrompt.type : (prompt.constructor?.name ?? 'prompt');
    const cachedProjection = promptChoicesByProjection.get(
      canonicalJson(projectedPrompt));
    let choices;
    if (deps.enumeratePromptChoices) {
      choices = deps.enumeratePromptChoices(projectedPrompt, observation, seat);
    } else if (cachedProjection && Array.isArray(projectedPrompt.choices)) {
      const selection = projectedPrompt.publicMetadata ?? {};
      if (selection.selectionType === 'card-combination') {
        const itemChoices = projectedPrompt.choices.filter(choice => choice.kind === 'card');
        const combinations = nativePromptProjection.enumerateCombinations(
          itemChoices,
          selection.minimumCount,
          selection.maximumCount,
          maxItems
        );
        choices = combinations.map(combo => {
          const tokens = combo.map(choice => choice.token);
          const result = combo.map(choice =>
            cachedProjection.choiceByToken.get(choice.token));
          const key = combo.length === 0 ? 'empty-selection'
            : combo.length === 1 ? tokens[0]
              : 'cards:' + canonicalJson(tokens);
          const label = combo.length === 0 ? 'Choose no items'
            : combo.map(choice => choice.label).join(' + ');
          return { key, label, result };
        });
        const cancel = projectedPrompt.choices.find(choice => choice.kind === 'cancel');
        if (cancel) {
          choices.push({
            key: cancel.token,
            label: cancel.label,
            result: cachedProjection.choiceByToken.get(cancel.token)
          });
        }
      } else {
        choices = projectedPrompt.choices.map(choice => ({
          key: choice.token,
          label: choice.label,
          result: cachedProjection.choiceByToken.get(choice.token)
        }));
      }
    } else {
      choices = null;
    }
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
        result: choice.result,
        choiceKey: choice.key,
        projection: cachedProjection ?? null,
        simulator: cachedProjection?.simulator ?? null
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

  function settlePendingPrompts(simulator, transitionRandom, context, actionContext, transitionActorSeat) {
    let resolved = 0;
    const bufferedPromptEvents = [];
    while (true) {
      const state = simulator.store.state;
      const prompt = firstPendingPrompt(state);
      if (!prompt) {
        assert.equal(typeof simulator.store.hasPrompts, 'function',
          'Pinned Twinleaf Store must expose hasPrompts()');
        assert.equal(simulator.store.hasPrompts(), false,
          'Same-Store prompt settlement left Store-level prompts pending');
        assert.ok(Array.isArray(simulator.store.promptItems),
          'Pinned Twinleaf Store must expose its prompt continuation queue');
        assert.equal(simulator.store.promptItems.length, 0,
          'Same-Store prompt settlement left continuation groups pending');

        const stableState = simulator.store.state;
        for (const event of bufferedPromptEvents) {
          const successorView = buildActorView(stableState, event.actorSeat, context);
          actionContext.recordPromptEvent({
            transitionActorSeat,
            actorSeat: event.actorSeat,
            promptType: event.promptType,
            actorObservationDigest: event.actorObservationDigest,
            promptProjectionDigest: event.promptProjectionDigest,
            selectedTokens: event.selectedTokens,
            promptPolicyId: event.promptPolicyId,
            nativeValidationSucceeded: true,
            stableSuccessorDigest: observationSha256(successorView)
          });
          counters.promptEventsRecorded += 1;
        }
        return resolved;
      }

      assert.ok(resolved < maxPromptResolutions,
        'Prompt settlement exceeded its total prompt-resolution safety bound');

      if (deps.isAutomaticPrompt(prompt, state, context)) {
        const result = deps.resolveAutomaticPrompt(prompt, transitionRandom, {
          simulator,
          state,
          native,
          context: context ?? null
        });
        assert.notEqual(result, undefined,
          'Automatic prompt resolver must return an explicit result (null is valid)');
        const previous = state;
        withRandom(transitionRandom, () => simulator.store.dispatch(
          new native.ResolvePromptAction(prompt.id, result)));
        transferMetadata(previous, simulator.store.state);
        resolved += 1;
        counters.automaticPromptResolutions += 1;
        continue;
      }

      const actorSeat = unresolvedDecisionSeat(prompt, state);
      assert.ok(actorSeat === 0 || actorSeat === 1,
        'Player-owned prompt must resolve to one physical seat');
      const actorView = frozenActorView(buildActorView(state, actorSeat, context));
      const promptRandom = () => actionContext.promptRandom();
      const previous = state;
      // Do not replace ambient Math.random around the whole resolver:
      // dispatchPromptChoice's isolated validation scope requires ambient RNG
      // to be restored. The prompt policy receives its independent RNG explicitly.
      const resolution = deps.resolvePlayerPrompt({
        store: simulator.store,
        state,
        prompt,
        actorSeat,
        actorView,
        native,
        random: promptRandom,
        context: context ?? null
      });
      assert.ok(resolution && typeof resolution === 'object' &&
        !Array.isArray(resolution),
      'Same-Store player prompt resolver must return a safe receipt object');
      assert.equal(typeof resolution.then, 'undefined',
        'MCTS prompt sub-policy must be synchronous');
      assert.equal(resolution.nativeValidationSucceeded, true,
        'Player prompt choice must pass isolated cloned-Store native validation');
      assert.equal(resolution.promptType, prompt.constructor?.name ?? 'prompt',
        'Prompt receipt type does not match the native pending prompt');
      assert.match(resolution.actorObservationDigest, /^[a-f0-9]{64}$/);
      assert.match(resolution.promptProjectionDigest, /^[a-f0-9]{64}$/);
      assert.ok(Array.isArray(resolution.selectedTokens) &&
        resolution.selectedTokens.length > 0 &&
        resolution.selectedTokens.every(token => typeof token === 'string'),
      'Validated player prompt receipt must contain opaque selected tokens');
      assert.equal(resolution.promptPolicyId, deps.promptSubPolicyId,
        'Prompt receipt policy ID does not match the configured fixed sub-policy');

      const after = simulator.store.state;
      const stillPending = after.prompts?.find(item =>
        item.id === prompt.id && item.result === undefined);
      assert.equal(stillPending, undefined,
        'Same-Store prompt subcall did not resolve the exact pending prompt');
      transferMetadata(previous, after);
      appendHistoryEvent(after, actorSeat, {
        schema: 'agent12-own-decision-history-event-v1',
        kind: 'player-prompt',
        actorSeat,
        actorObservation: resolution.actorObservation,
        actorObservationDigest: resolution.actorObservationDigest,
        actorHistorySha256: resolution.actorHistorySha256,
        promptProjection: resolution.promptProjection,
        promptProjectionDigest: resolution.promptProjectionDigest,
        selectedTokens: resolution.selectedTokens,
        promptPolicyId: resolution.promptPolicyId,
        nativeValidationSucceeded: true
      });
      bufferedPromptEvents.push({
        actorSeat,
        promptType: resolution.promptType,
        actorObservationDigest: resolution.actorObservationDigest,
        promptProjectionDigest: resolution.promptProjectionDigest,
        selectedTokens: resolution.selectedTokens.slice(),
        promptPolicyId: resolution.promptPolicyId
      });
      counters.playerPromptSubcalls += 1;
      resolved += 1;
    }
  }
  function applyAction(state, action, random, context, actionContext) {
    const payload = nativePayloadByAction.get(action);
    assert.ok(payload, 'Search selected an action outside the current frontier');
    assert.equal(payload.kind, 'native',
      'Competitive same-Store search exposes only native actions; player prompts are fixed sub-policy calls');
    const transitionActorSeat = activeSeat(state);
    const preDecisionActorView = buildActorView(state, transitionActorSeat, context);
    const preDecisionObservation = stripHistoryFields(preDecisionActorView);
    const preDecisionObservationDigest = observationSha256(preDecisionActorView);
    assert.ok(actionContext &&
      actionContext.actorSeat === transitionActorSeat &&
      typeof actionContext.promptRandom === 'function' &&
      typeof actionContext.recordPromptEvent === 'function',
    'MCTS core must provide the bound per-action rollout context');

    const simulator = withRandom(random, () =>
      new native.Simulator(state, simulatorOptions));
    assert.ok(simulator.store && typeof simulator.store.dispatch === 'function',
      'Twinleaf Simulator did not expose a dispatchable Store');
    transferMetadata(state, simulator.store.state);
    const before = snapshotState(simulator.store.state);

    withRandom(random, () => simulator.store.dispatch(payload.nativeAction));
    transferMetadata(state, simulator.store.state);
    appendHistoryEvent(simulator.store.state, transitionActorSeat, {
      schema: 'agent12-own-decision-history-event-v1',
      kind: 'native-action',
      actorSeat: transitionActorSeat,
      actorObservation: preDecisionObservation,
      actorObservationDigest: preDecisionObservationDigest,
      actionKey: action.key,
      publicAction: action.publicAction
    });
    counters.nativeTransitions += 1;

    settlePendingPrompts(
      simulator, random, context, actionContext, transitionActorSeat
    );
    const after = snapshotState(simulator.store.state);
    assert.notDeepEqual(after, before,
      'Selected Twinleaf action produced no state transition');
    assert.equal(simulator.store.hasPrompts(), false,
      'Twinleaf action returned while Store-level prompts remained');
    assert.equal(simulator.store.promptItems.length, 0,
      'Twinleaf action returned while continuation groups remained');
    assert.equal(isStable(simulator.store.state), true,
      'Twinleaf action left an unresolved prompt after same-Store settlement');
    return simulator.store.state;
  }
  function resetAudit() {
    for (const key of Object.keys(counters)) counters[key] = 0;
    promptChoicesByProjection.clear();
  }

  function audit() {
    return {
      schema: 'agent12-twinleaf-two-sided-search-adapter-v2',
      enginePin: deps.enginePin,
      rulesProfileId: deps.rulesProfileId,
      terminalOutcomeProtocolId: deps.terminalOutcomeProtocolId,
      promptEventSchemaId: 'agent5-actor-safe-prompt-event-v2',
      promptRandomProtocolId: 'per-rollout-independent-prompt-policy-rng-v1',
      maxPliesSemantics: 'stable-native-action-transitions-v1',
      maxPromptResolutions,
      candidateDecklistId: deps.ownDecklistId ?? null,
      candidateSeat: deps.ownDecklistSeat ?? null,
      uncappedEnumeratorSchema: enumerator.__agent3UncappedAdapter?.schema ?? null,
      maxNativeFrontier: options.maxNativeFrontier ?? 256,
      knowledgeLedgerProtocol: 'verified-two-seat-k0-k1-partial-ledgers-v1',
      promptResolutionMode,
      promptSubPolicyId: promptResolutionMode === 'same-store-subcall' ?
        deps.promptSubPolicyId : null,
      promptDecisionProtocol: 'same-store-player-prompt-subpolicy-plus-host-chance-resolution-v2',
      historyProtocolId: 'agent12-actor-visible-own-decision-history-v1',
      historyCompleteBySeat: (latestHistoryMetadata ?? defaultHistoryMetadata()).completeBySeat.slice(),
      historySourceBySeat: (latestHistoryMetadata ?? defaultHistoryMetadata()).sourceBySeat.slice(),
      historyEventCountsBySeat: (latestHistoryMetadata ?? defaultHistoryMetadata()).historiesBySeat.map(history => history.length),
      requireCompleteHistory,
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
    terminalOutcomeProtocolId: deps.terminalOutcomeProtocolId,
    terminalOutcome: state => deps.terminalOutcome(state),
    evaluateObservationValues: (observation, seat) =>
      deps.evaluateObservationValues(observation, seat),
    redeterminize: deps.redeterminize,
    isStable,
    actionPrior: deps.actionPrior ?
      (action, observation, seat) =>
        deps.actionPrior(action.publicAction, observation, seat) : undefined,
    resetAudit,
    clearPromptCache: () => promptChoicesByProjection.clear(),
    audit
  });
}


/**
 * Bind the generic search adapter to the repository's audited native prompt
 * projector. Card-effect provenance and source-card remapping remain explicit
 * host dependencies: the helper fails closed if a cloned source card cannot be
 * located in the cloned State.
 */
function createNativeTwinleafPromptCallbacks({
  native,
  mode = 'same-store-subcall',
  decidePrompt = null,
  promptSubPolicyId = null,
  withValidationRandom = null,
  simulatorOptions = {},
  provenanceForPrompt = () => null,
  mapSourceCard = null
} = {}) {
  assert.ok(native && typeof native.Simulator === 'function');
  assert.ok(['same-store-subcall', 'synthetic-search-node'].includes(mode));
  assert.equal(typeof provenanceForPrompt, 'function');
  if (mapSourceCard !== null) assert.equal(typeof mapSourceCard, 'function');
  if (mode === 'same-store-subcall') {
    assert.equal(typeof decidePrompt, 'function',
      'Same-Store prompt subcalls require a synchronous actor-only prompt policy');
    assert.ok(typeof promptSubPolicyId === 'string' && /v\d+$/.test(promptSubPolicyId),
      'Same-Store prompt subcalls require a versioned sub-policy ID');
    assert.equal(typeof withValidationRandom, 'function',
      'Same-Store prompt subcalls require an isolated cloned-Store validation RNG');
  }

  function cardsAtLocation(state, actorSeat, location) {
    const ownerSeat = location.ownerSeat === 'actor' ?
      actorSeat : 1 - actorSeat;
    const player = state.players[ownerSeat];
    if (!player) return [];
    const asCards = value => Array.isArray(value) ? value :
      (Array.isArray(value?.cards) ? value.cards : []);
    if (location.zone === 'hand') return asCards(player.hand);
    if (location.zone === 'deck') return asCards(player.deck);
    if (location.zone === 'discard') return asCards(player.discard);
    if (location.zone === 'lostZone') return asCards(player.lostzone);
    if (location.zone === 'stadium') return asCards(player.stadium);
    if (location.zone === 'supporter') return asCards(player.supporter);
    if (location.zone === 'prizes') {
      return asCards(player.prizes?.[location.slotIndex]);
    }
    if (['board', 'energy', 'tool'].includes(location.zone)) {
      const slot = location.boardZone === 'active' ?
        player.active : player.bench?.[location.slotIndex];
      if (!slot) return [];
      if (location.zone === 'board') return asCards(slot.cards);
      if (location.zone === 'energy') return asCards(slot.energies);
      return asCards(slot.tools);
    }
    return [];
  }

  function defaultMapSourceCard(state, clonedState, sourceCard, actorSeat) {
    const location = nativePromptProjection.locateCard(
      state, actorSeat, sourceCard);
    assert.ok(location && location.visible === true,
      'Prompt source card is not visible to its actor in the source State');
    const sourceCards = cardsAtLocation(state, actorSeat, location);
    const sourceIndex = sourceCards.indexOf(sourceCard);
    assert.ok(sourceIndex >= 0);
    const clonedCards = cardsAtLocation(clonedState, actorSeat, location);
    const clonedCard = clonedCards[sourceIndex];
    assert.ok(clonedCard, 'Prompt source card is absent at the cloned zone/index');
    const identityKeys = [
      'fullName', 'name', 'set', 'setNumber', 'number', 'cardId', 'id'
    ];
    const comparableKeys = identityKeys.filter(key =>
      sourceCard[key] !== undefined || clonedCard[key] !== undefined);
    assert.ok(comparableKeys.length > 0 &&
      comparableKeys.every(key => sourceCard[key] === clonedCard[key]),
    'Cloned prompt source card identity changed at the same actor-visible zone/index');
    return clonedCard;
  }

  function provenanceHookFor(prompt, provenance) {
    return {
      getPromptProvenance(candidate) {
        return candidate && candidate.id === prompt.id ? provenance : null;
      }
    };
  }

  function isAutomaticPrompt(prompt, state, context) {
    const seat = defaultPromptSeat(prompt, state);
    const provenance = provenanceForPrompt(
      state, prompt, seat === -1 ? null : seat, context);
    return Boolean(nativePromptProjection.hostOnlyPrompt(prompt, provenance));
  }

  function projectPrompt(state, prompt, actorSeat, actorView, context) {
    const simulator = new native.Simulator(state, simulatorOptions);
    assert.ok(simulator.store && typeof simulator.store.dispatch === 'function');
    const clonedState = simulator.store.state;
    const clonedPrompt = firstPendingPrompt(clonedState);
    assert.ok(clonedPrompt && clonedPrompt.id === prompt.id,
      'Prompt clone did not preserve the pending prompt identity');

    const provenance = provenanceForPrompt(state, prompt, actorSeat, context);
    let clonedProvenance = provenance;
    if (provenance?.sourceCard) {
      let sourceCard = provenance.sourceCard;
      if (!nativePromptProjection.locateCard(clonedState, actorSeat, sourceCard)) {
        sourceCard = (mapSourceCard ?? defaultMapSourceCard)(
          state, clonedState, sourceCard, actorSeat, context);
      }
      assert.ok(sourceCard &&
        nativePromptProjection.locateCard(clonedState, actorSeat, sourceCard),
      'Mapped card-effect source is not actor-visible in the cloned State');
      clonedProvenance = { ...provenance, sourceCard };
    }

    return {
      ...nativePromptProjection.projectPrompt({
        prompt: clonedPrompt,
        state: clonedState,
        actorSeat,
        native,
        store: simulator.store,
        provenanceHook: provenanceHookFor(clonedPrompt, clonedProvenance)
      }),
      simulator
    };
  }

  function resolvePlayerPrompt({
    store, state, prompt, actorSeat, actorView, random, context
  } = {}) {
    assert.ok(store && typeof store.dispatch === 'function');
    assert.equal(store.state, state,
      'Player prompt must be projected and resolved on the Store that registered it');
    assert.ok(actorSeat === 0 || actorSeat === 1);
    assert.equal(typeof random, 'function',
      'Player prompt policy requires its explicit independent random stream');
    const provenance = provenanceForPrompt(state, prompt, actorSeat, context);
    const projection = nativePromptProjection.projectPrompt({
      prompt,
      state,
      actorSeat,
      native,
      store,
      provenanceHook: provenanceHookFor(prompt, provenance)
    });
    assert.notEqual(projection.hostOnly, true,
      'Host-only prompts must use the physical-RNG resolver');
    assert.ok(projection.promptProjection &&
      projection.choiceByToken instanceof Map,
    'Player prompt projector must return typed choices bound to the live Store');

    const actorObservationDigest = observationSha256(actorView);
    const promptProjectionDigest = observationSha256(projection.promptProjection);
    const promptType = prompt.constructor?.name ?? 'prompt';
    // Scope global Math.random only around the prompt policy. Restore ambient
    // randomness before dispatchPromptChoice enters its isolated validation RNG.
    const decision = withRandom(random, () => decidePrompt({
      actorSeat,
      actorView,
      promptProjection: projection.promptProjection,
      random
    }));
    assert.ok(decision && typeof decision === 'object' && !Array.isArray(decision),
      'Prompt sub-policy must return a typed decision object');
    assert.equal(typeof decision.then, 'undefined',
      'Prompt sub-policy must be synchronous in the current MCTS core');
    const result = nativePromptProjection.dispatchPromptChoice({
      store,
      prompt,
      state,
      actorSeat,
      projection,
      decision,
      native,
      dispatch: true,
      withValidationRandom
    });
    const validationReceipt = result.validationReceipt;
    assert.ok(validationReceipt &&
      validationReceipt.promptDecodeValidated === true &&
      Array.isArray(validationReceipt.selectedTokens),
    'Player prompt choice must return a successful isolated native-validation receipt');
    return {
      ...result,
      promptSubPolicyId,
      promptPolicyId: promptSubPolicyId,
      promptType,
      actorObservation: stripHistoryFields(actorView),
      actorHistorySha256: actorView.actorHistorySha256 ?? null,
      promptProjection: cloneActorSafeValue(projection.promptProjection),
      actorObservationDigest,
      promptProjectionDigest,
      selectedTokens: validationReceipt.selectedTokens.slice(),
      nativeValidationSucceeded: true,
      decisionKind: decision.kind,
      selectedCount: decision.kind === 'select-choices' ?
        decision.tokens.length : 1
    };
  }
  function resolveAutomaticPrompt(prompt, random, hostContext = {}) {
    const { simulator, state, context } = hostContext;
    assert.ok(simulator?.store && state === simulator.store.state,
      'Automatic prompt resolver requires the current cloned Twinleaf Store');
    const seat = defaultPromptSeat(prompt, state);
    const provenance = provenanceForPrompt(
      state, prompt, seat === -1 ? null : seat, context);
    return nativePromptProjection.resolveHostOnlyPrompt({
      prompt,
      state,
      store: simulator.store,
      native,
      physicalRandom: random,
      provenanceHook: provenanceHookFor(prompt, provenance),
      dispatch: false
    }).decoded;
  }

  const common = {
    promptResolutionMode: mode,
    isAutomaticPrompt,
    resolveAutomaticPrompt
  };
  if (mode === 'same-store-subcall') {
    return Object.freeze({
      ...common,
      promptSubPolicyId,
      resolvePlayerPrompt
    });
  }
  return Object.freeze({
    ...common,
    projectPrompt
  });
}

function createTwinleafTwoSidedSearch(deps, options = {}) {
  const adapter = createTwinleafTwoSidedSearchAdapter(deps, options);
  assert.equal(adapter.audit().promptResolutionMode, 'same-store-subcall',
    'Two-sided competitive search must not promote player prompts to MCTS decision nodes');
  const {
    initializeHistory,
    resetAudit,
    clearPromptCache,
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
      initializeHistory(rootState);
      const result = search.search(rootState, rootSeat);
      const adapterAudit = audit();
      clearPromptCache();
      return {
        ...result,
        action: result.action.publicAction,
        audit: {
          ...result.audit,
          twinleafAdapter: adapterAudit
        }
      };
    }
  });
}

module.exports = {
  createTwinleafTwoSidedSearchAdapter,
  createNativeTwinleafPromptCallbacks,
  createTwinleafTwoSidedSearch
};
