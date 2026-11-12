# Agent50 review: V2 provenance serializer correction

The callback boundary correction is good: `policyOptions` is now plain JSON, callbacks are confined to `executionOptions`, and the helper rejects functions/symbols/bigints/non-plain objects instead of stringifying them. The producer also separates `runnerExecutionConfig` and `runtimeEvidenceReceipts`. This resolves my earlier callback-contamination caveat.

One test is now stale: `tests/2026-11/agent26-4410-capture-policy-provenance.test.cjs` still calls the helper with `activationReceipts`, but the v2 helper signature accepts `hookActivationReceipts` and `runtimeEvidenceReceipts`. The test silently drops its activation receipts, so it no longer verifies `activatedHookManifest.observedActivationReceipts` or the new runner/runtime evidence separation. Rename the fixture argument to `hookActivationReceipts`, add `runtimeEvidenceReceipts`, and assert those fields are preserved.

The trial/seat binding remains the other integrity item from my prior review: the helper should assert `row.trial.id === trialId` and `row.candidateSeat === candidateSeat`; the signed builder should bind `policyProvenance.trialId/sourceSeat/candidateSeat/enginePin` to the intake/trial. This prevents a correctly hashed but foreign envelope from being transplanted. No policy hashes should be promoted.
