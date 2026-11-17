'use strict';

/**
 * Offline-only deterministic replay joiner for the first V3 natural-terminal trace.
 * Input 1 is the original sanitized artifact; input 2 is an offline-decrypted
 * full replay artifact. Never run this on a public/shared machine or emit raw
 * prompt, card, token, seed, hand, deck, Prize, or state data.
 */
const fs = require('node:fs');

const TARGET_EFFECT = 'WANT_TO_DRAW_CARDS';
const OPTION_ARRAY_KEYS = [
  'options', 'choices', 'cards', 'targets', 'availableCards',
  'eligibleCards', 'selectedCards'
];
const SAFE_CHOICE_KEY = /^(?:result|choice|choiceIndex|selectedIndex|index|count|amount|drawCount|cardsToDraw|numberOfCards|value|selectedValue)$/i;
const SAFE_LABEL = /^(?:\d+|(?:draw|take)\s+\d+\s+cards?)$/i;

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
  if (Array.isArray(value)) return value.map(publicArtifactProjection);
  if (!value || typeof value !== 'object') return value;
  const result = {};
  for (const [key, child] of Object.entries(value)) {
    // Docker container IDs are intentionally ephemeral across otherwise identical replays.
    if (key === 'containerIdSha256' || key === 'workerExecutionAuditSha256') continue;
    result[key] = publicArtifactProjection(child);
  }
  return result;
}

function verifyReplayIdentity(original, replay) {
  validateArtifact(original, 'original sanitized artifact');
  validateArtifact(replay, 're-sanitized replay artifact');
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

function findExactStringPaths(value, target, basePath = '', output = [], depth = 0) {
  if (depth > 8 || value === null || value === undefined) return output;
  if (typeof value === 'string') {
    if (value === target || value.includes(target)) output.push(basePath || '$');
    return output;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => findExactStringPaths(item, target,
      basePath + '[' + index + ']', output, depth + 1));
  } else if (typeof value === 'object') {
    for (const key of Object.keys(value)) {
      findExactStringPaths(value[key], target,
        basePath ? basePath + '.' + key : key, output, depth + 1);
    }
  }
  return output;
}

function safeScalar(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  if (typeof value === 'string' && SAFE_LABEL.test(value)) return value;
  return undefined;
}

function safeOptionSummary(prompt) {
  const counts = {};
  const labels = [];
  for (const source of ['fields', 'extraFields']) {
    const fields = prompt?.[source] ?? {};
    for (const key of OPTION_ARRAY_KEYS) {
      if (!Array.isArray(fields[key])) continue;
      counts[source + '.' + key] = fields[key].length;
      for (const option of fields[key]) {
        const direct = safeScalar(option);
        if (direct !== undefined) labels.push(direct);
        else if (option && typeof option === 'object') {
          for (const labelKey of ['label', 'text', 'value', 'count', 'amount']) {
            const candidate = safeScalar(option[labelKey]);
            if (candidate !== undefined) { labels.push(candidate); break; }
          }
        }
      }
    }
  }
  return { optionCounts: counts, safeOptionLabels: [...new Set(labels)] };
}

function collectChoiceEvidence(value, source, output = [], depth = 0) {
  if (!value || typeof value !== 'object' || depth > 5) return output;
  for (const [key, child] of Object.entries(value)) {
    if (SAFE_CHOICE_KEY.test(key)) {
      const safe = safeScalar(child);
      if (safe !== undefined) output.push({ source, key, value: safe });
    }
    if (child && typeof child === 'object') collectChoiceEvidence(child, source, output, depth + 1);
  }
  return output;
}

function handCount(snapshot, seat) {
  const player = snapshot?.players?.find(value => value?.seat === seat);
  if (Number.isSafeInteger(player?.counts?.hand)) return player.counts.hand;
  if (Array.isArray(player?.zones?.hand)) return player.zones.hand.length;
  return null;
}

function findRawPrompt(row) {
  const prompts = row?.fullStateBefore?.prompts;
  if (!Array.isArray(prompts)) return null;
  const id = row.pendingPromptId;
  if (id !== null && id !== undefined) {
    const matches = prompts.filter(prompt => prompt?.id === id);
    if (matches.length === 1) return matches[0];
  }
  // Prompt IDs are a secondary join key; action ordinal/seat/turn/type are primary.
  const pending = prompts.filter(prompt =>
    prompt?.pending === true && prompt?.promptType === 'SelectPrompt');
  return pending.length === 1 ? pending[0] : null;
}

function findRawPromptAfter(row, promptId, promptType = 'SelectPrompt') {
  const prompts = row?.fullStateAfter?.prompts;
  if (!Array.isArray(prompts)) return null;
  if (promptId !== null && promptId !== undefined) {
    const matches = prompts.filter(prompt => prompt?.id === promptId);
    if (matches.length === 1) return matches[0];
  }
  const resolved = prompts.filter(prompt =>
    prompt?.promptType === promptType && prompt?.pending === false);
  return resolved.length === 1 ? resolved[0] : null;
}

function analyzeTargetRow(original, rawGame, safeRow) {
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
  const resolverOptions = rawRow.promptResolverContext?.availableOptions ?? {};
  for (const [key, expectedCount] of Object.entries(safeRow.promptContext?.optionCounts ?? {})) {
    if (!Array.isArray(resolverOptions[key]) || resolverOptions[key].length !== expectedCount) {
      const error = new Error('raw replay resolver option count mismatch for ' + key);
      error.code = 'TRACE_REPLAY_PROMPT_OPTIONS_MISMATCH';
      throw error;
    }
  }
  const safeAllowCancel = safeRow.promptContext?.allowCancel;
  if (typeof safeAllowCancel === 'boolean' &&
      typeof resolverOptions.allowCancel === 'boolean' &&
      safeAllowCancel !== resolverOptions.allowCancel) {
    const error = new Error('raw replay resolver allowCancel mismatch');
    error.code = 'TRACE_REPLAY_PROMPT_OPTIONS_MISMATCH';
    throw error;
  }
  const promptBefore = findRawPrompt(rawRow);
  if (!promptBefore || promptBefore.promptType !== 'SelectPrompt') {
    const error = new Error('raw replay does not contain the matching native SelectPrompt snapshot');
    error.code = 'TRACE_REPLAY_PROMPT_NOT_FOUND';
    throw error;
  }
  const effectPaths = [
    ...findExactStringPaths(promptBefore.fields, TARGET_EFFECT, 'fields'),
    ...findExactStringPaths(promptBefore.extraFields, TARGET_EFFECT, 'extraFields')
  ];
  if (effectPaths.length === 0) return null;
  if (rawRow.dispatchStatus !== 'succeeded' || !rawRow.fullStateAfter) {
    const error = new Error('target draw prompt did not have a successful dispatch and following snapshot');
    error.code = 'TRACE_REPLAY_PROMPT_NOT_ACCEPTED';
    throw error;
  }
  const promptAfter = findRawPromptAfter(rawRow, promptBefore.id);
  const optionSummary = safeOptionSummary(promptBefore);
  const evidence = [
    ...collectChoiceEvidence(rawRow.actionPayload?.fields, 'actionPayload.fields'),
    ...collectChoiceEvidence(rawRow.promptResolution, 'promptResolution'),
    ...collectChoiceEvidence({ result: promptAfter?.fields?.result }, 'promptAfter.fields.result'),
    ...collectChoiceEvidence({ result: promptAfter?.extraFields?.result }, 'promptAfter.extraFields.result')
  ];
  const beforeHandCount = handCount(rawRow.fullStateBefore, safeRow.actingSeat);
  const afterHandCount = handCount(rawRow.fullStateAfter, safeRow.actingSeat);
  const handCountDelta = beforeHandCount !== null && afterHandCount !== null ?
    afterHandCount - beforeHandCount : null;
  const numericEvidence = [...new Set(evidence
    .filter(item => typeof item.value === 'number')
    .map(item => item.value))];
  const selectedDrawCount = handCountDelta !== null && handCountDelta >= 0 &&
    numericEvidence.includes(handCountDelta) ? handCountDelta : null;
  const confidence = selectedDrawCount !== null ? 'choice-value-and-hand-delta-agree' :
    numericEvidence.length > 0 ? 'choice-evidence-present-but-not-confirmed-by-hand-delta' :
    handCountDelta !== null ? 'hand-delta-only-choice-unresolved' : 'choice-unresolved';
  return {
    actionOrdinal: safeRow.actionOrdinal,
    actingSeat: safeRow.actingSeat,
    turnBefore: safeRow.turnBefore,
    promptType: 'SelectPrompt',
    promptEffect: TARGET_EFFECT,
    promptEffectFieldPaths: [...new Set(effectPaths)],
    optionCounts: optionSummary.optionCounts,
    safeOptionLabels: optionSummary.safeOptionLabels,
    allowCancel: promptBefore.fields?.allowCancel === true ? true :
      promptBefore.fields?.allowCancel === false ? false : null,
    safeChoiceEvidence: evidence,
    handCountBefore: beforeHandCount,
    handCountAfter: afterHandCount,
    handCountDelta,
    selectedDrawCount,
    confidence,
    sourceClass: 'deterministic-reconstruction-not-original-run-observation'
  };
}

function analyzeTraceReplay({ originalSanitized, replayRaw, actionOrdinal = null,
  sanitizeFixtureArtifact = null } = {}) {
  if (!originalSanitized || !replayRaw) throw new TypeError('original sanitized and raw replay artifacts are required');
  const sanitize = sanitizeFixtureArtifact ??
    require('./agent2-v3-sanitized-diagnostic.cjs').sanitizeFixtureArtifact;
  const replaySanitized = sanitize(replayRaw);
  verifyReplayIdentity(originalSanitized, replaySanitized);
  const rawGame = replayRaw.nativeGame ?? replayRaw.fixtureGamePartial ?? {};
  requireEqual(rawGame.seed, replaySanitized.trial.seed, 'native game physical seed');
  requireEqual(rawGame.seed32, replaySanitized.trial.seed32, 'native game seed32');
  requireEqual(rawGame.candidateSeat, replaySanitized.trial.candidateSeat, 'native game candidate seat');
  requireEqual(rawGame.originalSourceSeat, replaySanitized.trial.originalSourceSeat, 'native game source seat');
  requireEqual(rawGame.actualFirstPlayerSeat, replaySanitized.trial.actualFirstPlayerSeat,
    'native game actual first-player seat');
  if (!Array.isArray(rawGame.decisionTrace)) {
    const error = new Error('raw replay artifact has no native decision trace');
    error.code = 'TRACE_REPLAY_RAW_TRACE_MISSING';
    throw error;
  }
  let candidates = originalSanitized.game.actorDecisions.filter(row =>
    row?.pendingPromptType === 'SelectPrompt' && row?.promptContext?.promptType === 'SelectPrompt');
  if (actionOrdinal !== null) candidates = candidates.filter(row => row.actionOrdinal === actionOrdinal);
  const targets = [];
  for (const row of candidates) {
    const target = analyzeTargetRow(originalSanitized, rawGame, row);
    if (target) targets.push(target);
  }
  return {
    schema: 'agent6-v3-trace-replay-join-v1',
    status: targets.length === 0 ? 'not-exercised' :
      targets.every(target => target.selectedDrawCount !== null) ? 'reconstructed' : 'choice-unresolved',
    replayIdentityVerified: true,
    deterministicReconstructionOnly: true,
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
  const [originalPath, replayPath, ordinalText] = argv;
  if (!originalPath || !replayPath || argv.length > 3 ||
      (ordinalText !== undefined && !/^\d+$/.test(ordinalText))) {
    throw new Error('usage: node agent6-v3-trace-replay-join.cjs <original-sanitized.json> <offline-decrypted-replay.json> [actionOrdinal]');
  }
  const result = analyzeTraceReplay({
    originalSanitized: readJson(originalPath),
    replayRaw: readJson(replayPath),
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

module.exports = { analyzeTraceReplay, verifyReplayIdentity, validateWorkerAudit, stableJson };
