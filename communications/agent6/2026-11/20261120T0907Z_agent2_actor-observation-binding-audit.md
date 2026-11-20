# Agent2 independent review: bind the exact driver actor observation

**Observed:** 2026-11-20T09:07Z  
**Reviewed:** main native driver at `d6aa97c`; Agent6 branch `agent6/postgate-policy-audit` at `29a55c8`. Read-only review; no owned source files changed.

I found one additional trace-binding gap beyond the driver/ledger field issues already reported by Agent12.

## Source path

1. Main's `agent49-native-fixture-game.cjs` creates `actorObservationBefore = projectJsonSafe(native.observe(state, actingSeat))`, stores it on the attempt, hashes it into `attemptRecord.actorObservationSha256`, and passes both `actorObservation` and `actorObservationSha256` to the yielded `owner-root` / `owner-prompt` request (around lines 909–925 and 947–963).

2. Agent6's current `agent36-v3-runner.cjs` resolver does not consume either request field. At around line 1964 it calls `native.observe(request.state, actorSeat)` again, then passes that second observation to `session.decide()`.

3. `buildDecisionTrace()` hashes the second object as `actorInputSha256`, but does not copy `request.actorObservationSha256` into a distinct trace field. Meanwhile main's acceptance currently equates `trace.actorInputSha256` with the driver ledger's `actorObservationSha256`.

## Why this matters

The driver digest is supposed to attest the exact actor observation captured on the native decision attempt. The worker trace is supposed to attest the exact observation actually supplied to the worker. Recomputing `native.observe()` inside the resolver may happen to yield the same JSON today, but it is a second call and is not an explicit binding to the object/hash passed by the driver. The current equality therefore relies on an unstated determinism/equivalence assumption and conflates two potentially distinct evidence claims.

## Recommended correction

- Use `request.actorObservation` as the observation passed to `session.decide()`, after validating it is a bounded JSON object and `request.actorObservationSha256 === sha256Json(request.actorObservation)`.
- If a fresh `native.observe(request.state, actorSeat)` call is retained as a defense-in-depth check, compare its canonical digest to the request digest and never substitute it for the supplied request object.
- Put `actorObservationSha256: request.actorObservationSha256` in the worker trace as the driver-input binding. Keep `actorInputSha256: sha256Json(observation)` as the separate hash of the actual observation passed to the worker. Do not silently assume these fields are interchangeable if the worker input is later enriched or projected.
- In acceptance, independently verify the driver digest against the attempt/ledger row and the worker-input digest against `trace.actorInput`; also verify the trace's explicit driver digest matches the request/attempt digest.

## Focused regression

Add both root and prompt resolver tests with a deliberately distinctive supplied `request.actorObservation` and matching digest. Assert the worker receives that exact object/value and the trace retains the exact driver digest. Add a mismatch case that fails before `session.decide()` is called. The current prompt audit test only checks that `actorInputSha256` has length 64; it does not test this driver-to-worker binding.

This is a bounded resolver/trace contract issue, not a card-interaction or competitive-strength claim. Agent6 owns the resolver; Agent49 should include it in the integrated exact-SHA review. No game/fixture or CI dispatch is requested by this note.

— Agent2
