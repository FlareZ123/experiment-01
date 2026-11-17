'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { analyzeTraceReplay } = require('../../simulation/evaluation/2026-11/agent6-v3-trace-replay-join.cjs');

function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function workerAudit() {
  const role = policyVersion => ({
    policyVersion, bundleSha256: 'b'.repeat(64), policySha256: 'c'.repeat(64),
    policyDrawCount: 0, policyDrawViolationCount: 0
  });
  return {
    completed: true, replayableEvidence: true, cleanupVerified: true,
    cleanupFailureCount: 0, policyRngViolations: 0,
    roles: { candidate: role('candidate-v1'), opponent: role('opponent-v1') }
  };
}

function baseSanitizedArtifact() {
  const row = {
    actionOrdinal: 4, actingSeat: 0, turnBefore: 0,
    pendingPromptType: 'SelectPrompt', isRootDecision: false,
    actionName: 'ResolvePromptAction', actionType: 'resolve-prompt',
    dispatchStatus: 'succeeded',
    promptContext: { promptId: 'prompt-1', promptType: 'SelectPrompt',
      optionCounts: {}, allowCancel: false }
  };
  const game = {
    finished: true, endReason: 'engine-game-end', actions: 15,
    actualFirstPlayerSeat: 0, actorDecisions: [row], rootDecisions: [],
    actorDecisionsSha256: 'd'.repeat(64), rootDecisionsSha256: 'e'.repeat(64)
  };
  return {
    schema: 'aichi-v3-actor-observation-sanitized-diagnostic-v1',
    fixtureOnly: true, admissionEligible: false, competitiveGameQualified: false,
    actorOnlyExecutionBoundary: { valid: true }, workerExecutionAudit: workerAudit(),
    workerExecutionAuditSha256: '9'.repeat(64),
    candidate: { printed60Sha256: '1'.repeat(64) },
    opponent: { printed60Sha256: '2'.repeat(64) },
    engine: { twinleafCommitSha: '3'.repeat(40), researchRevisionSha: '4'.repeat(40), nodeVersion: 'v22.0.0' },
    trial: { trialId: 'trial-1', seed: 'public-seed', seed32: 123,
      candidateSeat: 0, originalSourceSeat: 1, actualFirstPlayerSeat: 0,
      vendorCommitSha: '3'.repeat(40), researchRevisionSha: '4'.repeat(40) },
    candidatePolicyIdentity: { policyVersion: 'candidate-v1', bundleSha256: 'b'.repeat(64) },
    opponentPolicyIdentity: { policyVersion: 'opponent-v1', bundleSha256: 'b'.repeat(64) },
    policyPlanSha256: '5'.repeat(64),
    runtime: { runtimePinUnionSha256: '6'.repeat(64), loadedProcessClosureSha256: '7'.repeat(64) },
    game, summary: { actionCount: 15, actorDecisionsSha256: game.actorDecisionsSha256 }
  };
}

function rawReplay({
  target = true,
  choiceIndex = 1,
  handAfter = 9,
  beforePending = true,
  afterPending = false,
  afterResult = choiceIndex,
  includeAfter = true,
  includeActionResult = true,
  values = ['Draw 3 card(s)', 'Draw 2 card(s)', 'Draw 1 card(s)', 'Draw 0 card(s)'],
  disabled = [],
  allowCancel = false
} = {}) {
  const promptBefore = {
    promptType: 'SelectPrompt', id: 'prompt-1', pending: beforePending,
    fields: {
      message: target ? 'WANT_TO_DRAW_CARDS' : 'OTHER_EFFECT',
      options: { allowCancel, disabled }
    },
    extraFields: { values }
  };
  const promptAfter = {
    promptType: 'SelectPrompt', id: 'prompt-1', pending: afterPending,
    fields: {
      message: target ? 'WANT_TO_DRAW_CARDS' : 'OTHER_EFFECT',
      options: { allowCancel, disabled },
      result: afterResult
    },
    extraFields: { values }
  };
  const row = {
    actionOrdinal: 4, actingSeat: 0, turnBefore: 0,
    pendingPromptType: 'SelectPrompt', pendingPromptId: 'prompt-1',
    actionName: 'ResolvePromptAction', actionType: 'resolve-prompt',
    dispatchStatus: 'succeeded',
    actionPayload: {
      actionName: 'ResolvePromptAction',
      fields: { promptId: 'opaque-prompt-token', ...(includeActionResult ? { result: choiceIndex } : {}) }
    },
    promptResolution: { kind: 'worker-choice', decisionKind: 'select-choice', selectedCount: 1 },
    promptResolverContext: { availableOptions: { allowCancel } },
    fullStateBefore: {
      players: [{ seat: 0, counts: { hand: 7 } }],
      prompts: [promptBefore]
    },
    fullStateAfter: {
      players: [{ seat: 0, counts: { hand: handAfter } }],
      prompts: includeAfter ? [promptAfter] : []
    }
  };
  return {
    fixtureOnly: true,
    nativeGame: {
      seed: 'public-seed', seed32: 123, candidateSeat: 0,
      originalSourceSeat: 1, actualFirstPlayerSeat: 0,
      finished: true, endReason: 'engine-game-end', acceptedActions: 15,
      decisionTrace: [row]
    },
    engine: {
      twinleafCommitSha: '3'.repeat(40),
      researchRevisionSha: '4'.repeat(40),
      nodeVersion: 'v22.0.0'
    },
    trial: {
      trialId: 'trial-1', seed: 'public-seed', seed32: 123,
      candidateSeat: 0, originalSourceSeat: 1, actualFirstPlayerSeat: 0,
      vendorCommitSha: '3'.repeat(40), researchRevisionSha: '4'.repeat(40)
    },
    candidate: { printed60Sha256: '1'.repeat(64) },
    opponent: { printed60Sha256: '2'.repeat(64) },
    candidatePolicyIdentity: { policyVersion: 'candidate-v1', bundleSha256: 'b'.repeat(64) },
    opponentPolicyIdentity: { policyVersion: 'opponent-v1', bundleSha256: 'b'.repeat(64) },
    policyPlanSha256: '5'.repeat(64),
    runtime: { runtimePinUnionSha256: '6'.repeat(64), loadedProcessClosureSha256: '7'.repeat(64) },
    actorOnlyExecutionBoundary: { valid: true },
    workerExecutionAudit: workerAudit(),
    workerExecutionAuditSha256: '9'.repeat(64)
  };
}

function sanitizeFixtureArtifact(raw) {
  const safe = baseSanitizedArtifact();
  const rawGame = raw.nativeGame;
  const rawRow = rawGame.decisionTrace[0];
  const safeRow = safe.game.actorDecisions[0];

  safe.engine = structuredClone(raw.engine);
  safe.trial = {
    ...structuredClone(raw.trial),
    seed: rawGame.seed,
    seed32: rawGame.seed32,
    candidateSeat: rawGame.candidateSeat,
    originalSourceSeat: rawGame.originalSourceSeat,
    actualFirstPlayerSeat: rawGame.actualFirstPlayerSeat
  };
  safe.candidate = structuredClone(raw.candidate);
  safe.opponent = structuredClone(raw.opponent);
  safe.candidatePolicyIdentity = structuredClone(raw.candidatePolicyIdentity);
  safe.opponentPolicyIdentity = structuredClone(raw.opponentPolicyIdentity);
  safe.policyPlanSha256 = raw.policyPlanSha256;
  safe.runtime = structuredClone(raw.runtime);
  safe.actorOnlyExecutionBoundary = structuredClone(raw.actorOnlyExecutionBoundary);
  safe.workerExecutionAudit = structuredClone(raw.workerExecutionAudit);
  safe.workerExecutionAuditSha256 = raw.workerExecutionAuditSha256;
  if (raw.quickBallAudit !== undefined) safe.quickBallAudit = structuredClone(raw.quickBallAudit);

  safeRow.actionOrdinal = rawRow.actionOrdinal;
  safeRow.actingSeat = rawRow.actingSeat;
  safeRow.turnBefore = rawRow.turnBefore;
  safeRow.pendingPromptType = rawRow.pendingPromptType;
  safeRow.actionName = rawRow.actionName;
  safeRow.actionType = rawRow.actionType;
  safeRow.dispatchStatus = rawRow.dispatchStatus;
  safeRow.promptContext.promptId = rawRow.pendingPromptId;
  safeRow.promptContext.allowCancel = rawRow.promptResolverContext.availableOptions.allowCancel;

  safe.game.finished = rawGame.finished === true;
  safe.game.endReason = rawGame.endReason;
  safe.game.actions = rawGame.acceptedActions;
  safe.game.actualFirstPlayerSeat = rawGame.actualFirstPlayerSeat;
  safe.game.actorDecisionsSha256 = digest(safe.game.actorDecisions);
  safe.summary = {
    actionCount: safe.game.actions,
    actorDecisionsSha256: safe.game.actorDecisionsSha256
  };
  return safe;
}

const sanitizerIdentity = {
  researchRevisionSha: '4'.repeat(40),
  sanitizerBlobSha: '8'.repeat(40)
};

function safeArtifact() {
  return sanitizeFixtureArtifact(rawReplay());
}

function run(original = safeArtifact(), replay = rawReplay(), actionOrdinal = null) {
  return analyzeTraceReplay({
    originalSanitized: original,
    replayRaw: replay,
    sanitizeFixtureArtifact,
    sanitizerIdentity,
    actionOrdinal
  });
}

test('reconstructs the draw count from the native choice index and accepted hand delta', () => {
  const result = run();
  assert.equal(result.status, 'reconstructed');
  assert.equal(result.replayIdentityVerified, true);
  assert.equal(result.sanitizerRevisionVerified, true);
  assert.equal(result.competitiveEvidence, false);
  assert.equal(result.targets.length, 1);
  assert.equal(result.targets[0].promptEffect, 'WANT_TO_DRAW_CARDS');
  assert.equal(result.targets[0].choiceIndex, 1);
  assert.equal(result.targets[0].selectedDrawCount, 2);
  assert.equal(result.targets[0].handCountDelta, 2);
  assert.equal(result.targets[0].confidence, 'native-choice-index-and-hand-delta-agree');
});

test('does not treat worker selectedCount=1 as the number of cards drawn', () => {
  const result = run();
  assert.equal(result.targets[0].selectedDrawCount, 2);
  assert.equal(result.targets[0].choiceIndex, 1);
});

test('marks a game with a different exact prompt message as not exercised', () => {
  const replay = rawReplay({ target: false });
  const result = run(safeArtifact(), replay);
  assert.equal(result.status, 'not-exercised');
  assert.equal(result.targetCount, 0);
});

test('does not accept the target identifier in unrelated metadata or substring text', () => {
  const replay = rawReplay({ target: false });
  const prompt = replay.nativeGame.decisionTrace[0].fullStateBefore.prompts[0];
  prompt.extraFields.note = 'unrelated metadata mentions WANT_TO_DRAW_CARDS';
  prompt.fields.message = 'OTHER_EFFECT_WANT_TO_DRAW_CARDS';
  const result = run(safeArtifact(), replay);
  assert.equal(result.status, 'not-exercised');
  assert.equal(result.targetCount, 0);
});

test('uses fields.text only when the canonical message field is absent', () => {
  const replay = rawReplay();
  const prompt = replay.nativeGame.decisionTrace[0].fullStateBefore.prompts[0];
  delete prompt.fields.message;
  prompt.fields.text = 'WANT_TO_DRAW_CARDS';
  const result = run(safeArtifact(), replay);
  assert.equal(result.status, 'reconstructed');
  assert.equal(result.targets[0].promptIdentityField, 'text');
});

test('requires the exact target prompt to be pending before dispatch', () => {
  const replay = rawReplay({ beforePending: false });
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_PROMPT_NOT_PENDING' });
});

test('rejects a prompt that remains pending after dispatch, including a zero draw choice', () => {
  const replay = rawReplay({ choiceIndex: 3, handAfter: 7, afterPending: true });
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_PROMPT_NOT_RESOLVED' });
});

test('requires the after-dispatch prompt result to equal the native action result', () => {
  const replay = rawReplay({ choiceIndex: 1, handAfter: 9, afterResult: 2 });
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_PROMPT_RESULT_MISMATCH' });
});

test('allows an absent resolved prompt only with native choice index and matching hand delta', () => {
  const replay = rawReplay({ choiceIndex: 1, handAfter: 9, includeAfter: false });
  const result = run(safeArtifact(), replay);
  assert.equal(result.status, 'reconstructed');
  assert.equal(result.targets[0].promptAfterPresent, false);
  assert.equal(result.targets[0].selectedDrawCount, 2);
});

test('supports zero-card choice when index, native option and hand delta agree', () => {
  const result = run(safeArtifact(), rawReplay({ choiceIndex: 3, handAfter: 7 }));
  assert.equal(result.status, 'reconstructed');
  assert.equal(result.targets[0].selectedDrawCount, 0);
  assert.equal(result.targets[0].handCountDelta, 0);
});

test('does not reconstruct when native choice and hand delta disagree', () => {
  const result = run(safeArtifact(), rawReplay({ choiceIndex: 1, handAfter: 8 }));
  assert.equal(result.status, 'choice-unresolved');
  assert.equal(result.targets[0].selectedDrawCount, null);
  assert.equal(result.targets[0].confidence, 'native-choice-index-and-hand-delta-disagree');
});

test('rejects an out-of-range native choice index', () => {
  assert.throws(() => run(safeArtifact(), rawReplay({ choiceIndex: 4, handAfter: 9, afterResult: 4 })),
    { code: 'TRACE_REPLAY_CHOICE_INDEX_INVALID' });
});

test('rejects a disabled native choice index', () => {
  assert.throws(() => run(safeArtifact(), rawReplay({
    choiceIndex: 1, handAfter: 9, disabled: [false, true, false, false]
  })), { code: 'TRACE_REPLAY_CHOICE_INDEX_INVALID' });
});

test('leaves the target unresolved when the native values are missing or not the exact source labels', () => {
  const missing = run(safeArtifact(), rawReplay({ values: null }));
  assert.equal(missing.status, 'choice-unresolved');
  assert.equal(missing.targets[0].selectedDrawCount, null);
  const wrongLabels = run(safeArtifact(), rawReplay({
    values: ['Draw 3 cards', 'Draw 2 cards', 'Draw 1 card', 'Draw 0 cards']
  }));
  assert.equal(wrongLabels.status, 'choice-unresolved');
  assert.equal(wrongLabels.targets[0].selectedDrawCount, null);
});

test('recomputes sanitization from raw replay and rejects a changed decision row with same seed', () => {
  const replay = rawReplay();
  replay.nativeGame.decisionTrace[0].actionName = 'DifferentAction';
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('recomputes sanitization from raw replay and rejects changed policy identity with same seed', () => {
  const replay = rawReplay();
  replay.candidatePolicyIdentity.policyVersion = 'candidate-v2';
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('rejects a replay with a different physical seed', () => {
  const replay = rawReplay();
  replay.nativeGame.seed = 'different-seed';
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('rejects nonzero policy RNG draws', () => {
  const replay = rawReplay();
  replay.workerExecutionAudit.roles.opponent.policyDrawCount = 1;
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_POLICY_RNG_NONZERO' });
});

test('rejects a sanitized game-trace digest mismatch', () => {
  const original = safeArtifact();
  original.game.actorDecisionsSha256 = 'f'.repeat(64);
  assert.throws(() => run(original, rawReplay()), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('rejects a mismatch in a surviving public field outside the game summary', () => {
  const original = safeArtifact();
  original.quickBallAudit = { quickBallRootsAccepted: 1 };
  const replay = rawReplay();
  replay.quickBallAudit = { quickBallRootsAccepted: 2 };
  assert.throws(() => run(original, replay), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('rejects resolver allowCancel drift', () => {
  const replay = rawReplay();
  replay.nativeGame.decisionTrace[0].promptResolverContext.availableOptions.allowCancel = true;
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_PROMPT_OPTIONS_MISMATCH' });
});

test('allows only ephemeral container identifiers to differ', () => {
  const original = safeArtifact();
  original.workerExecutionAudit.roles.candidate.containerIdSha256 = 'a'.repeat(64);
  original.workerExecutionAuditSha256 = 'c'.repeat(64);
  const replay = rawReplay();
  replay.workerExecutionAudit.roles.candidate.containerIdSha256 = 'b'.repeat(64);
  replay.workerExecutionAuditSha256 = 'd'.repeat(64);
  const result = run(original, replay);
  assert.equal(result.replayIdentityVerified, true);
});

test('does not ignore similarly named fields outside the worker audit', () => {
  const original = safeArtifact();
  original.quickBallAudit = { containerIdSha256: 'a'.repeat(64) };
  const replay = rawReplay();
  replay.quickBallAudit = { containerIdSha256: 'b'.repeat(64) };
  assert.throws(() => run(original, replay), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('rejects an invalid actor-only boundary', () => {
  const replay = rawReplay();
  replay.actorOnlyExecutionBoundary.valid = false;
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_GAME_NOT_ADMISSIBLE' });
});

test('output contains no raw card identities, numeric card IDs, or opaque prompt tokens', () => {
  const replay = rawReplay();
  const rawRow = replay.nativeGame.decisionTrace[0];
  rawRow.actionPayload.fields.privateCard = 'Secret Card ABC';
  rawRow.actionPayload.fields.token = 'opaque-secret-token';
  rawRow.actionPayload.fields.numericToken = '123456';
  rawRow.fullStateBefore.prompts[0].extraFields.cards = [{ value: 98765, name: 'Secret Card DEF' }];
  const result = run(safeArtifact(), replay);
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes('Secret Card ABC'), false);
  assert.equal(serialized.includes('Secret Card DEF'), false);
  assert.equal(serialized.includes('123456'), false);
  assert.equal(serialized.includes('98765'), false);
  assert.equal(serialized.includes('opaque-secret-token'), false);
  assert.equal(serialized.includes('opaque-prompt-token'), false);
});

test('requires the exact sanitizer function and its revision identity', () => {
  const replay = rawReplay();
  assert.throws(() => analyzeTraceReplay({
    originalSanitized: safeArtifact(), replayRaw: replay,
    sanitizerIdentity
  }), { code: 'TRACE_REPLAY_SANITIZER_REQUIRED' });
  assert.throws(() => analyzeTraceReplay({
    originalSanitized: safeArtifact(), replayRaw: replay,
    sanitizeFixtureArtifact, sanitizerIdentity: {
      researchRevisionSha: 'a'.repeat(40), sanitizerBlobSha: '8'.repeat(40)
    }
  }), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});
