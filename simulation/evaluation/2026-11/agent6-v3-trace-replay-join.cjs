'use strict';

/**
 * Offline-only deterministic replay joiner for the first V3 natural-terminal trace.
 * Inputs are the original sanitized artifact, original decrypted private raw artifact,
 * replay decrypted private raw artifact, and exact-revision sanitizer module.
 * Both raw traces must be authenticated private artifacts from the same exact run
 * revision; never run this on a public/shared machine or emit raw state.
 */
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const TARGET_EFFECT = 'WANT_TO_DRAW_CARDS';
const SANITIZER_RELATIVE_PATH = 'simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs';
const TWINLEAF_SUBMODULE_PATH = 'vendor/twinleaf';
const DRAW_LABEL = /^Draw\s+(\d+)\s+card\(s\)$/i;

function stableJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableJson).join(',') + ']';
  return '{' + Object.keys(value).sort().map(key =>
    JSON.stringify(key) + ':' + stableJson(value[key])).join(',') + '}';
}

function at(object, dottedPath) {
  return dottedPath.split('.').reduce((value, key) => value?.[key], object);
}

function requirePresent(value, label) {
  if (value === null || value === undefined || value === '') {
    const error = new Error('replay binding missing: ' + label);
    error.code = 'TRACE_REPLAY_BINDING_MISSING';
    throw error;
  }
}

function requireEqual(left, right, label) {
  if (stableJson(left) !== stableJson(right)) {
    const error = new Error('replay binding mismatch: ' + label);
    error.code = 'TRACE_REPLAY_BINDING_MISMATCH';
    throw error;
  }
}

function validateWorkerAudit(artifact, label) {
  const audit = artifact.workerExecutionAudit;
  if (!audit || audit.completed !== true || audit.replayableEvidence !== true ||
      audit.cleanupVerified !== true || audit.cleanupFailureCount !== 0 ||
      audit.policyRngViolations !== 0) {
    const error = new Error(label + ' worker audit is incomplete, non-replayable, or has cleanup/RNG failures');
    error.code = 'TRACE_REPLAY_WORKER_AUDIT_INVALID';
    throw error;
  }
  for (const role of ['candidate', 'opponent']) {
    const roleAudit = audit.roles?.[role];
    if (!roleAudit || roleAudit.policyDrawCount !== 0 || roleAudit.policyDrawViolationCount !== 0) {
      const error = new Error(label + ' ' + role + ' worker did not prove zero policy RNG draws/violations');
      error.code = 'TRACE_REPLAY_POLICY_RNG_NONZERO';
      throw error;
    }
  }
}

function validateArtifact(artifact, label) {
  if (!artifact || artifact.schema !== 'aichi-v3-actor-observation-sanitized-diagnostic-v1' ||
      artifact.fixtureOnly !== true || artifact.admissionEligible !== false ||
      artifact.competitiveGameQualified !== false) {
    const error = new Error(label + ' is not the expected non-admitting V3 sanitized fixture artifact');
    error.code = 'TRACE_REPLAY_ARTIFACT_INVALID';
    throw error;
  }
  if (artifact.actorOnlyExecutionBoundary?.valid !== true ||
      artifact.game?.finished !== true || artifact.game?.endReason !== 'engine-game-end') {
    const error = new Error(label + ' lacks a valid actor-only boundary or natural engine terminal');
    error.code = 'TRACE_REPLAY_GAME_NOT_ADMISSIBLE';
    throw error;
  }
  validateWorkerAudit(artifact, label);
}

function publicArtifactProjection(value) {
  // Exclude only the two known ephemeral worker-audit fields, never similarly
  // named data in unrelated public parts of the artifact.
  const result = JSON.parse(JSON.stringify(value));
  delete result.workerExecutionAuditSha256;
  for (const role of ['candidate', 'opponent']) {
    if (result.workerExecutionAudit?.roles?.[role]) {
      delete result.workerExecutionAudit.roles[role].containerIdSha256;
    }
  }
  return result;
}

function verifyReplayIdentity(original, replay) {
  validateArtifact(original, 'original sanitized artifact');
  validateArtifact(replay, 'replay sanitized artifact');
  const required = [
    'trial.trialId', 'trial.seed', 'trial.seed32', 'trial.candidateSeat',
    'trial.originalSourceSeat', 'trial.actualFirstPlayerSeat',
    'candidate.printed60Sha256', 'opponent.printed60Sha256',
    'engine.twinleafCommitSha', 'engine.researchRevisionSha', 'engine.nodeVersion',
    'candidatePolicyIdentity', 'opponentPolicyIdentity'
  ];
  for (const key of required) {
    requirePresent(at(original, key), 'original.' + key);
    requirePresent(at(replay, key), 'replay.' + key);
    requireEqual(at(original, key), at(replay, key), key);
  }
  for (const [artifact, label] of [[original, 'original'], [replay, 'replay']]) {
    requireEqual(at(artifact, 'trial.researchRevisionSha'),
      at(artifact, 'engine.researchRevisionSha'), label + ' trial research revision');
    requireEqual(at(artifact, 'trial.vendorCommitSha'),
      at(artifact, 'engine.twinleafCommitSha'), label + ' trial vendor/Twinleaf pin');
  }
  for (const key of [
    'policyPlanSha256', 'runtime.runtimePinUnionSha256',
    'runtime.loadedProcessClosureSha256'
  ]) requireEqual(at(original, key), at(replay, key), key);
  requireEqual(publicArtifactProjection(original), publicArtifactProjection(replay),
    'all sanitized public fields (excluding ephemeral worker container identifiers)');
  requireEqual(original.game, replay.game, 'complete sanitized game trace and summary');
  requireEqual(original.summary, replay.summary, 'sanitized game summary');
  for (const role of ['candidate', 'opponent']) {
    for (const key of ['policyVersion', 'bundleSha256', 'policySha256']) {
      requireEqual(
        original.workerExecutionAudit.roles[role][key],
        replay.workerExecutionAudit.roles[role][key],
        role + ' worker ' + key
      );
    }
  }
}

function handCount(snapshot, seat) {
  const player = snapshot?.players?.find(value => value?.seat === seat);
  if (Number.isSafeInteger(player?.counts?.hand)) return player.counts.hand;
  if (Array.isArray(player?.zones?.hand)) return player.zones.hand.length;
  return null;
}

function promptMessage(prompt) {
  const fields = prompt?.fields ?? {};
  return fields.message ?? fields.text ?? null;
}

function isTargetPrompt(prompt) {
  return promptMessage(prompt) === TARGET_EFFECT;
}

function readPromptValues(prompt) {
  const values = prompt?.extraFields?.values ?? prompt?.fields?.values;
  return Array.isArray(values) ? values : null;
}

function readPromptAllowCancel(prompt) {
  const candidates = [
    prompt?.fields?.options?.allowCancel,
    prompt?.fields?.allowCancel,
    prompt?.extraFields?.options?.allowCancel,
    prompt?.extraFields?.allowCancel
  ];
  return candidates.find(value => typeof value === 'boolean') ?? null;
}

function readPromptResult(prompt) {
  if (Object.prototype.hasOwnProperty.call(prompt?.fields ?? {}, 'result')) {
    return prompt.fields.result;
  }
  if (Object.prototype.hasOwnProperty.call(prompt?.extraFields ?? {}, 'result')) {
    return prompt.extraFields.result;
  }
  return undefined;
}

function parseDescendingDrawValues(values) {
  if (!Array.isArray(values) || values.length === 0) return null;
  const drawCounts = [];
  for (const value of values) {
    if (typeof value !== 'string') return null;
    const match = DRAW_LABEL.exec(value);
    if (!match) return null;
    const count = Number(match[1]);
    if (!Number.isSafeInteger(count) || count < 0) return null;
    drawCounts.push(count);
  }
  if (drawCounts[drawCounts.length - 1] !== 0) return null;
  for (let index = 1; index < drawCounts.length; index++) {
    if (drawCounts[index] !== drawCounts[0] - index) return null;
  }
  return drawCounts;
}

function findRawPrompt(row) {
  const prompts = row?.fullStateBefore?.prompts;
  if (!Array.isArray(prompts)) return null;
  const id = row.pendingPromptId;
  if (id !== null && id !== undefined) {
    const matches = prompts.filter(prompt => prompt?.id === id);
    return matches.length === 1 ? matches[0] : null;
  }
  const pending = prompts.filter(prompt =>
    prompt?.pending === true && prompt?.promptType === 'SelectPrompt');
  return pending.length === 1 ? pending[0] : null;
}

function findRawPromptAfter(row, promptId) {
  const prompts = row?.fullStateAfter?.prompts;
  if (!Array.isArray(prompts)) {
    const error = new Error('raw replay has no after-dispatch prompt snapshot');
    error.code = 'TRACE_REPLAY_PROMPT_AFTER_MISSING';
    throw error;
  }
  const matches = prompts.filter(prompt => prompt?.id === promptId);
  if (matches.length > 1) {
    const error = new Error('raw replay has duplicate after-dispatch prompt IDs');
    error.code = 'TRACE_REPLAY_PROMPT_AFTER_AMBIGUOUS';
    throw error;
  }
  return matches[0] ?? null;
}

function unresolvedTarget(safeRow, reason, extra = {}) {
  return {
    actionOrdinal: safeRow.actionOrdinal,
    actingSeat: safeRow.actingSeat,
    turnBefore: safeRow.turnBefore,
    promptType: 'SelectPrompt',
    promptEffect: TARGET_EFFECT,
    selectedDrawCount: null,
    confidence: reason,
    sourceClass: 'original-raw-native-trace-with-replay-digest-match',
    ...extra
  };
}

function verifyRawDecisionTrace(rawArtifact, label) {
  const rawGame = rawArtifact?.nativeGame ?? rawArtifact?.fixtureGamePartial ?? {};
  if (!Array.isArray(rawGame.decisionTrace)) {
    const error = new Error(label + ' raw artifact has no native decision trace');
    error.code = 'TRACE_REPLAY_RAW_TRACE_MISSING';
    throw error;
  }
  const computedSha256 = createHash('sha256')
    .update(stableJson(rawGame.decisionTrace), 'utf8').digest('hex');
  requireEqual(rawGame.decisionTraceSha256, computedSha256,
    label + ' native decision trace digest');
  requireEqual(rawArtifact?.trial?.decisionTraceSha256, computedSha256,
    label + ' raw trial decision trace digest');
  return { rawGame, decisionTraceSha256: computedSha256 };
}

function verifySanitizerCheckout(modulePath, rawArtifact) {
  let absolutePath;
  try {
    absolutePath = fs.realpathSync(modulePath);
  } catch {
    const error = new Error('exact-revision sanitizer module does not exist');
    error.code = 'TRACE_REPLAY_SANITIZER_MODULE_MISSING';
    throw error;
  }

  let repositoryRoot;
  try {
    repositoryRoot = execFileSync('git', [
      '-C', path.dirname(absolutePath), 'rev-parse', '--show-toplevel'
    ], { encoding: 'utf8' }).trim();
  } catch {
    const error = new Error('sanitizer module must be inside an accessible Git checkout');
    error.code = 'TRACE_REPLAY_SANITIZER_GIT_REQUIRED';
    throw error;
  }

  const relativePath = path.relative(repositoryRoot, absolutePath)
    .split(path.sep).join('/');
  if (relativePath !== SANITIZER_RELATIVE_PATH) {
    const error = new Error('the exact V3 diagnostic sanitizer module path is required');
    error.code = 'TRACE_REPLAY_SANITIZER_PATH_INVALID';
    throw error;
  }
  if (!relativePath || relativePath === '..' || relativePath.startsWith('../') ||
      path.isAbsolute(relativePath)) {
    const error = new Error('sanitizer module must be inside its Git checkout');
    error.code = 'TRACE_REPLAY_SANITIZER_PATH_INVALID';
    throw error;
  }

  let head;
  let committedBlob;
  let workingBlob;
  let twinleafGitlinkSha;
  try {
    head = execFileSync('git', ['-C', repositoryRoot, 'rev-parse', 'HEAD'],
      { encoding: 'utf8' }).trim();
    committedBlob = execFileSync('git', ['-C', repositoryRoot, 'rev-parse',
      'HEAD:' + relativePath], { encoding: 'utf8' }).trim();
    workingBlob = execFileSync('git', ['-C', repositoryRoot, 'hash-object', '--',
      relativePath], { cwd: repositoryRoot, encoding: 'utf8' }).trim();
    twinleafGitlinkSha = execFileSync('git', ['-C', repositoryRoot, 'rev-parse',
      'HEAD:' + TWINLEAF_SUBMODULE_PATH], { encoding: 'utf8' }).trim();
  } catch {
    const error = new Error('could not verify sanitizer revision and committed blob');
    error.code = 'TRACE_REPLAY_SANITIZER_GIT_IDENTITY_FAILED';
    throw error;
  }

  requirePresent(rawArtifact?.engine?.researchRevisionSha, 'raw.engine.researchRevisionSha');
  requireEqual(head, rawArtifact.engine.researchRevisionSha,
    'sanitizer checkout vs raw research revision');
  requireEqual(rawArtifact?.trial?.researchRevisionSha, head,
    'raw trial research revision');
  requireEqual(rawArtifact?.trial?.vendorCommitSha, rawArtifact?.engine?.twinleafCommitSha,
    'raw trial vendor commit vs engine Twinleaf pin');
  requireEqual(workingBlob, committedBlob, 'sanitizer source is unmodified');
  requireEqual(twinleafGitlinkSha, rawArtifact?.engine?.twinleafCommitSha,
    'checkout Twinleaf gitlink vs raw engine pin');

  return {
    researchRevisionSha: head,
    sanitizerBlobSha: committedBlob,
    twinleafCommitSha: twinleafGitlinkSha
  };
}

function analyzeTargetRow(rawGame, safeRow) {
  const rows = rawGame.decisionTrace.filter(row => row?.actionOrdinal === safeRow.actionOrdinal);
  if (rows.length !== 1) {
    const error = new Error('raw replay does not contain one unique action ordinal ' + safeRow.actionOrdinal);
    error.code = 'TRACE_REPLAY_ACTION_ORDINAL_NOT_UNIQUE';
    throw error;
  }
  const rawRow = rows[0];
  if (rawRow.actingSeat !== safeRow.actingSeat || rawRow.turnBefore !== safeRow.turnBefore ||
      rawRow.pendingPromptType !== 'SelectPrompt' || safeRow.pendingPromptType !== 'SelectPrompt' ||
      (rawRow.actionName ?? null) !== (safeRow.actionName ?? null) ||
      (rawRow.actionType ?? null) !== (safeRow.actionType ?? null) ||
      rawRow.dispatchStatus !== safeRow.dispatchStatus) {
    const error = new Error('raw replay action ordinal/seat/turn/prompt/action/dispatch cross-check failed');
    error.code = 'TRACE_REPLAY_ROW_BINDING_MISMATCH';
    throw error;
  }
  if (rawRow.actionName !== 'ResolvePromptAction' ||
      safeRow.actionName !== 'ResolvePromptAction' ||
      (rawRow.actionPayload?.actionName !== undefined &&
       rawRow.actionPayload.actionName !== 'ResolvePromptAction')) {
    const error = new Error('target draw prompt was not resolved by the native ResolvePromptAction class');
    error.code = 'TRACE_REPLAY_ACTION_CLASS_MISMATCH';
    throw error;
  }
  const safePromptId = safeRow.promptContext?.promptId;
  if (safePromptId !== null && safePromptId !== undefined &&
      rawRow.pendingPromptId !== safePromptId) {
    const error = new Error('raw replay prompt ID differs from the sanitized decision row');
    error.code = 'TRACE_REPLAY_ROW_BINDING_MISMATCH';
    throw error;
  }

  const promptBefore = findRawPrompt(rawRow);
  if (!promptBefore || promptBefore.promptType !== 'SelectPrompt') {
    const error = new Error('raw replay does not contain the matching native SelectPrompt snapshot');
    error.code = 'TRACE_REPLAY_PROMPT_NOT_FOUND';
    throw error;
  }
  if (promptBefore.pending !== true) {
    const error = new Error('target prompt was not pending immediately before dispatch');
    error.code = 'TRACE_REPLAY_PROMPT_NOT_PENDING';
    throw error;
  }
  if (!isTargetPrompt(promptBefore)) return null;
  if (promptBefore.id === null || promptBefore.id === undefined) {
    const error = new Error('target prompt snapshot has no stable native prompt ID');
    error.code = 'TRACE_REPLAY_PROMPT_ID_MISSING';
    throw error;
  }
  if (rawRow.dispatchStatus !== 'succeeded' || !rawRow.fullStateAfter) {
    const error = new Error('target draw prompt did not have a successful dispatch and following snapshot');
    error.code = 'TRACE_REPLAY_PROMPT_NOT_ACCEPTED';
    throw error;
  }

  const allowCancel = readPromptAllowCancel(promptBefore);
  if (allowCancel !== false) {
    const error = new Error('target draw prompt did not prove allowCancel=false');
    error.code = 'TRACE_REPLAY_PROMPT_OPTIONS_MISMATCH';
    throw error;
  }
  const safeAllowCancel = safeRow.promptContext?.allowCancel;
  if (typeof safeAllowCancel === 'boolean' && safeAllowCancel !== allowCancel) {
    const error = new Error('sanitized and native prompt allowCancel values differ');
    error.code = 'TRACE_REPLAY_PROMPT_OPTIONS_MISMATCH';
    throw error;
  }
  const resolverAllowCancel = rawRow.promptResolverContext?.availableOptions?.allowCancel;
  if (typeof resolverAllowCancel === 'boolean' && resolverAllowCancel !== allowCancel) {
    const error = new Error('native resolver and prompt allowCancel values differ');
    error.code = 'TRACE_REPLAY_PROMPT_OPTIONS_MISMATCH';
    throw error;
  }

  const values = readPromptValues(promptBefore);
  const drawCounts = parseDescendingDrawValues(values);
  if (!drawCounts) {
    return unresolvedTarget(safeRow, 'native-draw-option-values-unavailable-or-invalid', {
      allowCancel,
      nativeOptionCount: Array.isArray(values) ? values.length : null
    });
  }

  const disabled = promptBefore.fields?.options?.disabled ??
    promptBefore.extraFields?.options?.disabled ?? [];
  if (!Array.isArray(disabled) || disabled.some(value => typeof value !== 'boolean') ||
      disabled.some(value => value === true)) {
    return unresolvedTarget(safeRow, 'native-disabled-options-present-or-invalid', {
      allowCancel,
      nativeOptionCount: values.length
    });
  }

  const choiceIndex = rawRow.actionPayload?.fields?.result;
  if (!Number.isSafeInteger(choiceIndex) || choiceIndex < 0) {
    return unresolvedTarget(safeRow, 'native-choice-index-unavailable', {
      allowCancel,
      nativeOptionCount: values.length
    });
  }
  if (choiceIndex >= values.length) {
    const error = new Error('native ResolvePromptAction result is outside the original prompt.values index range');
    error.code = 'TRACE_REPLAY_CHOICE_INDEX_INVALID';
    throw error;
  }

  const promptAfter = findRawPromptAfter(rawRow, promptBefore.id);
  let afterResult;
  if (promptAfter) {
    if (promptAfter.promptType !== 'SelectPrompt' || promptAfter.pending !== false) {
      const error = new Error('the same native prompt remained pending after dispatch');
      error.code = 'TRACE_REPLAY_PROMPT_NOT_RESOLVED';
      throw error;
    }
    if (!isTargetPrompt(promptAfter)) {
      const error = new Error('the resolved prompt no longer has the exact target effect identity');
      error.code = 'TRACE_REPLAY_PROMPT_IDENTITY_CHANGED';
      throw error;
    }
    afterResult = readPromptResult(promptAfter);
    if (!Number.isSafeInteger(afterResult) || afterResult !== choiceIndex) {
      const error = new Error('after-dispatch prompt result does not equal the native action choice index');
      error.code = 'TRACE_REPLAY_PROMPT_RESULT_MISMATCH';
      throw error;
    }
  }

  const beforeHandCount = handCount(rawRow.fullStateBefore, safeRow.actingSeat);
  const afterHandCount = handCount(rawRow.fullStateAfter, safeRow.actingSeat);
  const handCountDelta = beforeHandCount !== null && afterHandCount !== null ?
    afterHandCount - beforeHandCount : null;
  const selectedDrawCount = handCountDelta !== null &&
    handCountDelta === drawCounts[choiceIndex] ? drawCounts[choiceIndex] : null;
  const confidence = handCountDelta === null ? 'hand-count-delta-unavailable' :
    selectedDrawCount !== null ? 'native-choice-index-and-hand-delta-agree' :
    'native-choice-index-and-hand-delta-disagree';

  return {
    actionOrdinal: safeRow.actionOrdinal,
    actingSeat: safeRow.actingSeat,
    turnBefore: safeRow.turnBefore,
    promptType: 'SelectPrompt',
    promptEffect: TARGET_EFFECT,
    promptIdentityField: promptBefore.fields?.message === TARGET_EFFECT ? 'message' : 'text',
    optionCounts: { nativeValues: values.length },
    safeOptionLabels: drawCounts.map((drawCount, index) => ({ choiceIndex: index, drawCount })),
    allowCancel,
    choiceIndex,
    promptAfterPresent: promptAfter !== null,
    promptAfterResult: promptAfter ? afterResult : null,
    handCountBefore: beforeHandCount,
    handCountAfter: afterHandCount,
    handCountDelta,
    selectedDrawCount,
    confidence,
    sourceClass: 'original-raw-native-trace-with-replay-digest-match'
  };
}

function analyzeTraceReplay({
  originalSanitized, originalRaw, replayRaw, sanitizeFixtureArtifact,
  sanitizerIdentity, actionOrdinal = null
} = {}) {
  if (!originalSanitized || !originalRaw || !replayRaw) {
    throw new TypeError('original sanitized artifact, original raw artifact and replay raw artifact are required');
  }
  if (typeof sanitizeFixtureArtifact !== 'function') {
    const error = new Error('the exact-revision sanitizeFixtureArtifact function is required');
    error.code = 'TRACE_REPLAY_SANITIZER_REQUIRED';
    throw error;
  }
  if (!sanitizerIdentity?.researchRevisionSha || !sanitizerIdentity?.sanitizerBlobSha ||
      !sanitizerIdentity?.twinleafCommitSha) {
    const error = new Error('verified sanitizer revision and blob identity are required');
    error.code = 'TRACE_REPLAY_SANITIZER_IDENTITY_REQUIRED';
    throw error;
  }

  for (const [rawArtifact, label] of [[originalRaw, 'original raw'], [replayRaw, 'replay raw']]) {
    requireEqual(rawArtifact?.engine?.researchRevisionSha, sanitizerIdentity.researchRevisionSha,
      label + ' research revision vs exact sanitizer checkout');
    requireEqual(rawArtifact?.engine?.twinleafCommitSha, sanitizerIdentity.twinleafCommitSha,
      label + ' Twinleaf pin vs exact checkout gitlink');
    requireEqual(rawArtifact?.trial?.researchRevisionSha, rawArtifact?.engine?.researchRevisionSha,
      label + ' trial research revision');
    requireEqual(rawArtifact?.trial?.vendorCommitSha, rawArtifact?.engine?.twinleafCommitSha,
      label + ' trial vendor/Twinleaf pin');
  }

  const sanitizedOriginalFromRaw = sanitizeFixtureArtifact(originalRaw);
  const replaySanitized = sanitizeFixtureArtifact(replayRaw);
  if (!sanitizedOriginalFromRaw || typeof sanitizedOriginalFromRaw !== 'object' ||
      !replaySanitized || typeof replaySanitized !== 'object') {
    const error = new Error('exact sanitizer did not return both sanitized artifacts');
    error.code = 'TRACE_REPLAY_SANITIZER_OUTPUT_INVALID';
    throw error;
  }
  verifyReplayIdentity(originalSanitized, sanitizedOriginalFromRaw);
  verifyReplayIdentity(originalSanitized, replaySanitized);

  const originalTrace = verifyRawDecisionTrace(originalRaw, 'original');
  const replayTrace = verifyRawDecisionTrace(replayRaw, 'replay');
  requireEqual(originalTrace.decisionTraceSha256, replayTrace.decisionTraceSha256,
    'original vs replay native decision trace digest');

  const originalRawGame = originalTrace.rawGame;
  const replayRawGame = replayTrace.rawGame;
  for (const [rawGame, sanitized, label] of [
    [originalRawGame, sanitizedOriginalFromRaw, 'original'],
    [replayRawGame, replaySanitized, 'replay']
  ]) {
    requireEqual(rawGame.seed, sanitized.trial.seed, label + ' native game physical seed');
    requireEqual(rawGame.seed32, sanitized.trial.seed32, label + ' native game seed32');
    requireEqual(rawGame.candidateSeat, sanitized.trial.candidateSeat, label + ' native game candidate seat');
    requireEqual(rawGame.originalSourceSeat, sanitized.trial.originalSourceSeat, label + ' native game source seat');
    requireEqual(rawGame.actualFirstPlayerSeat, sanitized.trial.actualFirstPlayerSeat,
      label + ' native game actual first-player seat');
  }

  let candidates = originalSanitized.game.actorDecisions.filter(row =>
    row?.pendingPromptType === 'SelectPrompt' && row?.promptContext?.promptType === 'SelectPrompt');
  if (actionOrdinal !== null) candidates = candidates.filter(row => row.actionOrdinal === actionOrdinal);
  const targets = [];
  for (const row of candidates) {
    const originalTarget = analyzeTargetRow(originalRawGame, row);
    const replayTarget = analyzeTargetRow(replayRawGame, row);
    requireEqual(originalTarget, replayTarget, 'original/replay target row reconstruction');
    if (originalTarget) targets.push(originalTarget);
  }
  return {
    schema: 'agent6-v3-trace-replay-join-v4',
    status: targets.length === 0 ? 'not-exercised' :
      targets.every(target => target.selectedDrawCount !== null) ? 'trace-confirmed' : 'choice-unresolved',
    replayIdentityVerified: true,
    originalRawTraceDigestVerified: true,
    replayRawTraceDigestVerified: true,
    rawTraceIdentityVerified: true,
    rawDecisionTraceSha256: originalTrace.decisionTraceSha256,
    sanitizerRevisionVerified: true,
    sanitizerIdentity,
    originalRawTraceSupplied: true,
    replayConfirmsOriginalRawTrace: true,
    competitiveEvidence: false,
    targetPrompt: TARGET_EFFECT,
    targetCount: targets.length,
    targets
  };
}

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

function main(argv = process.argv.slice(2)) {
  const [originalSanitizedPath, originalRawPath, replayRawPath, sanitizerModulePath, ordinalText] = argv;
  if (!originalSanitizedPath || !originalRawPath || !replayRawPath || !sanitizerModulePath ||
      argv.length > 5 || (ordinalText !== undefined && !/^\d+$/.test(ordinalText))) {
    throw new Error('usage: node agent6-v3-trace-replay-join.cjs <original-sanitized.json> <original-decrypted-raw.json> <replay-decrypted-raw.json> <exact-revision-sanitizer-module.cjs> [actionOrdinal]');
  }
  const originalSanitized = readJson(originalSanitizedPath);
  const originalRaw = readJson(originalRawPath);
  const replayRaw = readJson(replayRawPath);
  const originalSanitizerIdentity = verifySanitizerCheckout(sanitizerModulePath, originalRaw);
  const replaySanitizerIdentity = verifySanitizerCheckout(sanitizerModulePath, replayRaw);
  requireEqual(originalSanitizerIdentity.researchRevisionSha, replaySanitizerIdentity.researchRevisionSha,
    'original/replay sanitizer research revision');
  requireEqual(originalSanitizerIdentity.sanitizerBlobSha, replaySanitizerIdentity.sanitizerBlobSha,
    'original/replay sanitizer blob');
  requireEqual(originalSanitizerIdentity.twinleafCommitSha, replaySanitizerIdentity.twinleafCommitSha,
    'original/replay Twinleaf gitlink');
  const sanitizerModule = require(fs.realpathSync(sanitizerModulePath));
  const result = analyzeTraceReplay({
    originalSanitized,
    originalRaw,
    replayRaw,
    sanitizeFixtureArtifact: sanitizerModule.sanitizeFixtureArtifact,
    sanitizerIdentity: originalSanitizerIdentity,
    actionOrdinal: ordinalText === undefined ? null : Number(ordinalText)
  });
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  return result;
}

if (require.main === module) {
  try { main(); }
  catch (error) {
    process.stderr.write((error?.code ? error.code + ': ' : '') + String(error?.message ?? error) + '\n');
    process.exitCode = 1;
  }
}

module.exports = { analyzeTraceReplay, verifyReplayIdentity, validateWorkerAudit, verifySanitizerCheckout, verifyRawDecisionTrace, parseDescendingDrawValues, stableJson };
