'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeTraceReplay } = require('../../simulation/evaluation/2026-11/agent6-v3-trace-replay-join.cjs');

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

function safeArtifact() {
  const row = {
    actionOrdinal: 4, actingSeat: 0, turnBefore: 0,
    pendingPromptType: 'SelectPrompt', isRootDecision: false,
    actionName: 'ResolvePromptAction', actionType: 'resolve-prompt',
    dispatchStatus: 'succeeded',
    promptContext: { promptId: 'prompt-1', promptType: 'SelectPrompt',
      optionCounts: { options: 2 }, allowCancel: false }
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
    candidate: { printed60Sha256: '1'.repeat(64) },
    opponent: { printed60Sha256: '2'.repeat(64) },
    engine: { twinleafCommitSha: '3'.repeat(40), researchRevisionSha: '4'.repeat(40), nodeVersion: 'v22.0.0' },
    trial: { trialId: 'trial-1', seed: 'public-seed', seed32: 123,
      candidateSeat: 0, originalSourceSeat: 1, actualFirstPlayerSeat: 0 },
    candidatePolicyIdentity: { policyVersion: 'candidate-v1', bundleSha256: 'b'.repeat(64) },
    opponentPolicyIdentity: { policyVersion: 'opponent-v1', bundleSha256: 'b'.repeat(64) },
    policyPlanSha256: '5'.repeat(64),
    runtime: { runtimePinUnionSha256: '6'.repeat(64), loadedProcessClosureSha256: '7'.repeat(64) },
    game, summary: { actionCount: 15, actorDecisionsSha256: game.actorDecisionsSha256 }
  };
}

function rawReplay({ target = true, choice = 2, handAfter = 9 } = {}) {
  const safe = safeArtifact();
  const prompt = {
    promptType: 'SelectPrompt', id: 'prompt-1', pending: false,
    fields: { message: target ? 'WANT_TO_DRAW_CARDS' : 'OTHER_EFFECT',
      options: ['Draw 1 card', 'Draw 2 cards'], allowCancel: false, result: choice },
    extraFields: {}
  };
  const row = {
    actionOrdinal: 4, actingSeat: 0, turnBefore: 0,
    pendingPromptType: 'SelectPrompt', pendingPromptId: 'prompt-1',
    actionName: 'ResolvePromptAction', actionType: 'resolve-prompt',
    dispatchStatus: 'succeeded', actionPayload: { fields: { value: choice, promptId: 'opaque-prompt-token' } },
    promptResolution: { kind: 'select', value: choice },
    promptResolverContext: { availableOptions: { options: ['Draw 1 card', 'Draw 2 cards'], allowCancel: false } },
    fullStateBefore: { players: [{ seat: 0, counts: { hand: 7 } }], prompts: [prompt] },
    fullStateAfter: { players: [{ seat: 0, counts: { hand: handAfter } }], prompts: [prompt] }
  };
  return { safe, fixtureOnly: true, nativeGame: { seed: 'public-seed', seed32: 123,
    candidateSeat: 0, originalSourceSeat: 1, actualFirstPlayerSeat: 0, decisionTrace: [row] } };
}

function run(original = safeArtifact(), replay = rawReplay(), actionOrdinal = null) {
  return analyzeTraceReplay({ originalSanitized: original, replayRaw: replay,
    actionOrdinal, sanitizeFixtureArtifact: raw => raw.safe });
}

test('reconstructs the draw count only when action value and accepted hand delta agree', () => {
  const result = run();
  assert.equal(result.status, 'reconstructed');
  assert.equal(result.replayIdentityVerified, true);
  assert.equal(result.competitiveEvidence, false);
  assert.equal(result.targets.length, 1);
  assert.equal(result.targets[0].promptEffect, 'WANT_TO_DRAW_CARDS');
  assert.equal(result.targets[0].selectedDrawCount, 2);
  assert.equal(result.targets[0].handCountDelta, 2);
  assert.equal(result.targets[0].confidence, 'choice-value-and-hand-delta-agree');
});

test('marks a game with no target prompt as not exercised', () => {
  const result = run(safeArtifact(), rawReplay({ target: false }));
  assert.equal(result.status, 'not-exercised');
  assert.equal(result.targetCount, 0);
});

test('does not infer a choice from hand delta alone', () => {
  const result = run(safeArtifact(), rawReplay({ choice: 'opaque-token', handAfter: 9 }));
  assert.equal(result.status, 'choice-unresolved');
  assert.equal(result.targets[0].selectedDrawCount, null);
  assert.equal(result.targets[0].confidence, 'hand-delta-only-choice-unresolved');
});

test('supports a zero-card choice when the accepted hand delta is also zero', () => {
  const result = run(safeArtifact(), rawReplay({ choice: 0, handAfter: 7 }));
  assert.equal(result.status, 'reconstructed');
  assert.equal(result.targets[0].selectedDrawCount, 0);
  assert.equal(result.targets[0].handCountDelta, 0);
});

test('rejects a replay with a different physical seed', () => {
  const replay = rawReplay();
  replay.safe.trial.seed = 'different-seed';
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('rejects nonzero policy RNG draws even when sanitized game digests match', () => {
  const replay = rawReplay();
  replay.safe.workerExecutionAudit.roles.opponent.policyDrawCount = 1;
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_POLICY_RNG_NONZERO' });
});

test('rejects a sanitized game-trace mismatch', () => {
  const replay = rawReplay();
  replay.safe.game.actorDecisionsSha256 = 'f'.repeat(64);
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('rejects a mismatch in a surviving public field outside the game summary', () => {
  const replay = rawReplay();
  replay.safe.quickBallAudit = { quickBallRootsAccepted: 1 };
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_BINDING_MISMATCH' });
});

test('allows only ephemeral container identifiers to differ', () => {
  const original = safeArtifact();
  const replay = rawReplay();
  original.workerExecutionAudit.roles.candidate.containerIdSha256 = 'a'.repeat(64);
  replay.safe.workerExecutionAudit.roles.candidate.containerIdSha256 = 'b'.repeat(64);
  original.workerExecutionAuditSha256 = 'c'.repeat(64);
  replay.safe.workerExecutionAuditSha256 = 'd'.repeat(64);
  const result = run(original, replay);
  assert.equal(result.replayIdentityVerified, true);
});

test('rejects an invalid actor-only boundary', () => {
  const replay = rawReplay();
  replay.safe.actorOnlyExecutionBoundary.valid = false;
  assert.throws(() => run(safeArtifact(), replay), { code: 'TRACE_REPLAY_GAME_NOT_ADMISSIBLE' });
});

test('output contains no raw card identities or opaque prompt tokens', () => {
  const replay = rawReplay();
  replay.nativeGame.decisionTrace[0].actionPayload.fields.privateCard = 'Secret Card ABC';
  replay.nativeGame.decisionTrace[0].actionPayload.fields.token = 'opaque-secret-token';
  const result = run(safeArtifact(), replay);
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes('Secret Card ABC'), false);
  assert.equal(serialized.includes('opaque-secret-token'), false);
  assert.equal(serialized.includes('opaque-prompt-token'), false);
});
