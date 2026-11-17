'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const {
  analyzeTraceReplay, verifySanitizerCheckout
} = require('../../simulation/evaluation/2026-11/agent6-v3-trace-replay-join.cjs');

function canonicalJson(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' ||
      (typeof value === 'number' && Number.isFinite(value))) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  return '{' + Object.keys(value).sort().map(key =>
    JSON.stringify(key) + ':' + canonicalJson(value[key])).join(',') + '}';
}

function digest(value) {
  return crypto.createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex');
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
  actingSeat = 0,
  handBefore = 7,
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
    actionOrdinal: 4, actingSeat, turnBefore: 0,
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
      players: [
        { seat: 1 - actingSeat, counts: { hand: 4 } },
        { seat: actingSeat, counts: { hand: handBefore } }
      ],
      prompts: [promptBefore]
    },
    fullStateAfter: {
      players: [
        { seat: 1 - actingSeat, counts: { hand: 4 } },
        { seat: actingSeat, counts: { hand: handAfter } }
      ],
      prompts: includeAfter ? [promptAfter] : []
    }
  };
  const decisionTrace = [row];
  const decisionTraceSha256 = digest(decisionTrace);
  return {
    fixtureOnly: true,
    nativeGame: {
      seed: 'public-seed', seed32: 123, candidateSeat: 0,
      originalSourceSeat: 1, actualFirstPlayerSeat: 0,
      finished: true, endReason: 'engine-game-end', acceptedActions: 15,
      decisionTrace, decisionTraceSha256
    },
    engine: {
      twinleafCommitSha: '3'.repeat(40),
      researchRevisionSha: '4'.repeat(40),
      nodeVersion: 'v22.0.0'
    },
    trial: {
      trialId: 'trial-1', seed: 'public-seed', seed32: 123,
      candidateSeat: 0, originalSourceSeat: 1, actualFirstPlayerSeat: 0,
      vendorCommitSha: '3'.repeat(40), researchRevisionSha: '4'.repeat(40),
      decisionTraceSha256
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

function refreshTraceDigest(replay) {
  const value = digest(replay.nativeGame.decisionTrace);
  replay.nativeGame.decisionTraceSha256 = value;
  replay.trial.decisionTraceSha256 = value;
  return replay;
}

function sanitizeFixtureArtifact(raw) {
  const safe = baseSanitizedArtifact();
  const rawGame = raw.nativeGame;
  const rawRow = rawGame.decisionTrace[0];
  const safeRow = safe.game.actorDecisions[0];

  safe.engine = structuredClone(raw.engine);
  const safeTrial = structuredClone(raw.trial);
  delete safeTrial.decisionTraceSha256;
  safe.trial = {
    ...safeTrial,
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
  sanitizerBlobSha: '8'.repeat(40),
  twinleafCommitSha: '3'.repeat(40)
};

const EXPECTED_SANITIZER_PATH = 'simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs';

function makeSanitizerRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent6-trace-sanitizer-'));
  const relativePath = EXPECTED_SANITIZER_PATH;
  const sanitizerPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(sanitizerPath), { recursive: true });
  fs.writeFileSync(sanitizerPath, 'module.exports = { sanitizeFixtureArtifact() { return {}; } };\n');
  fs.writeFileSync(path.join(root, '.gitmodules'),
    '[submodule "vendor/twinleaf"]\n\tpath = vendor/twinleaf\n\turl = https://github.com/twinleafgg/twinleafgg.git\n');
  execFileSync('git', ['init'], { cwd: root, stdio: 'ignore' });
  execFileSync('git', ['config', 'user.email', 'agent6-test@example.invalid'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Agent6 test'], { cwd: root });
  execFileSync('git', ['add', '--', '.gitmodules', relativePath], { cwd: root });
  execFileSync('git', ['commit', '-m', 'sanitizer base fixture'], { cwd: root, stdio: 'ignore' });
  const submoduleCommitSha = execFileSync('git', ['rev-parse', 'HEAD'],
    { cwd: root, encoding: 'utf8' }).trim();
  execFileSync('git', ['update-index', '--add', '--cacheinfo',
    '160000,' + submoduleCommitSha + ',vendor/twinleaf'], { cwd: root });
  execFileSync('git', ['commit', '-m', 'pin Twinleaf fixture'], { cwd: root, stdio: 'ignore' });
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const blob = execFileSync('git', ['rev-parse', 'HEAD:' + relativePath],
    { cwd: root, encoding: 'utf8' }).trim();
  return {
    root, sanitizerPath, relativePath, head, blob, submoduleCommitSha,
    cleanup: () => fs.rmSync(root, { recursive: true, force: true })
  };
}

function rawSanitizerMetadata(repo, vendorCommitSha = repo.submoduleCommitSha) {
  return {
    engine: { researchRevisionSha: repo.head, twinleafCommitSha: vendorCommitSha },
    trial: { researchRevisionSha: repo.head, vendorCommitSha }
  };
}

function safeArtifact() {
  return sanitizeFixtureArtifact(rawReplay());
}

function run(original = safeArtifact(), replay = rawReplay(), actionOrdinal = null, originalRaw = rawReplay()) {
  return analyzeTraceReplay({
    originalSanitized: original,
    originalRaw,
    replayRaw: replay,
    sanitizeFixtureArtifact,
    sanitizerIdentity,
    actionOrdinal
  });
}

function runMatchingReplay(replay, actionOrdinal = null) {
  return run(sanitizeFixtureArtifact(replay), replay, actionOrdinal, replay);
}

test('reconstructs the draw count from the native choice index and accepted hand delta', () => {
  const result = run();
  assert.equal(result.status, 'trace-confirmed');
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

test('does not infer a choice index from promptAfter or promptResolution when native action result is absent', () => {
  const replay = rawReplay({ includeActionResult: false });
  const result = runMatchingReplay(replay);
  assert.equal(result.status, 'choice-unresolved');
  assert.equal(result.targets[0].selectedDrawCount, null);
  assert.equal(result.targets[0].confidence, 'native-choice-index-unavailable');
});

test('reconstructs the opponent-side prompt from seat 1 hand counts, not seat 0', () => {
  const replay = rawReplay({ actingSeat: 1, handBefore: 6, choiceIndex: 1, handAfter: 8 });
  const result = runMatchingReplay(replay);
  assert.equal(result.status, 'trace-confirmed');
  assert.equal(result.targets[0].actingSeat, 1);
  assert.equal(result.targets[0].handCountBefore, 6);
  assert.equal(result.targets[0].handCountAfter, 8);
  assert.equal(result.targets[0].handCountDelta, 2);
  assert.equal(result.targets[0].selectedDrawCount, 2);
});

test('marks a game with a different exact prompt message as not exercised', () => {
  const replay = rawReplay({ target: false });
  const result = runMatchingReplay(replay);
  assert.equal(result.status, 'not-exercised');
  assert.equal(result.targetCount, 0);
});

test('does not accept the target identifier in unrelated metadata or substring text', () => {
  const replay = rawReplay({ target: false });
  const prompt = replay.nativeGame.decisionTrace[0].fullStateBefore.prompts[0];
  prompt.extraFields.note = 'unrelated metadata mentions WANT_TO_DRAW_CARDS';
  prompt.fields.message = 'OTHER_EFFECT_WANT_TO_DRAW_CARDS';
  refreshTraceDigest(replay);
  const result = runMatchingReplay(replay);
  assert.equal(result.status, 'not-exercised');
  assert.equal(result.targetCount, 0);
});

test('uses fields.text only when the canonical message field is absent', () => {
  const replay = rawReplay();
  const prompt = replay.nativeGame.decisionTrace[0].fullStateBefore.prompts[0];
  delete prompt.fields.message;
  prompt.fields.text = 'WANT_TO_DRAW_CARDS';
  refreshTraceDigest(replay);
  const result = runMatchingReplay(replay);
  assert.equal(result.status, 'trace-confirmed');
  assert.equal(result.targets[0].promptIdentityField, 'text');
});

test('requires the exact target prompt to be pending before dispatch', () => {
  const replay = rawReplay({ beforePending: false });
  assert.throws(() => runMatchingReplay(replay), { code: 'TRACE_REPLAY_PROMPT_NOT_PENDING' });
});

test('rejects a prompt that remains pending after dispatch, including a zero draw choice', () => {
  const replay = rawReplay({ choiceIndex: 3, handAfter: 7, afterPending: true });
  assert.throws(() => runMatchingReplay(replay), { code: 'TRACE_REPLAY_PROMPT_NOT_RESOLVED' });
});

test('requires the after-dispatch prompt result to equal the native action result', () => {
  const replay = rawReplay({ choiceIndex: 1, handAfter: 9, afterResult: 2 });
  assert.throws(() => runMatchingReplay(replay), { code: 'TRACE_REPLAY_PROMPT_RESULT_MISMATCH' });
});

test('requires the resolved prompt to retain the exact target effect identity', () => {
  const replay = rawReplay();
  replay.nativeGame.decisionTrace[0].fullStateAfter.prompts[0].fields.message = 'OTHER_EFFECT';
  refreshTraceDigest(replay);
  assert.throws(() => runMatchingReplay(replay), { code: 'TRACE_REPLAY_PROMPT_IDENTITY_CHANGED' });
});

test('allows an absent resolved prompt only with native choice index and matching hand delta', () => {
  const replay = rawReplay({ choiceIndex: 1, handAfter: 9, includeAfter: false });
  const result = runMatchingReplay(replay);
  assert.equal(result.status, 'trace-confirmed');
  assert.equal(result.targets[0].promptAfterPresent, false);
  assert.equal(result.targets[0].selectedDrawCount, 2);
});

test('maps maximum draw from choice index 0 across two, three and four native options', () => {
  const cases = [
    { values: ['Draw 1 card(s)', 'Draw 0 card(s)'], drawCount: 1 },
    { values: ['Draw 2 card(s)', 'Draw 1 card(s)', 'Draw 0 card(s)'], drawCount: 2 },
    { values: ['Draw 3 card(s)', 'Draw 2 card(s)', 'Draw 1 card(s)', 'Draw 0 card(s)'], drawCount: 3 }
  ];
  for (const item of cases) {
    const replay = rawReplay({ choiceIndex: 0, handAfter: 7 + item.drawCount, values: item.values });
    const result = runMatchingReplay(replay);
    assert.equal(result.status, 'trace-confirmed');
    assert.equal(result.targets[0].choiceIndex, 0);
    assert.equal(result.targets[0].selectedDrawCount, item.drawCount);
    assert.equal(result.targets[0].optionCounts.nativeValues, item.values.length);
  }
});

test('maps the zero-draw last index across two, three and four native options', () => {
  const cases = [
    ['Draw 1 card(s)', 'Draw 0 card(s)'],
    ['Draw 2 card(s)', 'Draw 1 card(s)', 'Draw 0 card(s)'],
    ['Draw 3 card(s)', 'Draw 2 card(s)', 'Draw 1 card(s)', 'Draw 0 card(s)']
  ];
  for (const values of cases) {
    const choiceIndex = values.length - 1;
    const replay = rawReplay({ choiceIndex, handAfter: 7, values });
    const result = runMatchingReplay(replay);
    assert.equal(result.status, 'trace-confirmed');
    assert.equal(result.targets[0].choiceIndex, choiceIndex);
    assert.equal(result.targets[0].selectedDrawCount, 0);
    assert.equal(result.targets[0].handCountDelta, 0);
  }
});

test('does not reconstruct when native choice and hand delta disagree', () => {
  const replay = rawReplay({ choiceIndex: 1, handAfter: 8 });
  const result = runMatchingReplay(replay);
  assert.equal(result.status, 'choice-unresolved');
  assert.equal(result.targets[0].selectedDrawCount, null);
  assert.equal(result.targets[0].confidence, 'native-choice-index-and-hand-delta-disagree');
});

test('rejects an out-of-range native choice index', () => {
  const replay = rawReplay({ choiceIndex: 4, handAfter: 9, afterResult: 4 });
  assert.throws(() => runMatchingReplay(replay), { code: 'TRACE_REPLAY_CHOICE_INDEX_INVALID' });
});

test('leaves a disabled selected native choice unresolved', () => {
  const replay = rawReplay({ choiceIndex: 1, handAfter: 9, disabled: [false, true, false, false] });
  const result = runMatchingReplay(replay);
  assert.equal(result.status, 'choice-unresolved');
  assert.equal(result.targets[0].selectedDrawCount, null);
});

test('rejects any disabled option even when the chosen original index is enabled', () => {
  const replay = rawReplay({ choiceIndex: 1, handAfter: 9, disabled: [true, false, false, false] });
  const result = runMatchingReplay(replay);
  assert.equal(result.status, 'choice-unresolved');
  assert.equal(result.targets[0].selectedDrawCount, null);
});

test('leaves the target unresolved when the native values are missing or not the exact source labels', () => {
  const missingReplay = rawReplay({ values: null });
  const missing = runMatchingReplay(missingReplay);
  assert.equal(missing.status, 'choice-unresolved');
  assert.equal(missing.targets[0].selectedDrawCount, null);
  const wrongLabelsReplay = rawReplay({
    values: ['Draw 3 cards', 'Draw 2 cards', 'Draw 1 card', 'Draw 0 cards']
  });
  const wrongLabels = runMatchingReplay(wrongLabelsReplay);
  assert.equal(wrongLabels.status, 'choice-unresolved');
  assert.equal(wrongLabels.targets[0].selectedDrawCount, null);
});

test('recomputes sanitization from raw replay and rejects a changed decision row with same seed', () => {
  const replay = rawReplay();
  replay.nativeGame.decisionTrace[0].actionName = 'DifferentAction';
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('recomputes the original sanitizer projection from the original raw artifact', () => {
  const originalRaw = rawReplay();
  originalRaw.nativeGame.decisionTrace[0].actionName = 'DifferentOriginalAction';
  refreshTraceDigest(originalRaw);
  assert.throws(() => run(safeArtifact(), rawReplay(), null, originalRaw),
    { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('rejects tampered raw action result when the native decision-trace digest is stale', () => {
  const replay = rawReplay();
  replay.nativeGame.decisionTrace[0].actionPayload.fields.result = 0;
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('rejects a changed raw action result even when its raw digest is recomputed', () => {
  const replay = rawReplay();
  replay.nativeGame.decisionTrace[0].actionPayload.fields.result = 0;
  refreshTraceDigest(replay);
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('rejects a non-ResolvePromptAction even when the sanitized replay matches it', () => {
  const replay = rawReplay();
  replay.nativeGame.decisionTrace[0].actionName = 'DifferentAction';
  replay.nativeGame.decisionTrace[0].actionPayload.actionName = 'DifferentAction';
  refreshTraceDigest(replay);
  const matchingOriginal = sanitizeFixtureArtifact(replay);
  assert.throws(() => run(matchingOriginal, replay, null, replay), { code: 'TRACE_REPLAY_ACTION_CLASS_MISMATCH' });
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

test('rejects native prompt allowCancel drift against the sanitized resolver receipt', () => {
  const replay = rawReplay();
  replay.nativeGame.decisionTrace[0].fullStateBefore.prompts[0].fields.options.allowCancel = true;
  refreshTraceDigest(replay);
  assert.throws(() => runMatchingReplay(replay), { code: 'TRACE_REPLAY_PROMPT_OPTIONS_MISMATCH' });
});

test('rejects allowCancel=true even when the sanitized resolver receipt agrees', () => {
  const replay = rawReplay({ allowCancel: true });
  const matchingOriginal = sanitizeFixtureArtifact(replay);
  assert.throws(() => run(matchingOriginal, replay, null, replay), { code: 'TRACE_REPLAY_PROMPT_OPTIONS_MISMATCH' });
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
  refreshTraceDigest(replay);
  const result = runMatchingReplay(replay);
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
    originalSanitized: safeArtifact(), originalRaw: replay, replayRaw: replay,
    sanitizerIdentity
  }), { code: 'TRACE_REPLAY_SANITIZER_REQUIRED' });
  assert.throws(() => analyzeTraceReplay({
    originalSanitized: safeArtifact(), originalRaw: replay, replayRaw: replay,
    sanitizeFixtureArtifact, sanitizerIdentity: {
      researchRevisionSha: 'a'.repeat(40), sanitizerBlobSha: '8'.repeat(40),
      twinleafCommitSha: '3'.repeat(40)
    }
  }), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('verifies exact sanitizer path, clean Git blob, research revision and Twinleaf pin', () => {
  const repo = makeSanitizerRepo();
  try {
    const metadata = rawSanitizerMetadata(repo);
    const identity = verifySanitizerCheckout(repo.sanitizerPath, metadata);
    assert.deepEqual(identity, {
      researchRevisionSha: repo.head,
      sanitizerBlobSha: repo.blob,
      twinleafCommitSha: repo.submoduleCommitSha
    });
  } finally {
    repo.cleanup();
  }
});

test('rejects a dirty sanitizer working-tree file', () => {
  const repo = makeSanitizerRepo();
  try {
    fs.appendFileSync(repo.sanitizerPath, '// uncommitted change\n');
    assert.throws(() => verifySanitizerCheckout(
      repo.sanitizerPath, rawSanitizerMetadata(repo)
    ), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
  } finally {
    repo.cleanup();
  }
});

test('rejects a sanitizer module outside the exact expected repository path', () => {
  const repo = makeSanitizerRepo();
  try {
    const otherPath = path.join(repo.root, 'other-sanitizer.cjs');
    fs.writeFileSync(otherPath, 'module.exports = {};\n');
    assert.throws(() => verifySanitizerCheckout(
      otherPath, rawSanitizerMetadata(repo)
    ), { code: 'TRACE_REPLAY_SANITIZER_PATH_INVALID' });
  } finally {
    repo.cleanup();
  }
});

test('rejects mismatched raw trial research and Twinleaf pins', () => {
  const repo = makeSanitizerRepo();
  try {
    const wrongResearch = rawSanitizerMetadata(repo);
    wrongResearch.trial.researchRevisionSha = 'f'.repeat(40);
    assert.throws(() => verifySanitizerCheckout(repo.sanitizerPath, wrongResearch),
      { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
    const wrongVendor = rawSanitizerMetadata(repo);
    wrongVendor.trial.vendorCommitSha = 'f'.repeat(40);
    assert.throws(() => verifySanitizerCheckout(repo.sanitizerPath, wrongVendor),
      { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
  } finally {
    repo.cleanup();
  }
});

test('rejects an engine Twinleaf pin that differs from the checkout submodule gitlink', () => {
  const repo = makeSanitizerRepo();
  try {
    const wrongEnginePin = rawSanitizerMetadata(repo, 'f'.repeat(40));
    assert.throws(() => verifySanitizerCheckout(repo.sanitizerPath, wrongEnginePin),
      { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
  } finally {
    repo.cleanup();
  }
});
