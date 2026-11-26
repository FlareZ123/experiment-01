'use strict';

const assert = require('node:assert/strict');
const {
  canonicalJson,
  observationSha256
} = require('./2026-11/agent5-information-set-mcts.cjs');

function cloneCanonicalJson(value, label) {
  try {
    return JSON.parse(canonicalJson(value));
  } catch (error) {
    throw new Error('ACTOR_HISTORY_NON_JSON: ' + label + ': ' + error.message);
  }
}

function cloneLogParams(params, label) {
  const fail = reason => {
    throw new Error('ACTOR_HISTORY_NON_JSON: ' + label + ': ' + reason);
  };
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    fail('log params must be a non-array object');
  }
  const prototype = Object.getPrototypeOf(params);
  const keys = Reflect.ownKeys(params);
  if (!keys.every(key => typeof key === 'string')) {
    fail('log params cannot contain symbol keys');
  }
  if (keys.length === 0 && prototype !== Object.prototype && prototype !== null) {
    fail('empty custom-prototype log params are not a JSON record');
  }
  const plain = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(params, key);
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      fail('log params must contain data properties only');
    }
    // These fields are host/UI metadata and are removed from the actor view.
    if (key === 'timestamp' || key === 'private') continue;
    if (descriptor.enumerable !== true) {
      fail('log params cannot contain non-enumerable event fields');
    }
    Object.defineProperty(plain, key, {
      value: descriptor.value,
      enumerable: true,
      writable: true,
      configurable: true
    });
  }
  return cloneCanonicalJson(plain, label);
}

function privateFlag(params, logId) {
  if (params === null || params === undefined) return false;
  assert.equal(typeof params, 'object',
    'ACTOR_HISTORY_INVALID_PARAMS: log ' + logId + ' params must be an object');
  const descriptor = Object.getOwnPropertyDescriptor(params, 'private');
  if (descriptor === undefined) return false;
  assert.ok(Object.hasOwn(descriptor, 'value'),
    'ACTOR_HISTORY_ACCESSOR_PRIVATE_FLAG: log ' + logId);
  const value = descriptor.value;
  assert.ok(value === undefined || value === null
    || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number',
  'ACTOR_HISTORY_INVALID_PRIVATE_FLAG: log ' + logId);
  return String(value) === 'true';
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

/**
 * Project the event history visible to one physical player.
 *
 * state must be the unsanitized in-process Store.state. StateSanitizer clones
 * before trimming logs, but sanitized client/reconnection States contain only
 * incremental logs and cannot establish complete recall.
 *
 * ownDecisionHistory is a caller-maintained per-seat trace for prior actions,
 * prompt choices, and observations that are not represented by State.logs.
 * It must itself be an actor-visible projection; never pass raw native actions,
 * hidden state, opponent-private logs, or host/global identifiers. This helper
 * does not assert that either source is complete; the caller must
 * set historyComplete: true only after auditing coverage.
 *
 * By default the result contains a compact SHA-256 digest, not the raw event
 * transcript. Set includeVisibleLogs/includeOwnDecisionHistory when a policy
 * needs semantic access to the events themselves.
 */
function projectActorVisibleHistory(state, actorSeat, options = {}) {
  assert.ok(state && typeof state === 'object');
  assert.ok(Array.isArray(state.players) && state.players.length === 2,
    'ACTOR_HISTORY_REQUIRES_TWO_PLAYERS');
  assert.ok(actorSeat === 0 || actorSeat === 1,
    'ACTOR_HISTORY_INVALID_SEAT');
  const actor = state.players[actorSeat];
  assert.ok(actor && actor.id !== undefined && actor.id !== null,
    'ACTOR_HISTORY_MISSING_PLAYER_ID');
  assert.ok(Array.isArray(state.logs),
    'ACTOR_HISTORY_REQUIRES_STORE_LOGS');

  const actorId = actor.id;
  const visibleLogs = [];
  for (const log of state.logs) {
    assert.ok(log && typeof log === 'object', 'ACTOR_HISTORY_INVALID_LOG');
    const diagnosticLogId = Number.isSafeInteger(log.id) ? log.id : 'unknown';
    const clientId = log.client;
    const params = log.params === undefined || log.params === null ? {} : log.params;

    // Match TableGameLogPanel.isLogHidden exactly without invoking an accessor.
    if (privateFlag(params, diagnosticLogId) && clientId !== actorId && clientId !== 0) {
      continue;
    }

    assert.equal(typeof log.message, 'string',
      'ACTOR_HISTORY_INVALID_LOG_MESSAGE: log ' + diagnosticLogId);
    const projectedParams = cloneLogParams(params, 'log ' + diagnosticLogId + ' params');
    // These are host/UI metadata, not player-visible event content. Global IDs
    // would reveal hidden-log gaps after filtering; timestamps vary between
    // otherwise identical histories; private is used only for visibility.
    delete projectedParams.timestamp;
    delete projectedParams.private;

    // Preserve only the ordered visible event content. Do not expose global
    // log IDs or client IDs: neither is rendered in the player's log panel.
    visibleLogs.push({
      message: log.message,
      params: projectedParams
    });
  }

  const ownDecisionHistory = cloneCanonicalJson(
    options.ownDecisionHistory === undefined ? [] : options.ownDecisionHistory,
    'ownDecisionHistory'
  );
  assert.ok(Array.isArray(ownDecisionHistory),
    'ACTOR_HISTORY_OWN_TRACE_MUST_BE_ARRAY');

  const historySource = options.historySource ?? 'unspecified';
  assert.equal(typeof historySource, 'string',
    'ACTOR_HISTORY_SOURCE_MUST_BE_STRING');
  assert.ok(historySource.trim().length > 0,
    'ACTOR_HISTORY_SOURCE_MUST_BE_NONEMPTY');
  const historyComplete = options.historyComplete === true;
  if (historyComplete) {
    assert.notEqual(historySource, 'unspecified',
      'ACTOR_HISTORY_COMPLETE_REQUIRES_EXPLICIT_SOURCE');
  }

  const historyPayload = {
    actorSeat,
    visibleLogs,
    ownDecisionHistory
  };
  const result = {
    actorSeat,
    actorHistorySha256: observationSha256(historyPayload),
    actorHistoryComplete: historyComplete,
    historySource,
    visibleLogCount: visibleLogs.length,
    ownDecisionCount: ownDecisionHistory.length
  };

  if (options.includeVisibleLogs === true) {
    result.visibleLogs = visibleLogs;
  }
  if (options.includeOwnDecisionHistory === true) {
    result.ownDecisionHistory = ownDecisionHistory;
  }
  return deepFreeze(result);
}

function createActorObservationWithHistory(baseActorObservation, historyOptionsForSeat = () => ({})) {
  assert.equal(typeof baseActorObservation, 'function',
    'ACTOR_HISTORY_BASE_OBSERVATION_MUST_BE_FUNCTION');
  assert.equal(typeof historyOptionsForSeat, 'function',
    'ACTOR_HISTORY_OPTIONS_PROVIDER_MUST_BE_FUNCTION');

  return function actorObservationWithHistory(state, actorSeat, options = {}) {
    const base = baseActorObservation(state, actorSeat, options);
    assert.ok(base && typeof base === 'object' && !Array.isArray(base),
      'ACTOR_HISTORY_BASE_OBSERVATION_MUST_BE_OBJECT');
    const historyOptions = historyOptionsForSeat(state, actorSeat, options) ?? {};
    assert.ok(historyOptions && typeof historyOptions === 'object' && !Array.isArray(historyOptions),
      'ACTOR_HISTORY_OPTIONS_MUST_BE_OBJECT');
    const history = projectActorVisibleHistory(state, actorSeat, historyOptions);
    if (historyOptions.requireComplete === true) {
      assert.equal(history.actorHistoryComplete, true,
        'ACTOR_HISTORY_COMPLETE_TRACE_REQUIRED');
    }
    // Source/completeness/count fields are host diagnostics, not player-visible
    // information. Only the digest and optional event content enter the view.
    return deepFreeze({
      ...base,
      actorHistorySha256: history.actorHistorySha256,
      ...(history.visibleLogs === undefined ? {} : { actorVisibleHistory: history.visibleLogs }),
      ...(history.ownDecisionHistory === undefined ? {} : { actorOwnDecisionHistory: history.ownDecisionHistory })
    });
  };
}

module.exports = {
  projectActorVisibleHistory,
  createActorObservationWithHistory
};
