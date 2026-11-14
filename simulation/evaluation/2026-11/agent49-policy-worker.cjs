'use strict';

const { once } = require('node:events');

const INIT_SCHEMA = 'aichi-policy-worker-init-v2';
const READY_SCHEMA = 'aichi-policy-worker-ready-v2';
const REQUEST_SCHEMA = 'aichi-policy-request-v2';
const RESPONSE_SCHEMA = 'aichi-policy-response-v2';
const OBSERVATION_SCHEMA = 'aichi-actor-observation-v1';
const PROMPT_SCHEMA = 'aichi-owner-prompt-projection-v1';
const EVENT_SCHEMA = 'aichi-public-event-receipt-v1';
const FRONTIER_SCHEMA = 'aichi-action-frontier-v1';

const LIMITS = Object.freeze({
  maxLineBytes: 1024 * 1024,
  maxTotalInputBytes: 64 * 1024 * 1024,
  maxMessages: 4096,
  maxDepth: 24,
  maxObjectKeys: 256,
  maxArrayItems: 2048,
  maxStringLength: 8192,
  maxTokenLength: 128,
  maxResponseBytes: 16 * 1024
});

class ProtocolError extends Error {
  constructor(code) {
    super(code);
    this.name = 'ProtocolError';
    this.code = code;
  }
}

function fail(code) {
  throw new ProtocolError(code);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value, required, optional = []) {
  if (!isRecord(value)) fail('EXPECTED_OBJECT');
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail('UNKNOWN_FIELD');
  }
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) fail('MISSING_FIELD');
  }
}

function boundedString(value, pattern, max = LIMITS.maxStringLength) {
  return typeof value === 'string' && value.length > 0 &&
    value.length <= max && (!pattern || pattern.test(value));
}

function assertBoundedJson(value, depth = 0) {
  if (depth > LIMITS.maxDepth) fail('JSON_TOO_DEEP');
  if (value === null || typeof value === 'boolean') return;
  if (typeof value === 'string') {
    if (value.length > LIMITS.maxStringLength) fail('STRING_TOO_LONG');
    return;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('NONFINITE_NUMBER');
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > LIMITS.maxArrayItems) fail('ARRAY_TOO_LARGE');
    for (const item of value) assertBoundedJson(item, depth + 1);
    return;
  }
  if (!isRecord(value)) fail('NON_JSON_VALUE');
  const keys = Object.keys(value);
  if (keys.length > LIMITS.maxObjectKeys) fail('OBJECT_TOO_LARGE');
  for (const key of keys) {
    if (key.length > 128) fail('KEY_TOO_LONG');
    assertBoundedJson(value[key], depth + 1);
  }
}

function assertNoForbiddenFields(value) {
  if (Array.isArray(value)) {
    for (const item of value) assertNoForbiddenFields(item);
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (/seed|rng|entropy|random/i.test(key)) fail('FORBIDDEN_RANDOM_FIELD');
    if (/^(state|store|nativeState|nativeStore|fullState|fullStateBefore|promptResolverContext|nativePrompt|validator|validate|deckOrder|opponentDeck|opponentHand|opponentPrizes|hiddenZone|hiddenZones)$/i.test(key)) {
      fail('FORBIDDEN_NATIVE_OR_HIDDEN_FIELD');
    }
    assertNoForbiddenFields(child);
  }
}

function assertToken(value) {
  if (!boundedString(value, /^[A-Za-z0-9._:-]+$/, LIMITS.maxTokenLength)) {
    fail('INVALID_TOKEN');
  }
}

function uniqueTokens(rows, field) {
  if (!Array.isArray(rows) || rows.length > LIMITS.maxArrayItems) fail('INVALID_TOKEN_LIST');
  const seen = new Set();
  for (const row of rows) {
    if (!isRecord(row)) fail('INVALID_TOKEN_ROW');
    assertToken(row[field]);
    if (seen.has(row[field])) fail('DUPLICATE_TOKEN');
    seen.add(row[field]);
  }
  return seen;
}

function validateInit(message) {
  exactKeys(message,
    ['schema', 'type', 'role', 'seat', 'policyVersion', 'bundleSha256', 'config']);
  if (message.schema !== INIT_SCHEMA || message.type !== 'init') fail('BAD_INIT_SCHEMA');
  if (!['candidate', 'opponent'].includes(message.role)) fail('BAD_ROLE');
  if (message.seat !== 0 && message.seat !== 1) fail('BAD_SEAT');
  if (!boundedString(message.policyVersion, /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/)) fail('BAD_POLICY_VERSION');
  if (!boundedString(message.bundleSha256, /^[a-f0-9]{64}$/)) fail('BAD_BUNDLE_DIGEST');
  if (!isRecord(message.config)) fail('BAD_POLICY_CONFIG');
  assertBoundedJson(message.config);
  assertNoForbiddenFields(message);
  return message;
}

function validatePrompt(prompt, seat) {
  if (prompt === null) return null;
  exactKeys(prompt, ['schema', 'actingSeat', 'promptType', 'description', 'choices']);
  if (prompt.schema !== PROMPT_SCHEMA || prompt.actingSeat !== seat) fail('BAD_PROMPT_PROJECTION');
  if (!boundedString(prompt.promptType, /^[A-Za-z][A-Za-z0-9._-]{0,95}$/)) fail('BAD_PROMPT_TYPE');
  if (prompt.description !== null && !boundedString(prompt.description, null, 2048)) fail('BAD_PROMPT_DESCRIPTION');
  if (!Array.isArray(prompt.choices) || prompt.choices.length > 512) fail('BAD_PROMPT_CHOICES');
  uniqueTokens(prompt.choices, 'token');
  for (const choice of prompt.choices) {
    exactKeys(choice, ['token', 'kind'], ['printing', 'label', 'publicMetadata']);
    if (!boundedString(choice.kind, /^[A-Za-z][A-Za-z0-9._-]{0,63}$/)) fail('BAD_CHOICE_KIND');
    if (choice.printing !== undefined && !boundedString(choice.printing, null, 256)) fail('BAD_CHOICE_PRINTING');
    if (choice.label !== undefined && !boundedString(choice.label, null, 256)) fail('BAD_CHOICE_LABEL');
    if (choice.publicMetadata !== undefined) assertBoundedJson(choice.publicMetadata);
  }
  return prompt;
}

function validateFrontier(frontier) {
  exactKeys(frontier, ['schema', 'items']);
  if (frontier.schema !== FRONTIER_SCHEMA) fail('BAD_ACTION_FRONTIER_SCHEMA');
  if (!Array.isArray(frontier.items) || frontier.items.length > 512) fail('BAD_ACTION_FRONTIER');
  const tokens = uniqueTokens(frontier.items, 'token');
  for (const item of frontier.items) {
    exactKeys(item, ['token', 'kind'], ['label', 'actorPrinting', 'targetPrinting', 'attackName', 'publicMetadata']);
    if (!boundedString(item.kind, /^[A-Za-z][A-Za-z0-9._-]{0,63}$/)) fail('BAD_ACTION_KIND');
    for (const key of ['label', 'actorPrinting', 'targetPrinting', 'attackName']) {
      if (item[key] !== undefined && !boundedString(item[key], null, 256)) fail('BAD_ACTION_METADATA');
    }
    if (item.publicMetadata !== undefined) assertBoundedJson(item.publicMetadata);
  }
  return tokens;
}

function validateRequest(message, init, expectedSequence, seenRequestIds) {
  exactKeys(message, [
    'schema', 'type', 'requestId', 'sequence', 'role', 'seat',
    'observationSchema', 'observation', 'prompt', 'publicEventReceipt', 'actionFrontier'
  ]);
  if (message.schema !== REQUEST_SCHEMA || message.type !== 'decision') fail('BAD_REQUEST_SCHEMA');
  if (!boundedString(message.requestId, /^[A-Za-z0-9._:-]{1,128}$/, 128)) fail('BAD_REQUEST_ID');
  if (seenRequestIds.has(message.requestId)) fail('DUPLICATE_REQUEST_ID');
  if (!Number.isSafeInteger(message.sequence) || message.sequence !== expectedSequence) fail('BAD_SEQUENCE');
  if (message.role !== init.role || message.seat !== init.seat) fail('ROLE_SEAT_CHANGED');
  if (message.observationSchema !== OBSERVATION_SCHEMA) fail('BAD_OBSERVATION_SCHEMA');
  if (!isRecord(message.observation) || message.observation.actorSeat !== init.seat) fail('BAD_ACTOR_OBSERVATION');
  if (!['owner-root', 'owner-prompt'].includes(message.observation.decisionKind)) fail('BAD_DECISION_KIND');
  if (message.prompt !== null && message.observation.decisionKind !== 'owner-prompt') fail('PROMPT_ROOT_MISMATCH');
  if (message.prompt === null && message.observation.decisionKind === 'owner-prompt') fail('MISSING_PROMPT_PROJECTION');
  const prompt = validatePrompt(message.prompt, init.seat);
  if (prompt && message.observation.pendingPromptType !== prompt.promptType) fail('PROMPT_TYPE_MISMATCH');
  if (message.publicEventReceipt !== null) {
    if (!isRecord(message.publicEventReceipt) || message.publicEventReceipt.schema !== EVENT_SCHEMA) fail('BAD_PUBLIC_EVENT_RECEIPT');
  }
  const actionTokens = validateFrontier(message.actionFrontier);
  assertBoundedJson(message);
  assertNoForbiddenFields(message);
  seenRequestIds.add(message.requestId);
  return { prompt, actionTokens };
}

function validateDecision(decision, prompt, actionTokens) {
  if (!isRecord(decision)) fail('POLICY_RETURNED_NON_OBJECT');
  if (decision.kind === 'select-action') {
    exactKeys(decision, ['kind', 'token']);
    assertToken(decision.token);
    if (!actionTokens.has(decision.token)) fail('POLICY_SELECTED_UNKNOWN_ACTION');
    return { kind: 'select-action', token: decision.token };
  }
  if (decision.kind === 'select-choice') {
    exactKeys(decision, ['kind', 'token']);
    assertToken(decision.token);
    if (!prompt || !prompt.choices.some(choice => choice.token === decision.token)) {
      fail('POLICY_SELECTED_UNKNOWN_CHOICE');
    }
    return { kind: 'select-choice', token: decision.token };
  }
  if (decision.kind === 'abstain') {
    exactKeys(decision, ['kind', 'reasonCode']);
    if (!boundedString(decision.reasonCode, /^[A-Z][A-Z0-9_]{0,63}$/)) fail('BAD_ABSTENTION_CODE');
    return { kind: 'abstain', reasonCode: decision.reasonCode };
  }
  fail('UNKNOWN_DECISION_KIND');
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

async function writeLine(value) {
  const bytes = Buffer.from(JSON.stringify(value) + '\n', 'utf8');
  if (bytes.length > LIMITS.maxResponseBytes) fail('RESPONSE_TOO_LARGE');
  if (!process.stdout.write(bytes)) await once(process.stdout, 'drain');
}

function disablePolicyRandomness() {
  const deny = () => fail('RANDOMNESS_NOT_AUTHORIZED');
  Object.defineProperty(Math, 'random', {
    value: deny, writable: false, configurable: false
  });
  const crypto = require('node:crypto');
  for (const name of ['randomBytes', 'pseudoRandomBytes', 'randomInt', 'randomUUID', 'randomFill', 'randomFillSync']) {
    Object.defineProperty(crypto, name, {
      value: deny, writable: false, configurable: false
    });
  }
  const webCryptoPrototype = Object.getPrototypeOf(crypto.webcrypto);
  Object.defineProperty(webCryptoPrototype, 'getRandomValues', {
    value: deny, writable: false, configurable: false
  });
}

async function run() {
  disablePolicyRandomness();
  const policyModule = require('./policy.cjs');
  let initialized = false;
  let init = null;
  let policy = null;
  let expectedSequence = 1;
  let messageCount = 0;
  let totalInputBytes = 0;
  const seenRequestIds = new Set();
  let pending = Buffer.alloc(0);

  async function handleLine(line) {
    if (line.length === 0) fail('EMPTY_LINE');
    if (line.length > LIMITS.maxLineBytes) fail('LINE_TOO_LARGE');
    let message;
    try {
      message = JSON.parse(line.toString('utf8'));
    } catch {
      fail('MALFORMED_JSON');
    }
    assertBoundedJson(message);
    if (!initialized) {
      init = validateInit(message);
      if (policyModule.POLICY_VERSION !== init.policyVersion ||
          typeof policyModule.createPolicy !== 'function') fail('POLICY_MODULE_MISMATCH');
      policy = await policyModule.createPolicy(deepFreeze({
        role: init.role,
        seat: init.seat,
        policyVersion: init.policyVersion,
        config: init.config
      }));
      if (!policy || typeof policy.decide !== 'function') fail('POLICY_FACTORY_INVALID');
      initialized = true;
      await writeLine({
        schema: READY_SCHEMA,
        type: 'ready',
        role: init.role,
        seat: init.seat,
        policyVersion: init.policyVersion,
        bundleSha256: init.bundleSha256
      });
      return;
    }

    const validated = validateRequest(message, init, expectedSequence, seenRequestIds);
    const frozenRequest = deepFreeze(message);
    const rawDecision = await policy.decide(frozenRequest);
    const decision = validateDecision(rawDecision, validated.prompt, validated.actionTokens);
    const response = {
      schema: RESPONSE_SCHEMA,
      type: 'response',
      requestId: message.requestId,
      sequence: message.sequence,
      role: init.role,
      seat: init.seat,
      policyVersion: init.policyVersion,
      decision
    };
    assertNoForbiddenFields(response);
    await writeLine(response);
    expectedSequence++;
  }

  try {
    for await (const chunk of process.stdin) {
      const bytes = Buffer.from(chunk);
      totalInputBytes += bytes.length;
      if (totalInputBytes > LIMITS.maxTotalInputBytes) fail('TOTAL_INPUT_TOO_LARGE');
      let offset = 0;
      while (offset < bytes.length) {
        const newline = bytes.indexOf(0x0a, offset);
        const end = newline === -1 ? bytes.length : newline;
        const part = bytes.subarray(offset, end);
        if (pending.length + part.length > LIMITS.maxLineBytes) fail('LINE_TOO_LARGE');
        pending = pending.length ? Buffer.concat([pending, part]) : Buffer.from(part);
        if (newline === -1) break;
        messageCount++;
        if (messageCount > LIMITS.maxMessages) fail('TOO_MANY_MESSAGES');
        const line = pending;
        pending = Buffer.alloc(0);
        await handleLine(line);
        offset = newline + 1;
      }
    }
    if (pending.length > 0) fail('UNTERMINATED_LINE');
    if (!initialized) fail('MISSING_INIT');
  } catch (error) {
    const code = error instanceof ProtocolError ? error.code : 'WORKER_FAILURE';
    process.stderr.write('AGENT49_POLICY_WORKER_ERROR ' + code + '\n');
    process.exitCode = 1;
    process.stdin.destroy();
  }
}

if (require.main === module) {
  run().catch(() => {
    process.stderr.write('AGENT49_POLICY_WORKER_ERROR WORKER_FAILURE\n');
    process.exitCode = 1;
    process.stdin.destroy();
  });
}

module.exports = {
  INIT_SCHEMA, READY_SCHEMA, REQUEST_SCHEMA, RESPONSE_SCHEMA,
  OBSERVATION_SCHEMA, PROMPT_SCHEMA, EVENT_SCHEMA, FRONTIER_SCHEMA,
  LIMITS, validateInit, validateRequest, validateDecision, disablePolicyRandomness
};
