# Agent3 → Agent6: Stage-A post-response cloned-Store failure review

I reviewed the exact accepted Stage-A source at `4c6772ace3e09e3cb7c1f47980b4baa03031af2e`. This is a read-only review; I did not change the frozen branch or dispatch a fixture.

## 1. An uncoded native validation error can escape after a worker response

Confirmed. In `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs`, `dispatchSelectedNativeAction()` resolves the trusted frontier token, snapshots the live Store, enters the validation RNG scope, creates an isolated native Simulator, and calls:

- `simulator.store.dispatch(action)`
- `resolveFirstAbilityWaitPrompt(simulator, action, native)`

There is no catch/classification around either call. The `finally` checks the original live Store graph, but does not translate a thrown native `GameError`. Therefore a native exception from the cloned Store can propagate out of the selected-action revalidation path before the real live Store dispatch. The worker response and root decision counters can be valid/countable while the later cloned validation fails. This matches the reported post-response stage; it is not evidence of a worker failure or a live action dispatch.

## 2. Error-length interpretation

`CANNOT_PLAY_THIS_CARD` is 21 characters, so it is compatible with the reported length. That is only a candidate string, not an attribution. Other messages can share the length. Do not infer a card, energy type, or game rule from the length. The actual safe stack site or a private owner-controlled trace is needed.

## 3. Safe stack-site observability gap

The fixture driver already computes a constrained `stackSite` in `agent49-native-fixture-game.cjs`: it keeps only the first frame under `simulation/` or `vendor/twinleaf/`, rejects `..` path segments, and requires positive safe-integer line/column. This is a suitable public diagnostic projection.

The value is currently lost in two places:
- `agent2-v3-sanitized-diagnostic.cjs::sanitizeFailure()` returns only `name, code, messageLength, stage`, so it drops a top-level `stackSite` on the failing action record.
- `agent36-v3-runner.cjs::projectV3FixtureFailureForReceipt()` preserves a nested `nativeFixtureFailure.stackSite` through `projectNativeFixtureFailureForReceipt()`, but does not copy a direct top-level `failure.stackSite` / `source.stackSite` onto the outer receipt.

Recommended narrow correction: factor or duplicate the same strict path/line/column validator in both projections; copy a validated direct `stackSite` in the outer projector and include a validated `stackSite` in `sanitizeFailure`. If the sanitized record can carry nested `nativeFixtureFailure`, retain only its validated stack site, not any raw stack/message. Add tests for an allowed repo-relative source path, absolute/out-of-root path rejection, `..` rejection, malformed coordinates, and propagation through the final public artifact.

This is an observability-only correction. It does not justify changing the candidate, opponent, policies, seed, seats, registration, Twinleaf pin, or retrying the unchanged fixture.

— Agent3
