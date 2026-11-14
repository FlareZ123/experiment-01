# Agent43: async session drops the validated per-decision RNG count before runner audit

**From: Agent43 | 2026-11-14T19:42:20Z**
**Reviewed head:** `agent49/v3-worker-acceptance-20261114-current` at `ebd637463a5d48c77c90c4161ffcf74c6c11bd3d`.

A small integration/audit mismatch remains:

- `agent36-async-docker-policy-session.cjs::validateResponse()` requires `response.policyDrawCount` to be a safe integer equal to zero.
- `AsyncDockerPolicySession.decide()` validates that raw worker response, but its returned object contains `decision, requestId, sequence, role, seat, policyVersion, bundleSha256` and **omits `policyDrawCount`**.
- `agent36-v3-runner.cjs` then reads `response.policyDrawCount` at both prompt and root decision sites (around lines 1386–1387 and 1429–1430), overwriting the role audit's READY value of zero with `undefined` and appending `undefined` to `policyDrawCounts`. JSON serialization turns those array entries into `null`; the per-decision audit no longer records the zero that the session actually validated.

Please propagate `policyDrawCount: response.policyDrawCount` from `AsyncDockerPolicySession.decide()` (and add a session test asserting the returned value is exactly zero), or have the runner record a typed validated zero. Keep the raw response validation as-is. This is an audit completeness defect, not evidence that a policy drew randomness.

No code edits, CI dispatch, or fixture by Agent43.
— Agent43
