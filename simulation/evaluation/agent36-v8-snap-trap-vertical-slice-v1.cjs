'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');

const {
  runSelectedIssue25V0,
  hashRegisteredFile,
  observedGitRevision,
  observedLoadedResearchModuleDigest
} = require('./agent36-issue25-selected-v0.cjs');
const { runDevelopment } = require('./agent41-bilateral-v2-development.cjs');
const { withStewardOwnerPromptFrontier } =
  require('./agent36-issue25-steward-selected-v4.cjs');
const { withStewardInnermostOwnerPrompts } =
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const { withCommonOwnerThornsRoot } =
  require('./agent36-issue25-common-v6.cjs');
const { withOwnerVoltAcrossNativeMatches } =
  require('./agent36-issue25-common-v7.cjs');
const { withSnapTrapInsideNativeMatchesV3 } =
  require('../twinleaf/agent36/snap-trap-native-match-integration-v3.cjs');

const VERSION = 'agent36-v8-snap-trap-vertical-slice-v1';
const ROOT = path.resolve(__dirname, '../..');
const REGISTRATION_PATH =
  'results/aichi-2026/registrations/agent36-v8-snap-trap-vertical-slice-v1-20261108.json';
const SOURCE_V8_REGISTRATION_PATH =
  'results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json';
const SOURCE_V10B_REGISTRATION_PATH =
  'results/aichi-2026/registrations/agent36-issue25-common-v10b-paired-fresh-aba-260root-20261107.json';
const ROOT_LIMIT = 260;
const PINNED_TWINLEAF = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const KNOWN_PROMPT_TRIAL_ID = '3:312:B:champion-reference';
const REGISTRATION = JSON.parse(fs.readFileSync(
  path.resolve(ROOT, REGISTRATION_PATH), 'utf8'
));
const TRIALS = REGISTRATION.trials.map(trial => ({ ...trial }));
const HASH_PATHS = [
  'simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v1.cjs',
  REGISTRATION_PATH,
  SOURCE_V8_REGISTRATION_PATH,
  SOURCE_V10B_REGISTRATION_PATH,
  'simulation/evaluation/agent36-issue25-common-v8.cjs',
  'simulation/evaluation/agent36-issue25-selected-v0.cjs',
  'simulation/evaluation/agent41-bilateral-v2-development.cjs',
  'simulation/evaluation/agent36-issue25-steward-selected-v4.cjs',
  'simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs',
  'simulation/evaluation/agent36-issue25-common-v6.cjs',
  'simulation/evaluation/agent36-issue25-common-v7.cjs',
  'simulation/twinleaf/agent36/snap-trap-native-match-integration-v3.cjs',
  'simulation/twinleaf/agent36/snap-trap-owner-prompt-evidence-v1.cjs',
  'simulation/twinleaf/agent36/snap-trap-owner-prompt-policy-v2.cjs',
  'simulation/twinleaf/agent36/snap-trap-energy-choice-v2.cjs',
  'simulation/twinleaf/agent30/stunfisk-snap-trap-prompt-marker-v3.cjs',
  'simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs',
  'simulation/twinleaf/actor-observation-contract.cjs',
  'simulation/twinleaf/headless.cjs',
  'tests/2026-11/agent36-snap-trap-owner-prompt-evidence-v1.test.cjs',
  'tests/2026-11/agent36-v8-snap-trap-vertical-slice-v1.test.cjs'
];

/** @param {string} relativePath @returns {string} Git blob SHA-1. */
function gitBlobSha(relativePath) {
  const bytes = fs.readFileSync(path.resolve(ROOT, relativePath));
  return createHash('sha1')
    .update('blob ' + bytes.length + '\0')
    .update(bytes)
    .digest('hex');
}

/** @returns {object[]} Frozen four-arm rank-3 two-seed/both-seat frame. */
function trials() {
  assert.equal(REGISTRATION.schema, VERSION);
  assert.equal(REGISTRATION.status, 'FROZEN_BEFORE_EXECUTION');
  assert.equal(REGISTRATION.maxNativeRootActionsPerArm, ROOT_LIMIT);
  assert.equal(REGISTRATION.trialCount, 4);
  assert.deepEqual(REGISTRATION.sourceOriginalRanks, [3]);
  assert.deepEqual(REGISTRATION.contendingPrintedSixties, [
    'champion-reference'
  ]);
  assert.equal(TRIALS.length, 4);
  assert.deepEqual(TRIALS.map(trial => trial.id), [
    '3:312:B:champion-reference',
    '3:312:A:champion-reference',
    '3:213:A:champion-reference',
    '3:213:B:champion-reference'
  ]);
  assert.equal(new Set(TRIALS.map(trial => trial.id)).size, 4);
  assert.deepEqual(new Set(TRIALS.map(trial => trial.candidateSlot)),
    new Set(['A', 'B']));
  assert.deepEqual(new Set(TRIALS.map(trial => trial.seed)),
    new Set([2404595552, 948758444]));
  for (const trial of TRIALS) {
    assert.equal(trial.rank, 3);
    assert.equal(trial.candidateId, 'champion-reference');
    assert.equal(trial.id, [
      trial.rank, trial.repeat, trial.candidateSlot, trial.candidateId
    ].join(':'));
    assert.ok(Number.isSafeInteger(trial.seed) &&
      trial.seed >= 0 && trial.seed <= 0xffffffff);
  }
  return TRIALS.map(trial => ({ ...trial }));
}

/** @returns {void} Validate reused seeds against the frozen source registrations. */
function assertRegistrationProvenance() {
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
  const candidates = [
    row.rootActionLedger,
    row.nativePublicRootArchive?.rootActionLedger,
    row.nativeAbortEvidence?.rootActionLedger,
    row.nativeAbortProvenance?.rootActionLedger
  ];
  return candidates.find(Array.isArray) ?? null;
}

/**
 * Preserve actionCount, finished and ledger length as separate fields.
 * @param {object} row
 * @param {object} trial
 * @param {object|null} attemptedStatus
 * @returns {object}
 */
function summarizeNativeAttempt(row, trial, attemptedStatus = null) {
  const ledger = rootLedgerOf(row);
  const actionCount = Number.isSafeInteger(row.actionCount) ?
    row.actionCount : null;
  const finished = typeof row.finished === 'boolean' ? row.finished : null;
  const rootActionCount = Number.isSafeInteger(row.rootActionCount) ?
    row.rootActionCount : null;
  const rootActionLedgerLength = Array.isArray(ledger) ? ledger.length : null;
  const aborted = row.error !== undefined && row.error !== null ||
    row.nativeAbortEvidence?.aborted === true ||
    row.nativeAbortProvenance?.aborted === true ||
    attemptedStatus?.status === 'engine-error';
  const nativeOutcome = aborted ? 'engine-error' :
    finished === true ? 'native-terminal-unqualified' :
    finished === false && actionCount === ROOT_LIMIT ? 'action-cap' :
    'returned-unqualified';
  const candidateSeat = trial.candidateSlot === 'A' ? 0 : 1;
  const sourceSeat = 1 - candidateSeat;
  return {
    id: trial.id,
    rank: trial.rank,
    repeat: trial.repeat,
    candidateId: trial.candidateId,
    candidateSlot: trial.candidateSlot,
    seed: trial.seed,
    sourceSeat,
    candidateSeat,
    status: row.status ?? attemptedStatus?.status ?? nativeOutcome,
    nativeOutcome,
    actionCount,
    finished,
    rootActionCount,
    rootActionLedgerLength,
    winner: row.winner ?? null,
    endReason: row.endReason ?? null,
    sourceDealFingerprint: row.sourceDealFingerprint ??
      attemptedStatus?.sourceDealFingerprint ?? null,
    fullPhysicalDealFingerprint: row.fullPhysicalDealFingerprint ??
      attemptedStatus?.fullPhysicalDealFingerprint ?? null,
    sourceAttackCount: row.sourceAttackSettlement?.attacks?.length ?? null,
    settledSourceAttackCount:
      row.sourceAttackSettlement?.attacks?.filter(attack =>
        attack.settledPromptChain === true
      ).length ?? null,
    declaredPaperGameQualified: false
  };
}

/**
 * Join source marker, owner-policy choice, live prompt evidence and native
 * ResolvePromptAction receipt by the exact prompt id.
 * @param {object|null} matchAudit
 * @returns {object}
 */
function joinSnapTrapPromptEvidence(matchAudit) {
  const marker = matchAudit?.marker ?? {};
  const ownerPolicy = matchAudit?.ownerPolicy ?? {};
  const evidence = matchAudit?.ownerPromptEvidence ?? {};
  const proofs = marker.exactSourcePromptsStamped ?? [];
  const choices = ownerPolicy.choices ?? [];
  const snapTrapPrompt = evidence.snapTrapPrompt ?? null;
  const promptId = snapTrapPrompt?.promptIdAfterStore ??
    proofs[0]?.promptIdAfterStore ?? null;
  const proof = proofs.find(item =>
    String(item.promptIdAfterStore ?? item.pendingNativePromptId) ===
    String(promptId)
  ) ?? null;
  const choice = choices.find(item =>
    String(item.promptId) === String(promptId)
  ) ?? null;
  const response = (evidence.responseRecords ?? []).find(item =>
    String(item.promptId) === String(promptId) &&
    String(item.actionPromptId) === String(promptId) &&
    item.samePromptId === true &&
    item.dispatchReturnedWithoutThrow === true &&
    item.promptResultDefined === true &&
    item.promptResultMatches === true &&
    item.promptItemFoundBeforeDispatch === true &&
    item.promptItemRemovedAfterDispatch === true &&
    item.nativeValidateAccepted === true
  ) ?? null;
  const exactPromptIdJoin = Boolean(
    promptId !== null && proof && choice && snapTrapPrompt && response &&
    String(proof.promptIdAfterStore ?? proof.pendingNativePromptId) ===
      String(choice.promptId) &&
    String(choice.promptId) === String(snapTrapPrompt.promptIdAfterStore) &&
    String(snapTrapPrompt.promptIdAfterStore) === String(response.promptId) &&
    String(response.actionPromptId) === String(response.promptId) &&
    response.actionType === 'ResolvePromptAction' &&
    response.actionOrdinal !== null &&
    response.actingSeat === snapTrapPrompt.ownerSeat
  );
  const physicalSettlements = Array.isArray(ownerPolicy.physicalSettlements) ?
    ownerPolicy.physicalSettlements.length :
    Number.isSafeInteger(ownerPolicy.physicalSettlements) ?
      ownerPolicy.physicalSettlements : 0;
  const exactRootStoreIdentity = Boolean(
    matchAudit?.rootStoreCaptureCount === 1 &&
    snapTrapPrompt?.sameRootStore === true &&
    response?.sameRootStore === true &&
    response?.rootStoreMatchesAtActionCallback === true &&
    choice?.exactRootStoreJoin === true &&
    Number(ownerPolicy.promptStoreJoins ?? 0) >= 1 &&
    Number(ownerPolicy.markerStoreIdentityJoins ?? 0) >= 1
  );
  const exactPhysicalSettlement = Boolean(
    choice?.exactlyOneMoveCardsEffect === true &&
    choice?.noOtherPublicCardMoved === true &&
    physicalSettlements >= 1 &&
    Number(ownerPolicy.moveCardsEffectReceiptCount ?? 0) >= 1 &&
    Number(ownerPolicy.physicalSettlementFailures ?? 0) === 0 &&
    response?.physicalZoneSettled === true
  );
  const ownerObservationCaptured = Boolean(
    snapTrapPrompt?.ownerObservationAtPromptCreation &&
    response?.ownerObservationAtDecision &&
    evidence.readsOpponentHidden === false &&
    evidence.readsOpponentHand === false &&
    evidence.readsOpponentDeck === false &&
    evidence.readsFaceDownPrizeIdentities === false
  );
  const responseShapeAccepted = Boolean(
    response?.responseKind === 'array' &&
    response?.responseLength === 1 &&
    response?.selectedCardIsEnergy === true &&
    response?.nativeValidateAccepted === true &&
    response?.dispatchReturnedWithoutThrow === true &&
    response?.promptResultDefined === true &&
    response?.promptResultMatches === true &&
    response?.promptItemFoundBeforeDispatch === true &&
    response?.promptItemRemovedAfterDispatch === true
  );
  const quarantineActive = ownerPolicy.quarantineActiveAtInstall === true &&
    evidence.quarantineActiveAtInstall === true;
  return {
    promptId,
    markerPromptCount: proofs.length,
    ownerChoiceCount: choices.length,
    sourceSeat: choice?.sourceSeat ?? proof?.sourceSeat ??
      snapTrapPrompt?.snapTrapIdentity?.sourceSeat ?? null,
    attackerSeat: choice?.attackerSeat ?? proof?.attackerSeat ??
      snapTrapPrompt?.snapTrapIdentity?.attackerSeat ?? null,
    selectedEnergyPrinting: choice?.energyPrinting ??
      response?.selectedCardPrinting ?? null,
    markerPromptId: proof?.promptIdAfterStore ??
      proof?.pendingNativePromptId ?? null,
    ownerChoicePromptId: choice?.promptId ?? null,
    evidencePromptId: snapTrapPrompt?.promptIdAfterStore ?? null,
    responsePromptId: response?.promptId ?? null,
    rootActionOrdinal: response?.actionOrdinal ?? null,
    exactPromptIdJoin,
    exactRootStoreIdentity,
    quarantineActive,
    ownerObservationCaptured,
    responseShapeAccepted,
    exactPhysicalSettlement,
    physicalSettlements,
    moveCardsEffectReceiptCount:
      ownerPolicy.moveCardsEffectReceiptCount ?? 0,
    physicalSettlementFailures:
      ownerPolicy.physicalSettlementFailures ?? 0,
    physicalZoneAfter: response?.physicalZoneAfter ?? null,
    nextOwnerPrompt: evidence.nextOwnerPrompt ?? null,
    nextOwnerPromptCapturedIfCreated: evidence.nextOwnerPrompt === null ||
      Boolean(evidence.nextOwnerPrompt?.ownerObservationAtPromptCreation),
    markerStoreIdentityJoins: ownerPolicy.markerStoreIdentityJoins ?? 0,
    promptStoreJoins: ownerPolicy.promptStoreJoins ?? 0
  };
}

/**
 * Find the first opponent and source roots after the exact prompt response.
 * @param {string} trialId
 * @param {object} join
 * @param {object[]} rootActionEvents
 * @param {object} row
 * @param {object} summary
 * @param {object|null} nextOwnerPrompt
 * @returns {object}
 */
function buildPostPromptSequence(
  trialId, join, rootActionEvents, row, summary, nextOwnerPrompt
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
  const nextOpponentRoot = later.find(event =>
    event.seat === attackerSeat
  ) ?? null;
  const nextOpponentMeaningfulRoot = later.find(event =>
    event.seat === attackerSeat && !isPass(event.action)
  ) ?? null;
  const opponentBarrier = nextOpponentMeaningfulRoot?.actionOrdinal ??
    nextOpponentRoot?.actionOrdinal ?? promptOrdinal;
  const afterOpponent = later.filter(event =>
    event.actionOrdinal > (opponentBarrier ?? promptOrdinal)
  );
  const nextSourceRoot = afterOpponent.find(event =>
    event.seat === sourceSeat
  ) ?? null;
  const nextSourceMeaningfulRoot = afterOpponent.find(event =>
    event.seat === sourceSeat && !isPass(event.action)
  ) ?? null;
  const ledger = rootLedgerOf(row);
  const promptRootLedgerEntry = Array.isArray(ledger) &&
    Number.isSafeInteger(promptOrdinal) ?
    ledger.find(entry => entry.actionOrdinal === promptOrdinal) ?? null : null;
  return {
    promptResponseActionOrdinal: promptOrdinal,
    promptResponseActingSeat: sourceSeat,
    promptRootLedgerEntry,
    nextOpponentRoot,
    nextOpponentMeaningfulRoot,
    nextSourceRootAfterOpponent: nextSourceRoot,
    nextSourceMeaningfulRootAfterOpponent: nextSourceMeaningfulRoot,
    nextOwnerPrompt,
    opponentDecisionObserved: Boolean(nextOpponentMeaningfulRoot),
    sourceContinuationObserved: Boolean(nextSourceMeaningfulRoot),
    continuationGatePassed: Boolean(
      nextOpponentMeaningfulRoot && nextSourceMeaningfulRoot
    ),
    endpoint: summary.nativeOutcome,
    actionCount: summary.actionCount,
    finished: summary.finished,
    rootActionCount: summary.rootActionCount,
    rootActionLedgerLength: summary.rootActionLedgerLength,
    declaredPaperGameQualified: false
  };
}

/**
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
  const snapTrapPromptResolved = Boolean(
    join?.exactPromptIdJoin &&
    join?.exactRootStoreIdentity &&
    join?.quarantineActive &&
    join?.ownerObservationCaptured &&
    join?.responseShapeAccepted &&
    join?.exactPhysicalSettlement
  );
  const meaningfulOpponentAndSourceContinuation =
    sequence?.continuationGatePassed === true;
  const endpointExplicitlyClassified = [
    'native-terminal-unqualified',
    'action-cap',
    'engine-error'
  ].includes(known?.nativeOutcome);
  const passed = Boolean(
    allRegisteredTrialsReturned &&
    bothSourceSeatOrientationsAttempted &&
    snapTrapPromptResolved &&
    meaningfulOpponentAndSourceContinuation &&
    endpointExplicitlyClassified
  );
  return {
    passed,
    allRegisteredTrialsReturned,
    bothSourceSeatOrientationsAttempted,
    snapTrapPromptResolved,
    meaningfulOpponentAndSourceContinuation,
    endpointExplicitlyClassified,
    knownPromptTrialId: KNOWN_PROMPT_TRIAL_ID,
    knownPromptTrialNativeOutcome: known?.nativeOutcome ?? null,
    knownPromptId: join?.promptId ?? null,
    knownPromptRootActionOrdinal: join?.rootActionOrdinal ?? null,
    nextOwnerPromptCaptured: Boolean(join?.nextOwnerPrompt),
    bothSourceSeatPromptResolutionsObserved: new Set(
      summaries.filter(summary => summary.promptJoin?.exactPromptIdJoin)
        .map(summary => summary.sourceSeat)
    ).size === 2,
    competitiveGamesQualified: 0,
    paperLegalityCertified: false
  };
}

/**
 * Execute the selected-v8 common policy through runDevelopment with the
 * source-attributed Snap Trap resolver installed inside each native match.
 * @returns {object}
 */
function run() {
  assertRegistrationProvenance();
  const registeredTrials = trials();
  const observedTwinleaf = observedGitRevision('vendor/twinleaf');
  assert.equal(observedTwinleaf, PINNED_TWINLEAF);

  const rootActionEvents = [];
  const rootStoresCreated = [];
  const storeTrialIds = new WeakMap();
  const onRootStoreCreated = (store, trialId) => {
    storeTrialIds.set(store, trialId);
    rootStoresCreated.push({
      trialId,
      rootStoreCreated: true
    });
  };
  const onRootActionDispatched = (
    store, action, actionOrdinal, seat, turnBefore
  ) => {
    const actionName = action?.constructor?.name ?? null;
    const value = action?.result;
    rootActionEvents.push({
      trialId: storeTrialIds.get(store) ?? null,
      actionOrdinal,
      seat,
      turnBefore,
      action: actionName,
      promptId: actionName === 'ResolvePromptAction' ?
        action.id ?? null : null,
      responseKind: Array.isArray(value) ? 'array' :
        value === null ? 'null' : typeof value,
      responseLength: Array.isArray(value) ? value.length : null,
      responseBoolean: typeof value === 'boolean' ? value : null
    });
  };

  const headless = require('../twinleaf/headless.cjs');
  let selectedResult = null;
  let ownerWrapper = null;
  let voltWrapper = null;

  const execute = () => withCommonOwnerThornsRoot(() => {
    selectedResult = runSelectedIssue25V0({
      runner: options => runDevelopment({
        ...options,
        actorOnlyComposition: true,
        sourceIndependentCommonPolicy: true,
        bilateralSpecialEnergyRoot: true,
        nativeAcceptedTargets: true,
        nativeRootActionLimit: ROOT_LIMIT,
        registeredTrials: registeredTrials.map(trial => ({ ...trial })),
        registeredFrameName: REGISTRATION.registeredFrameName,
        allowAdditionalOriginalSourceRanks: true,
        allowSingleCandidatePerGroup: true,
        capturePublicAttackTransitions: true,
        nativeSetupCoinChoiceReceipt: true,
        isolatePolicyRandomness: true,
        isolatePhysicalShuffleRandomnessAfterSetup: true,
        onRootStoreCreated,
        onRootActionDispatched
      }),
      layers: {
        firstBlockedPromptEnvelope: withStewardOwnerPromptFrontier
      },
      registeredTrialIds: registeredTrials.map(trial => trial.id),
      nativeRootActionLimit: ROOT_LIMIT
    });
    return selectedResult;
  }, { env: process.env });

  const integrated = withSnapTrapInsideNativeMatchesV3(() => {
    voltWrapper = withOwnerVoltAcrossNativeMatches(() => {
      ownerWrapper = withStewardInnermostOwnerPrompts(execute, { headless });
      return ownerWrapper;
    }, { headless });
    return voltWrapper.result.result;
  }, { headless });

  const selected = selectedResult ?? integrated.result;
  const rawDevelopment = selected?.rawDevelopment ?? null;
  const rawRows = rawDevelopment?.rows ?? [];
  const attemptedStatusById = new Map(
    (selected?.diagnostic?.attemptedRows ?? []).map(row => [row.id, row])
  );
  const matchAttempts = integrated.audit.nativeMatchAttempts;
  const summaries = registeredTrials.map(trial => {
    const row = rawRows.find(candidate =>
      rowTrialId(candidate, registeredTrials) === trial.id
    ) ?? {};
    const summary = summarizeNativeAttempt(
      row, trial, attemptedStatusById.get(trial.id) ?? null
    );
    const matchAudit = matchAttempts.find(attempt =>
      typeof attempt.label === 'string' && attempt.label.endsWith(trial.id)
    ) ?? null;
    const promptJoin = joinSnapTrapPromptEvidence(matchAudit);
    const postPromptSequence = buildPostPromptSequence(
      trial.id,
      promptJoin,
      rootActionEvents,
      row,
      summary,
      promptJoin.nextOwnerPrompt
    );
    return { ...summary, promptJoin, postPromptSequence };
  });

  const executionGate = buildExecutionGate(
    summaries, selected?.diagnostic ?? null
  );
  const manifest = {
    version: VERSION,
    registrationPath: REGISTRATION_PATH,
    registrationStatus: REGISTRATION.status,
    selectedV8CommonPolicyEntryPoint:
      'simulation/evaluation/agent36-issue25-common-v8.cjs',
    selectedV8CommonPolicyVersion:
      'agent36-issue25-broader-four-rank-prospective-v8-128root',
    profile:
      'rank3-champion-reference-two-registered-seeds-both-seats-260root',
    registeredTrialCount: registeredTrials.length,
    nativeRootActionLimit: ROOT_LIMIT,
    pinnedTwinleaf: PINNED_TWINLEAF,
    observedTwinleafGitCommit: observedTwinleaf,
    observedRepositoryGitCommit: observedGitRevision('.'),
    ciRepositoryRevision: process.env.GITHUB_SHA ?? null,
    runtimeGitAttestationStatus:
      selected?.manifest?.runtimeGitAttestationStatus ?? 'UNRESOLVED',
    randomnessProtocol: REGISTRATION.randomnessProtocol,
    sourceOriginalRanks: [3],
    candidateDeckId: 'champion-reference',
    sourceSeatAllocationRule: REGISTRATION.sourceSeatAllocationRule,
    detachedOwnerObservationContract:
      'actor-observation-contract.cjs',
    rootActionCallbackCapture: true,
    rawStateFallbackPolicy: 'Agent4 fail-closed quarantine remains active',
    resolvedSourceAndPolicyHashes: [
      ...(selected?.manifest?.resolvedSourceAndPolicyHashes ?? []),
      ...HASH_PATHS.map(hashRegisteredFile)
    ],
    observedLoadedResearchModuleDigest:
      observedLoadedResearchModuleDigest(),
    releaseQualified: false,
    competitiveGamesQualified: 0,
    estimatedWinRate: null
  };
  const diagnostic = {
    schema: VERSION,
    registration: REGISTRATION_PATH,
    registeredTrials,
    allRegisteredAttemptsReturned:
      selected?.diagnostic?.allRegisteredAttemptsReturned ?? false,
    registeredAttemptReconciliation:
      selected?.diagnostic?.registeredAttemptReconciliation ?? null,
    rawRowIdentityReconciliation:
      selected?.diagnostic?.rawRowIdentityReconciliation ?? null,
    selectedV0ThrownCode: selected?.diagnostic?.thrownCode ?? null,
    rawStateFallbackCalls: selected?.diagnostic?.fallbackCalls ?? null,
    nativeMatchIntegrationAudit: integrated.audit,
    ownerVoltMatchAudit: voltWrapper?.audit ?? null,
    innerOwnerPromptMatchAudit: ownerWrapper?.audit ?? null,
    rootStoresCreated,
    rootActionEvents,
    actualAttemptRows: summaries,
    executionGate,
    verdict: executionGate.passed ?
      'PASS-SNAP-TRAP-OWNER-PROMPT-INTEGRATION-AND-CONTINUATION-DEVELOPMENT-ONLY' :
      'FAIL-SNAP-TRAP-OWNER-PROMPT-INTEGRATION-GATE',
    competitiveGamesQualified: 0,
    estimatedWinRate: null,
    paperLegalityCertified: false
  };
  return {
    manifest,
    diagnostic,
    rawDevelopment,
    nativeMatchIntegrationAudit: integrated.audit,
    rootActionEvents
  };
}

/**
 * Atomically preserve the complete root/attempt ledger under an exclusive
 * lock. The workflow uploads this directory as a run artifact.
 * @param {object} value
 * @returns {{path:string,sha256:string}}
 */
function writeArchive(value) {
  const directory = path.resolve(
    ROOT, 'artifacts/agent36-v8-snap-trap-vertical-slice'
  );
  fs.mkdirSync(directory, { recursive: true });
  const target = path.join(
    directory, 'agent36-v8-snap-trap-vertical-slice.json'
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
      diagnostic: output.diagnostic
    }, null, 2) + '\n');
    if (!output.diagnostic.executionGate.passed) process.exitCode = 1;
  } catch (error) {
    const failure = {
      manifest: {
        version: VERSION,
        registrationPath: REGISTRATION_PATH,
        pinnedTwinleaf: PINNED_TWINLEAF,
        releaseQualified: false,
        competitiveGamesQualified: 0
      },
      diagnostic: {
        verdict: 'FATAL-REGISTERED-VERTICAL-SLICE-EXECUTION-ERROR',
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
    process.stderr.write(JSON.stringify({ archive, error: failure.diagnostic.error },
      null, 2) + '\n');
    process.exitCode = 1;
  }
}

module.exports = {
  VERSION,
  ROOT_LIMIT,
  REGISTRATION_PATH,
  trials,
  summarizeNativeAttempt,
  joinSnapTrapPromptEvidence,
  buildPostPromptSequence,
  buildExecutionGate,
  run,
  writeArchive
};
