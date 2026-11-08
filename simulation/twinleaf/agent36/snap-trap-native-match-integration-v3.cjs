'use strict';

const assert = require('node:assert/strict');
const {
  requestWithRootStoreCapture,
  withSnapTrapOwnerPolicyV2
} = require('./snap-trap-owner-prompt-policy-v2.cjs');
const {
  withSnapTrapOwnerPromptEvidenceV1
} = require('./snap-trap-owner-prompt-evidence-v1.cjs');

const VERSION = 'agent36-snap-trap-native-match-integration-v3';

/**
 * Install the source marker and owner policy at the actual headless Store
 * boundary, after the selected-v0 raw-State quarantine is active. The
 * detached owner-observation observer is installed immediately before the
 * policy wrapper, so it can retain the exact prompt and response contract.
 *
 * @param {Function} next
 * @param {object} [deps]
 * @returns {{result:unknown,audit:object}}
 */
function withSnapTrapInsideNativeMatchesV3(next, deps = {}) {
  assert.equal(typeof next, 'function');
  const headless = deps.headless ?? require('../headless.cjs');
  const runMatchDescriptor = Object.getOwnPropertyDescriptor(
    headless, 'runMatch'
  );
  assert.ok(runMatchDescriptor &&
    typeof runMatchDescriptor.value === 'function');
  const originalRunMatch = runMatchDescriptor.value;
  const matches = [];

  const report = () => ({
    version: VERSION,
    nativeMatchCalls: matches.length,
    nativeMatchAttempts: [...matches],
    allRootStoresCapturedExactlyOnce: matches.length > 0 &&
      matches.every(match => match.rootStoreCaptureCount === 1),
    competitiveGamesQualified: 0
  });

  function wrappedRunMatch(request) {
    let rootStore = null;
    let rootStoreCaptureCount = 0;
    const rootActionContext = {};
    const capturedRequest = requestWithRootStoreCapture(
      request,
      store => {
        rootStore = store;
        rootStoreCaptureCount++;
      }
    );
    const descriptors = Object.getOwnPropertyDescriptors(capturedRequest);
    const originalActionCallback = capturedRequest.onRootActionDispatched;
    descriptors.onRootActionDispatched = {
      value: function onRootActionDispatched(
        store, action, actionOrdinal, seat, turnBefore
      ) {
        rootActionContext.onRootActionDispatched?.(
          store, action, actionOrdinal, seat, turnBefore
        );
        if (typeof originalActionCallback === 'function') {
          return originalActionCallback.call(
            request, store, action, actionOrdinal, seat, turnBefore
          );
        }
        return undefined;
      },
      writable: true,
      enumerable: true,
      configurable: true
    };
    const wrappedRequest = Object.create(
      Object.getPrototypeOf(capturedRequest),
      descriptors
    );

    try {
      const evidence = withSnapTrapOwnerPromptEvidenceV1(
        () => withSnapTrapOwnerPolicyV2(
          () => originalRunMatch.call(headless, wrappedRequest),
          {
            ...(deps.policyDeps ?? {}),
            getRootStore: () => rootStore
          }
        ),
        {
          ...(deps.evidenceDeps ?? {}),
          getRootStore: () => rootStore,
          rootActionContext
        }
      );
      const policyOutcome = evidence.result;
      assert.ok(policyOutcome && policyOutcome.audit);
      assert.equal(rootStoreCaptureCount, 1);
      matches.push({
        label: request?.label ?? null,
        rootStoreCaptureCount,
        rootStoreCaptured: Boolean(rootStore),
        marker: policyOutcome.audit.marker ?? null,
        ownerPolicy: policyOutcome.audit.ownerPolicy ?? null,
        ownerPromptEvidence: evidence.audit,
        status: 'returned'
      });
      return policyOutcome.result;
    } catch (error) {
      matches.push({
        label: request?.label ?? null,
        rootStoreCaptureCount,
        rootStoreCaptured: Boolean(rootStore),
        marker: error?.stunfiskSnapTrapPromptMarkerAudit ?? null,
        ownerPolicy: error?.snapTrapOwnerPromptPolicyAudit ?? null,
        ownerPromptEvidence:
          error?.snapTrapOwnerPromptEvidenceAudit ?? null,
        status: 'threw',
        error: {
          name: error?.name ?? null,
          code: error?.code ?? null,
          message: error?.message ?? String(error)
        }
      });
      if (error && typeof error === 'object') {
        error.snapTrapNativeMatchIntegrationAudit = report();
      }
      throw error;
    }
  }

  Object.defineProperty(headless, 'runMatch', {
    ...runMatchDescriptor,
    value: wrappedRunMatch
  });
  try {
    const result = next();
    return { result, audit: report() };
  } catch (error) {
    if (error && typeof error === 'object') {
      error.snapTrapInsideNativeMatchesAudit = report();
    }
    throw error;
  } finally {
    try {
      assert.strictEqual(headless.runMatch, wrappedRunMatch);
    } finally {
      Object.defineProperty(headless, 'runMatch', runMatchDescriptor);
    }
  }
}

module.exports = { VERSION, withSnapTrapInsideNativeMatchesV3 };
