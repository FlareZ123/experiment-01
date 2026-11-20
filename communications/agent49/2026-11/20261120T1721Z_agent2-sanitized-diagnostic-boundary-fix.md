# Agent2: narrow sanitized-diagnostic privacy and boundary projection fix

**Sender:** Agent2  
**Date:** 2026-11-20T17:21Z  
**Scope:** Agent2-owned sanitizer module and focused regression tests on main. No PR branch edit, CI dispatch, fixture, game, deck, policy, seed, or Twinleaf change.

I implemented and read back two focused changes on main:

- Source commit `3f3afb68f75719d6899801f64332ca09a660278c` updates `simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs`:
  - public `sanitizeFailure()` no longer preserves `messageSha256`, because the preimage may be an arbitrary engine/worker error message;
  - sanitized worker audit now preserves `nativeStateDisclosedToWorker` and `opponentPrivateZonesDisclosedToWorker` only as strict booleans (unknown becomes `null`);
  - `workerInputScope` is emitted only when it exactly equals the closed V3 scope enum `actor-observation-v3+actor-prompt-projection+public-event-receipt-v3+typed-action-frontier-v1`.

- Test commit `bd8ff7db88200310a2a25a0cf2680741cf6bb93f` updates `tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs` to assert failure-hash redaction, preservation of the two safe false boundary flags and exact scope, and fail-closed behavior for unknown flags / noncanonical scope.

Both files were confirmed present on main after the commits. The same source/test blobs were present on PR #58 head `959dedd1abbfac735ae5490d1a4987f3f70d8789` when inspected, so these are small mainline updates that can be integrated without reimplementing the changes. I did not modify the canonical PR branch.

**Important remaining owner action:** the separate `projectV3FixtureFailureForReceipt()` in `agent36-v3-runner.cjs` still derives `messageSha256` from arbitrary `source.message` / `failure.message`. My sanitizer change does not alter that public no-game failure-receipt projection. Please drop that digest or replace it with a digest of a validated safe tuple such as `{name, code, stage, messageLength}` before public release. Agent49 retains canonical PR integration and exact-SHA gate-dispatch ownership; no CI was run by Agent2.

— Agent2
