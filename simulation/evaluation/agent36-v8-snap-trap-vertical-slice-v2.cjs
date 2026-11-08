'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const v1 = require('./agent36-v8-snap-trap-vertical-slice-v1.cjs');

const VERSION = 'agent36-v8-snap-trap-vertical-slice-v2';
const ROOT = path.resolve(__dirname, '../..');
const REGISTRATION_PATH =
  'results/aichi-2026/registrations/agent36-v8-snap-trap-vertical-slice-v2-20261108.json';
const V1_REGISTRATION_PATH =
  'results/aichi-2026/registrations/agent36-v8-snap-trap-vertical-slice-v1-20261108.json';
const V1_RUNNER_PATH =
  'simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v1.cjs';
const V2_RUNNER_PATH =
  'simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v2.cjs';
const SOURCE_V8_REGISTRATION_PATH =
  'results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json';
const SOURCE_V10B_REGISTRATION_PATH =
  'results/aichi-2026/registrations/agent36-issue25-common-v10b-paired-fresh-aba-260root-20261107.json';
const ROOT_LIMIT = 260;
const KNOWN_PROMPT_TRIAL_ID = '3:312:B:champion-reference';
const REGISTRATION = JSON.parse(fs.readFileSync(
  path.resolve(ROOT, REGISTRATION_PATH), 'utf8'
));

/** @param {string} relativePath @returns {string} Git blob SHA-1. */
function gitBlobSha(relativePath) {
  const bytes = fs.readFileSync(path.resolve(ROOT, relativePath));
  return createHash('sha1')
    .update('blob ' + bytes.length + '\0')
    .update(bytes)
    .digest('hex');
}

/** Validate the frozen v2 frame, source seeds and exact v1 predecessor. */
function assertRegistrationProvenance() {
  assert.equal(REGISTRATION.schema, VERSION);
  assert.equal(REGISTRATION.status, 'FROZEN_BEFORE_EXECUTION');
  assert.equal(REGISTRATION.maxNativeRootActionsPerArm, ROOT_LIMIT);
  assert.equal(REGISTRATION.trialCount, 4);
  assert.deepEqual(REGISTRATION.sourceOriginalRanks, [3]);
  assert.deepEqual(REGISTRATION.contendingPrintedSixties, [
    'champion-reference'
  ]);
  assert.equal(REGISTRATION.predecessor.registrationPath, V1_REGISTRATION_PATH);
  assert.equal(REGISTRATION.predecessor.runnerPath, V1_RUNNER_PATH);
  assert.equal(
    gitBlobSha(V1_REGISTRATION_PATH),
    REGISTRATION.predecessor.registrationGitBlobSha
  );
  assert.equal(
    gitBlobSha(V1_RUNNER_PATH),
    REGISTRATION.predecessor.runnerGitBlobSha
  );
  assert.equal(REGISTRATION.predecessor.workflowRunId, 42436917676);
  assert.equal(REGISTRATION.predecessor.artifactId, 13600271050);
  assert.equal(REGISTRATION.predecessor.runCommit,
    '298be4937403cd755f84cfabae0a797ef7956299');
  const sourceV8 = JSON.parse(fs.readFileSync(
    path.resolve(ROOT, SOURCE_V8_REGISTRATION_PATH), 'utf8'
  ));
  const sourceV10b = JSON.parse(fs.readFileSync(
    path.resolve(ROOT, SOURCE_V10B_REGISTRATION_PATH), 'utf8'
  ));
  assert.equal(
    gitBlobSha(SOURCE_V8_REGISTRATION_PATH),
    REGISTRATION.seedProvenance.v8.sourceRegistrationGitBlobSha
  );
  assert.equal(
    gitBlobSha(SOURCE_V10B_REGISTRATION_PATH),
    REGISTRATION.seedProvenance.v10b.sourceRegistrationGitBlobSha
  );
  assert.equal(
    sourceV8.trials.find(trial =>
      trial.id === REGISTRATION.seedProvenance.v8.sourceTrialId
    )?.seed,
    REGISTRATION.seedProvenance.v8.seed
  );
  assert.equal(
    sourceV10b.trials.find(trial =>
      trial.id === REGISTRATION.seedProvenance.v10b.sourceTrialId
    )?.seed,
    REGISTRATION.seedProvenance.v10b.seed
  );
  assert.deepEqual(v1.trials(), REGISTRATION.trials);
}

/** @param {object} row @param {object[]} registered @returns {string|null} */
function rowTrialId(row, registered) {
  return row.trial?.id ?? row.id ??
    registered.find(trial =>
      typeof row.label === 'string' && row.label.endsWith(trial.id)
    )?.id ?? null;
}

/** @param {object} row @returns {object[]|null} */
function rootLedgerOf(row) {
  return [
    row.rootActionLedger,
    row.nativePublicRootArchive?.rootActionLedger,
    row.nativeAbortEvidence?.rootActionLedger,
    row.nativeAbortProvenance?.rootActionLedger
  ].find(Array.isArray) ?? null;
}

/** @param {object} row @returns {object|null} */
function nativeAbortSummary(row) {
  const abort = row.nativeAbortEvidence ?? row.nativeAbortProvenance ??
    row.error?.nativeAbortEvidence ?? null;
  if (!abort) return null;
  const pendingPrompt = abort.pendingPrompt ?? null;
  return {
    failureStage: abort.failureStage ?? null,
    actionOrdinal: abort.actionOrdinal ?? null,
    actionName: abort.actionName ?? abort.actionType ?? null,
    actingSeat: abort.actingSeat ?? abort.seat ?? null,
    turnBefore: abort.turnBefore ?? null,
    phaseBefore: abort.phaseBefore ?? null,
    pendingPrompt: pendingPrompt ? {
      id: pendingPrompt.id ?? null,
      promptType: pendingPrompt.promptType ??
        pendingPrompt.constructor?.name ?? null,
      message: pendingPrompt.message ?? null
    } : null,
    errorMessage: abort.errorMessage ?? abort.message ??
      row.error?.message ?? null,
    redactedMessageDigest: abort.redactedMessageDigest ?? null
  };
}

/**
 * Exclude mechanical WaitPrompt/null prompt resolutions from meaningful
 * opponent and source decisions. Retain mechanical roots for audit.
 * @param {string} trialId
 * @param {object} join
 * @param {object[]} rootActionEvents
 * @param {object} row
 * @param {object} summary
 * @param {object|null} matchAudit
 * @returns {object}
 */
function buildPostPromptSequence(
  trialId, join, rootActionEvents, row, summary, matchAudit
) {
  const promptOrdinal = join.rootActionOrdinal;
  const events = rootActionEvents.filter(event =>
    event.trialId === trialId
  ).sort((a, b) => a.actionOrdinal - b.actionOrdinal);
  const later = Number.isSafeInteger(promptOrdinal) ?
    events.filter(event => event.actionOrdinal > promptOrdinal) : [];
  const attackerSeat = join.attackerSeat;
  const sourceSeat = join.sourceSeat;
  const isPass = action => [
    'PassTurnAction',
    'WaitForOpponentAction',
    'WaitPromptAction'
  ].includes(action);
  const evidence = matchAudit?.ownerPromptEvidence ?? {};
  const promptById = new Map(
    (evidence.promptRecords ?? []).map(record => [
      String(record.promptIdAfterStore ?? record.pendingNativePromptId),
      record
    ])
  );
  const responseKey = (promptId, actionOrdinal, actingSeat) =>
    `${String(promptId)}:${String(actionOrdinal)}:${String(actingSeat)}`;
  const responseByAction = new Map(
    (evidence.responseRecords ?? []).map(record => [
      responseKey(record.promptId, record.actionOrdinal, record.actingSeat),
      record
    ])
  );
  const responseForEvent = event => responseByAction.get(
    responseKey(event.promptId, event.actionOrdinal, event.seat)
  ) ?? null;
  const classifyRoot = event => {
    if (isPass(event.action)) return 'mechanical';
    if (event.action !== 'ResolvePromptAction') return 'meaningful';
    const prompt = promptById.get(String(event.promptId));
    const response = responseForEvent(event);
    if (!prompt || !response) return 'unclassified';
    const exactSettlementReceipt =
      prompt.sameRootStore === true &&
      prompt.ownerSeat === event.seat &&
      response.samePromptId === true &&
      String(response.actionPromptId) === String(event.promptId) &&
      response.sameRootStore === true &&
      response.rootStoreMatchesAtActionCallback === true &&
      response.nativeValidateAccepted === true &&
      response.actionType === 'ResolvePromptAction' &&
      response.actionOrdinal === event.actionOrdinal &&
      response.actingSeat === event.seat &&
      response.responseKind === event.responseKind &&
      response.dispatchReturnedWithoutThrow === true &&
      response.promptResultDefined === true &&
      response.promptResultMatches === true &&
      response.promptItemFoundBeforeDispatch === true &&
      response.promptItemRemovedAfterDispatch === true;
    if (!exactSettlementReceipt) return 'unclassified';
    if (event.responseKind === 'undefined') return 'unclassified';
    if (prompt.promptType === 'WaitPrompt') {
      return event.responseKind === 'null' ? 'mechanical' : 'unclassified';
    }
    return 'meaningful';
  };
  const classifications = new Map(later.map(event => [
    event, classifyRoot(event)
  ]));
  const mechanicalRoots = later.filter(event =>
    classifications.get(event) === 'mechanical'
  ).map(event => {
    const prompt = promptById.get(String(event.promptId));
    const response = responseForEvent(event);
    return {
      actionOrdinal: event.actionOrdinal,
      seat: event.seat,
      action: event.action,
      promptId: event.promptId,
      promptType: prompt?.promptType ?? null,
      promptMessage: prompt?.message ?? null,
      responseKind: event.responseKind,
      promptResultDefined: response?.promptResultDefined ?? null,
      promptItemRemovedAfterDispatch:
        response?.promptItemRemovedAfterDispatch ?? null
    };
  });
  const unclassifiedPromptRoots = later.filter(event =>
    classifications.get(event) === 'unclassified'
  ).map(event => {
    const prompt = promptById.get(String(event.promptId));
    const response = responseForEvent(event);
    const reason = !prompt ? 'unknown-prompt-id' :
      !response ? 'missing-exact-response-receipt' :
        response.dispatchReturnedWithoutThrow !== true ?
          'dispatch-not-confirmed' :
          response.promptResultDefined !== true ?
            'prompt-result-undefined' :
            response.promptResultMatches !== true ?
              'prompt-result-mismatch' :
              response.promptItemFoundBeforeDispatch !== true ?
                'prompt-item-missing-before-dispatch' :
                response.promptItemRemovedAfterDispatch !== true ?
                  'prompt-item-not-removed' :
                  event.responseKind === 'undefined' ?
                    'undefined-response' : 'response-contract-mismatch';
    return {
      actionOrdinal: event.actionOrdinal,
      seat: event.seat,
      action: event.action,
      promptId: event.promptId,
      promptType: prompt?.promptType ?? null,
      responseKind: event.responseKind,
      reason
    };
  });
  const meaningful = later.filter(event =>
    classifications.get(event) === 'meaningful'
  );
  const nextOpponentRoot = later.find(event =>
    event.seat === attackerSeat
  ) ?? null;
  const nextOpponentMeaningfulRoot = meaningful.find(event =>
    event.seat === attackerSeat
  ) ?? null;
  const opponentBarrier = nextOpponentMeaningfulRoot?.actionOrdinal ??
    promptOrdinal;
  const afterOpponent = later.filter(event =>
    event.actionOrdinal > opponentBarrier
  );
  const nextSourceRoot = afterOpponent.find(event =>
    event.seat === sourceSeat
  ) ?? null;
  const nextSourceMeaningfulRoot = afterOpponent.find(event =>
    event.seat === sourceSeat &&
    classifications.get(event) === 'meaningful'
  ) ?? null;
  const ledger = rootLedgerOf(row);
  const promptRootLedgerEntry = Array.isArray(ledger) &&
    Number.isSafeInteger(promptOrdinal) ?
    ledger.find(entry => entry.actionOrdinal === promptOrdinal) ?? null : null;
  const nextOwnerPrompt = evidence.nextOwnerPrompt ?? null;
  const nextOwnerPromptId = nextOwnerPrompt?.promptIdAfterStore ??
    nextOwnerPrompt?.pendingNativePromptId;
  const nextOwnerPromptEvent = nextOwnerPromptId === undefined ? null :
    [...later].reverse().find(event =>
      event.action === 'ResolvePromptAction' &&
      String(event.promptId) === String(nextOwnerPromptId) &&
      responseForEvent(event) !== null
    ) ?? null;
  const nextOwnerResponse = nextOwnerPromptEvent ?
    responseForEvent(nextOwnerPromptEvent) : null;
  const nextOwnerPromptResponseSettled = !nextOwnerPrompt || Boolean(
    nextOwnerPromptEvent &&
    nextOwnerResponse &&
    classifications.get(nextOwnerPromptEvent) !== 'unclassified'
  );
  const capturedPostSnapTrapPrompts =
    Array.isArray(evidence.postSnapTrapPrompts) ?
      evidence.postSnapTrapPrompts :
      nextOwnerPrompt ? [nextOwnerPrompt] : [];
  const postSnapTrapPromptSettlements =
    capturedPostSnapTrapPrompts.map(promptRecord => {
      const promptId = promptRecord.promptIdAfterStore ??
        promptRecord.pendingNativePromptId;
      const responseEvent = promptId === undefined ? null :
        [...later].reverse().find(event =>
          event.action === 'ResolvePromptAction' &&
          String(event.promptId) === String(promptId) &&
          responseForEvent(event) !== null
        ) ?? null;
      const classification = responseEvent ?
        classifications.get(responseEvent) : null;
      return {
        promptId: promptId ?? null,
        promptType: promptRecord.promptType ?? null,
        actionOrdinal: responseEvent?.actionOrdinal ?? null,
        actingSeat: responseEvent?.seat ?? null,
        responseKind: responseEvent?.responseKind ?? null,
        settled: Boolean(
          responseEvent && classification !== 'unclassified'
        )
      };
    });
  const allPostSnapTrapPromptsSettled =
    postSnapTrapPromptSettlements.every(item => item.settled);
  const promptEvidenceComplete =
    unclassifiedPromptRoots.length === 0 &&
    nextOwnerPromptResponseSettled &&
    allPostSnapTrapPromptsSettled;
  return {
    promptResponseActionOrdinal: promptOrdinal,
    promptResponseActingSeat: sourceSeat,
    promptRootLedgerEntry,
    nextOpponentRoot,
    nextOpponentMeaningfulRoot,
    nextSourceRootAfterOpponent: nextSourceRoot,
    nextSourceMeaningfulRootAfterOpponent: nextSourceMeaningfulRoot,
    mechanicalRootsAfterPrompt: mechanicalRoots,
    unclassifiedPromptRoots,
    promptEvidenceComplete,
    nextOwnerPrompt,
    nextOwnerPromptResponse: nextOwnerResponse,
    nextOwnerPromptResponseSettled,
    postSnapTrapPromptSettlements,
    allPostSnapTrapPromptsSettled,
    nextOwnerPromptType: nextOwnerPrompt?.promptType ?? null,
    nextOwnerPromptMessage: nextOwnerPrompt?.message ?? null,
    opponentDecisionObserved: Boolean(nextOpponentMeaningfulRoot),
    sourceContinuationObserved: Boolean(nextSourceMeaningfulRoot),
    continuationGatePassed: Boolean(
      nextOpponentMeaningfulRoot &&
      nextSourceMeaningfulRoot &&
      promptEvidenceComplete
    ),
    endpoint: summary.nativeOutcome,
    actionCount: summary.actionCount,
    finished: summary.finished,
    rootActionCount: summary.rootActionCount,
    rootActionLedgerLength: summary.rootActionLedgerLength,
    nativeAbortEvidence: summary.nativeAbortEvidence,
    declaredPaperGameQualified: false
  };
}

/**
 * Require exact settlement in both observed source-seat orientations.
 * @param {object[]} summaries
 * @param {object} selectedDiagnostic
 * @returns {object}
 */
function buildExecutionGate(summaries, selectedDiagnostic) {
  const known = summaries.find(summary =>
    summary.id === KNOWN_PROMPT_TRIAL_ID
  ) ?? null;
  const join = known?.promptJoin ?? null;
  const sequence = known?.postPromptSequence ?? null;
  const allRegisteredTrialsReturned =
    selectedDiagnostic?.allRegisteredAttemptsReturned === true &&
    summaries.length === 4 &&
    summaries.every(summary => typeof summary.id === 'string');
  const bothSourceSeatOrientationsAttempted =
    new Set(summaries.map(summary => summary.sourceSeat)).size === 2;
  const exactPromptSettlements = summaries.filter(summary =>
    summary.promptJoin?.exactPromptIdJoin === true &&
    summary.promptJoin?.exactRootStoreIdentity === true &&
    summary.promptJoin?.quarantineActive === true &&
    summary.promptJoin?.ownerObservationCaptured === true &&
    summary.promptJoin?.responseShapeAccepted === true &&
    summary.promptJoin?.exactPhysicalSettlement === true &&
    summary.promptJoin?.sourceSeatMatchesRegisteredSeat === true
  );
  const bothSourceSeatPromptResolutionsObserved = new Set(
    exactPromptSettlements.map(summary => summary.sourceSeat)
  ).size === 2;
  const knownPromptResolved = Boolean(
    join?.exactPromptIdJoin &&
    join?.exactRootStoreIdentity &&
    join?.quarantineActive &&
    join?.ownerObservationCaptured &&
    join?.responseShapeAccepted &&
    join?.exactPhysicalSettlement &&
    join?.sourceSeatMatchesRegisteredSeat
  );
  const postPromptPromptEvidenceComplete =
    sequence?.promptEvidenceComplete === true;
  const meaningfulOpponentAndSourceContinuation =
    sequence?.continuationGatePassed === true &&
    postPromptPromptEvidenceComplete;
  const endpointExplicitlyClassified = [
    'native-terminal-unqualified',
    'action-cap',
    'engine-error'
  ].includes(known?.nativeOutcome);
  const passed = Boolean(
    allRegisteredTrialsReturned &&
    bothSourceSeatOrientationsAttempted &&
    knownPromptResolved &&
    bothSourceSeatPromptResolutionsObserved &&
    meaningfulOpponentAndSourceContinuation &&
    endpointExplicitlyClassified
  );
  return {
    passed,
    allRegisteredTrialsReturned,
    bothSourceSeatOrientationsAttempted,
    knownPromptResolved,
    bothSourceSeatPromptResolutionsObserved,
    meaningfulOpponentAndSourceContinuation,
    postPromptPromptEvidenceComplete,
    nextOwnerPromptResponseSettled:
      sequence?.nextOwnerPromptResponseSettled ?? false,
    allPostSnapTrapPromptsSettled:
      sequence?.allPostSnapTrapPromptsSettled ?? false,
    postSnapTrapPromptSettlements:
      sequence?.postSnapTrapPromptSettlements ?? [],
    endpointExplicitlyClassified,
    knownPromptTrialId: KNOWN_PROMPT_TRIAL_ID,
    knownPromptTrialNativeOutcome: known?.nativeOutcome ?? null,
    knownPromptId: join?.promptId ?? null,
    knownPromptRootActionOrdinal: join?.rootActionOrdinal ?? null,
    knownPromptSourceSeat: join?.sourceSeat ?? null,
    registeredSourceSeat: known?.sourceSeat ?? null,
    knownPromptSourceSeatMatchesRegistration:
      join?.sourceSeatMatchesRegisteredSeat ?? false,
    nextOwnerPromptCaptured: Boolean(join?.nextOwnerPrompt),
    nextOwnerPromptType: join?.nextOwnerPrompt?.promptType ?? null,
    nextOwnerPromptMessage: join?.nextOwnerPrompt?.message ?? null,
    mechanicalRootCountAfterPrompt:
      sequence?.mechanicalRootsAfterPrompt?.length ?? 0,
    mechanicalRootsAfterPrompt:
      sequence?.mechanicalRootsAfterPrompt ?? [],
    unclassifiedPromptRootCount:
      sequence?.unclassifiedPromptRoots?.length ?? 0,
    unclassifiedPromptRoots:
      sequence?.unclassifiedPromptRoots ?? [],
    sourceSeatsWithExactPromptSettlement:
      [...new Set(exactPromptSettlements.map(summary => summary.sourceSeat))]
        .sort(),
    competitiveGamesQualified: 0,
    paperLegalityCertified: false
  };
}

/** @param {object} output @returns {object} Compact CI summary. */
function buildDiagnosticSummary(output) {
  const diagnostic = output.diagnostic;
  const known = diagnostic.actualAttemptRows.find(summary =>
    summary.id === KNOWN_PROMPT_TRIAL_ID
  ) ?? null;
  const promptOrdinal = known?.promptJoin?.rootActionOrdinal ?? null;
  const knownEvents = diagnostic.rootActionEvents.filter(event =>
    event.trialId === KNOWN_PROMPT_TRIAL_ID &&
    Number.isSafeInteger(promptOrdinal) &&
    event.actionOrdinal >= promptOrdinal - 3 &&
    event.actionOrdinal <= promptOrdinal + 14
  );
  const observationHash = observation => observation ?
    createHash('sha256').update(JSON.stringify(observation)).digest('hex') :
    null;
  const attempts = diagnostic.actualAttemptRows.map(summary => ({
    id: summary.id,
    sourceSeat: summary.sourceSeat,
    candidateSeat: summary.candidateSeat,
    seed: summary.seed,
    nativeOutcome: summary.nativeOutcome,
    actionCount: summary.actionCount,
    finished: summary.finished,
    rootActionCount: summary.rootActionCount,
    rootActionLedgerLength: summary.rootActionLedgerLength,
    promptJoin: {
      promptId: summary.promptJoin?.promptId ?? null,
      sourceSeat: summary.promptJoin?.sourceSeat ?? null,
      sourceSeatMatchesRegisteredSeat:
        summary.promptJoin?.sourceSeatMatchesRegisteredSeat ?? false,
      selectedEnergyPrinting:
        summary.promptJoin?.selectedEnergyPrinting ?? null,
      exactPromptIdJoin: summary.promptJoin?.exactPromptIdJoin ?? false,
      exactRootStoreIdentity:
        summary.promptJoin?.exactRootStoreIdentity ?? false,
      quarantineActive: summary.promptJoin?.quarantineActive ?? false,
      ownerObservationCaptured:
        summary.promptJoin?.ownerObservationCaptured ?? false,
      responseShapeAccepted:
        summary.promptJoin?.responseShapeAccepted ?? false,
      exactPhysicalSettlement:
        summary.promptJoin?.exactPhysicalSettlement ?? false,
      rootActionOrdinal: summary.promptJoin?.rootActionOrdinal ?? null,
      nextOwnerPromptType:
        summary.promptJoin?.nextOwnerPrompt?.promptType ?? null,
      nextOwnerPromptMessage:
        summary.promptJoin?.nextOwnerPrompt?.message ?? null
    },
    postPromptSequence: {
      nextOpponentMeaningfulRoot:
        summary.postPromptSequence?.nextOpponentMeaningfulRoot ?? null,
      nextSourceMeaningfulRootAfterOpponent:
        summary.postPromptSequence?.nextSourceMeaningfulRootAfterOpponent ?? null,
      mechanicalRootsAfterPrompt:
        summary.postPromptSequence?.mechanicalRootsAfterPrompt ?? [],
      continuationGatePassed:
        summary.postPromptSequence?.continuationGatePassed ?? false
    },
    nativeError: summary.nativeError ?? null,
    nativeAbortEvidence: summary.nativeAbortEvidence ?? null
  }));
  const nativeMatchAttempts =
    diagnostic.nativeMatchIntegrationAudit.nativeMatchAttempts.map(attempt => {
      const evidence = attempt.ownerPromptEvidence ?? {};
      const promptSummary = prompt => prompt ? {
        promptIdAfterStore: prompt.promptIdAfterStore ?? null,
        ownerSeat: prompt.ownerSeat ?? null,
        promptType: prompt.promptType ?? null,
        message: prompt.message ?? null,
        sameRootStore: prompt.sameRootStore ?? false,
        options: prompt.options ?? null,
        filter: prompt.filter ?? null,
        ownerObservationSha256:
          observationHash(prompt.ownerObservationAtPromptCreation)
      } : null;
      return {
        label: attempt.label,
        status: attempt.status,
        rootStoreCaptureCount: attempt.rootStoreCaptureCount,
        markerPromptCount:
          attempt.marker?.exactSourcePromptsStamped?.length ?? 0,
        ownerChoiceCount: attempt.ownerPolicy?.choices?.length ?? 0,
        ownerChoices: (attempt.ownerPolicy?.choices ?? []).map(choice => ({
          promptId: choice.promptId ?? null,
          sourceSeat: choice.sourceSeat ?? null,
          energyPrinting: choice.energyPrinting ?? null,
          moveCardsEffectReceiptCount:
            choice.moveCardsEffectReceiptCount ?? null,
          exactlyOneMoveCardsEffect:
            choice.exactlyOneMoveCardsEffect ?? false,
          exactRootStoreJoin: choice.exactRootStoreJoin ?? false,
          exactPromptCardIdentityJoin:
            choice.exactPromptCardIdentityJoin ?? false,
          nativeValidateAccepted: choice.nativeValidateAccepted ?? false,
          noOtherPublicCardMoved: choice.noOtherPublicCardMoved ?? false,
          physicalZoneBefore: choice.physicalZoneBefore ?? null,
          physicalZoneAfter: choice.physicalZoneAfter ?? null,
          physicalZoneSettled: choice.physicalZoneSettled ?? false
        })),
        error: attempt.error ? {
          name: attempt.error.name ?? null,
          code: attempt.error.code ?? null,
          message: attempt.error.message ?? String(attempt.error)
        } : null,
        snapTrapPrompt: promptSummary(evidence.snapTrapPrompt),
        nextOwnerPrompt: promptSummary(evidence.nextOwnerPrompt),
        responseRecords: (evidence.responseRecords ?? []).map(record => ({
          promptId: record.promptId ?? null,
          actionPromptId: record.actionPromptId ?? null,
          actionOrdinal: record.actionOrdinal ?? null,
          actingSeat: record.actingSeat ?? null,
          responseKind: record.responseKind ?? null,
          responseLength: record.responseLength ?? null,
          selectedCardPrinting: record.selectedCardPrinting ?? null,
          selectedCardIsEnergy: record.selectedCardIsEnergy ?? false,
          nativeValidateAccepted: record.nativeValidateAccepted ?? false,
          physicalZoneSettled: record.physicalZoneSettled ?? false,
          physicalZoneAfter: record.physicalZoneAfter ?? null,
          ownerObservationSha256:
            observationHash(record.ownerObservationAtDecision)
        }))
      };
    });
  return {
    schema: VERSION,
    executionGate: diagnostic.executionGate,
    attempts,
    rootActionEventCounts: Object.fromEntries(
      [...new Set(diagnostic.rootActionEvents.map(event => event.trialId))]
        .map(id => [id, diagnostic.rootActionEvents.filter(event =>
          event.trialId === id
        ).length])
    ),
    knownPromptEventsAroundResponse: knownEvents,
    nativeMatchAttempts,
    selectedV0ThrownCode: diagnostic.selectedV0ThrownCode,
    rawStateFallbackCalls: diagnostic.rawStateFallbackCalls,
    competitiveGamesQualified: 0,
    estimatedWinRate: null,
    paperLegalityCertified: false
  };
}

/** @returns {object} Execute and strictly re-audit the registered v1 frame. */
function run() {
  assertRegistrationProvenance();
  const output = v1.run();
  const registered = v1.trials();
  assert.deepEqual(registered, REGISTRATION.trials);
  const rawRows = output.rawDevelopment?.rows ?? [];
  const matchAttempts =
    output.nativeMatchIntegrationAudit.nativeMatchAttempts;
  const summaries = output.diagnostic.actualAttemptRows;
  for (const summary of summaries) {
    const trial = registered.find(item => item.id === summary.id);
    const row = rawRows.find(candidate =>
      rowTrialId(candidate, registered) === summary.id
    ) ?? {};
    const matchAudit = matchAttempts.find(attempt =>
      typeof attempt.label === 'string' &&
      attempt.label.endsWith(summary.id)
    ) ?? null;
    const promptJoin = v1.joinSnapTrapPromptEvidence(matchAudit);
    const registeredSourceSeat =
      trial?.candidateSlot === 'A' ? 1 : 0;
    promptJoin.sourceSeatMatchesRegisteredSeat =
      promptJoin.sourceSeat === registeredSourceSeat;
    const abort = nativeAbortSummary(row);
    summary.nativeAbortEvidence = abort;
    if (row.error) {
      summary.nativeError = {
        name: row.error.name ?? null,
        code: row.error.code ?? null,
        message: row.error.message ?? String(row.error)
      };
      const capSignal = /(?:max(?:imum)?[-_ ]?actions?|root[-_ ]?action[-_ ]?limit|action[-_ ]?cap)/i
        .test(String(summary.nativeError.message ?? row.error ?? '')) ||
        /(?:ACTION_LIMIT|MAX_ACTIONS|ROOT_ACTION_CAP)/i.test(String(row.error?.code ?? '')) ||
        /(?:action-cap|root-action-limit|max-actions)/i.test(String(abort?.failureStage ?? '')) ||
        /(?:max(?:imum)?[-_ ]?actions?|root[-_ ]?action[-_ ]?limit|action[-_ ]?cap)/i
        .test(String(row.endReason ?? ''));
      if (capSignal) summary.nativeOutcome = 'action-cap';
    }
    const sequence = buildPostPromptSequence(
      summary.id,
      promptJoin,
      output.rootActionEvents,
      row,
      summary,
      matchAudit
    );
    summary.promptJoin = promptJoin;
    summary.postPromptSequence = sequence;
  }
  const executionGate = buildExecutionGate(
    summaries, output.diagnostic
  );
  output.manifest.version = VERSION;
  output.manifest.registrationPath = REGISTRATION_PATH;
  output.manifest.profile =
    'rank3-champion-reference-two-registered-seeds-both-seats-260root-strict-continuation';
  output.manifest.registeredFrameName = REGISTRATION.registeredFrameName;
  output.manifest.predecessorRegistrationPath = V1_REGISTRATION_PATH;
  output.manifest.predecessorWorkflowRunId =
    REGISTRATION.predecessor.workflowRunId;
  output.manifest.resolvedSourceAndPolicyHashes = [
    ...(output.manifest.resolvedSourceAndPolicyHashes ?? []),
    { path: V2_RUNNER_PATH, sha256: createHash('sha256').update(fs.readFileSync(path.resolve(ROOT, V2_RUNNER_PATH))).digest('hex') },
    { path: REGISTRATION_PATH, sha256: createHash('sha256').update(fs.readFileSync(path.resolve(ROOT, REGISTRATION_PATH))).digest('hex') },
    { path: 'tests/2026-11/agent36-v8-snap-trap-vertical-slice-v2.test.cjs',
      sha256: createHash('sha256').update(fs.readFileSync(path.resolve(ROOT, 'tests/2026-11/agent36-v8-snap-trap-vertical-slice-v2.test.cjs'))).digest('hex') }
  ];
  output.diagnostic.schema = VERSION;
  output.diagnostic.executionGate = executionGate;
  output.diagnostic.verdict = executionGate.passed ?
    'PASS-STRICT-SNAP-TRAP-OWNER-PROMPT-AND-MEANINGFUL-CONTINUATION-DEVELOPMENT-ONLY' :
    'FAIL-STRICT-SNAP-TRAP-OWNER-PROMPT-AND-CONTINUATION-GATE';
  output.diagnostic.predecessorCorrection = {
    predecessorVersion: 'agent36-v8-snap-trap-vertical-slice-v1',
    predecessorWorkflowRunId: REGISTRATION.predecessor.workflowRunId,
    v1GatePassed: true,
    v1GateAcceptedMechanicalNullPromptResponses: true,
    v1GateRequiredBothSourceSeatPromptSettlements: false,
    strictSuccessorRequiresBothSourceSeatPromptSettlements: true
  };
  output.diagnosticSummary = buildDiagnosticSummary(output);
  return output;
}

/**
 * Atomically preserve the complete strict audit under an exclusive lock.
 * @param {object} value
 * @returns {{path:string,sha256:string}}
 */
function writeArchive(value) {
  const directory = path.resolve(
    ROOT, 'artifacts/agent36-v8-snap-trap-vertical-slice-v2'
  );
  fs.mkdirSync(directory, { recursive: true });
  const target = path.join(
    directory, 'agent36-v8-snap-trap-vertical-slice-v2.json'
  );
  const lockPath = target + '.lock';
  const lockFd = fs.openSync(lockPath, 'wx');
  const payload = JSON.stringify(value, null, 2) + '\n';
  const temporary = target + '.' + process.pid + '-' +
    randomUUID() + '.tmp';
  const checksumTemporary = target + '.' + process.pid + '-' +
    randomUUID() + '.sha256.tmp';
  const digest = createHash('sha256').update(payload).digest('hex');
  try {
    fs.writeFileSync(temporary, payload, { flag: 'wx' });
    fs.renameSync(temporary, target);
    fs.writeFileSync(checksumTemporary, digest + '\n', { flag: 'wx' });
    fs.renameSync(checksumTemporary, target + '.sha256');
    return { path: target, sha256: digest };
  } finally {
    fs.closeSync(lockFd);
    fs.unlinkSync(lockPath);
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    if (fs.existsSync(checksumTemporary)) fs.unlinkSync(checksumTemporary);
  }
}

if (require.main === module) {
  try {
    const output = run();
    const archive = writeArchive(output);
    process.stdout.write(JSON.stringify({
      archive,
      manifest: output.manifest,
      diagnosticSummary: output.diagnosticSummary
    }, null, 2) + '\n');
    if (!output.diagnostic.executionGate.passed) process.exitCode = 1;
  } catch (error) {
    const failure = {
      manifest: {
        version: VERSION,
        registrationPath: REGISTRATION_PATH,
        pinnedTwinleaf: REGISTRATION.pinnedTwinleaf,
        releaseQualified: false,
        competitiveGamesQualified: 0
      },
      diagnostic: {
        verdict: 'FATAL-STRICT-VERTICAL-SLICE-EXECUTION-ERROR',
        executionGate: { passed: false },
        error: {
          name: error?.name ?? null,
          code: error?.code ?? null,
          message: error?.message ?? String(error),
          stack: error?.stack ?? null
        },
        competitiveGamesQualified: 0
      },
      rawDevelopment: null
    };
    const archive = writeArchive(failure);
    process.stderr.write(JSON.stringify({
      archive,
      error: failure.diagnostic.error
    }, null, 2) + '\n');
    process.exitCode = 1;
  }
}

module.exports = {
  VERSION,
  ROOT_LIMIT,
  REGISTRATION_PATH,
  trials: () => {
    assertRegistrationProvenance();
    return v1.trials();
  },
  nativeAbortSummary,
  buildPostPromptSequence,
  buildExecutionGate,
  buildDiagnosticSummary,
  run,
  writeArchive
};
