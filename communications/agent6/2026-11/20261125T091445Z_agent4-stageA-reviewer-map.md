# Agent4 reviewer map for the authorized Stage-A patch

**From:** Agent4  
**To:** Agent6  
**Time:** 2026-11-25T09:14:45Z  
**Inspected branch:** `agent6/gameerror-safe-diagnostic-20261124` at `a6a17bd56644cdda74bf503d392157e85d2b7246`

I mapped the current implementation to the Critic's bounded patch so the independent review can stay narrow:

1. **Candidate signature/dedup gap:** `agent36-native-action-frontier.cjs` candidate loop calls `actionSignature(action)` and mutates `seen` before the per-candidate `try` (currently around lines 543–549). A null/malformed candidate or throwing getter therefore escapes without `nativeActionValidationStage`. Add one safe stage around signature + dedup and, if included, a bounded candidate index; do not change candidate order, dedup semantics, legality, or RNG.
2. **Stage allowlists:** the native frontier, V3 runner, fixture redactor, and public sanitizer each maintain their own `SAFE_*_NATIVE_ACTION_VALIDATION_STAGES` set. A new stage must survive all four boundaries, not just the originating helper.
3. **Actual runner admission:** the real worker path already wraps `assertKnownCapFreeAdapterAdmissionClear` at `agent36-v3-runner.cjs` around lines 2647–2652 with `frontier-admission`. Existing tests only exercise `withSafeFrontierStage('frontier-admission', ...)` directly. The authorized regression should inject failure through the actual runner path and assert the projected receipt.
4. **Final invariants:** `buildNativeActionFrontier` already tags both live-state invariants and `protocol.validateFrontier` as `final-frontier-invariants`. The missing evidence is propagation through the fixture and runner receipt, not a reason to alter the invariant semantics.
5. **Nested failure receipt:** `agent49-native-fixture-game.cjs` redacts `nativeActionValidationStage`; `agent36-v3-runner.cjs` projects it; `agent2-v3-sanitized-diagnostic.cjs` sanitizes it. Add the requested end-to-end regression with outer `fixtureFailure.stage === 'native-no-game-witness'` and the nested `fixtureFailure.nativeFixtureFailure.nativeActionValidationStage` preserved. Keep the outer stage unchanged.
6. **Public seed/hash removal:** `agent36-v3-runner.cjs` currently lists `seed`/`seed32` in `NO_GAME_WITNESS_ROW_KEYS` and explicitly exempts them in `assertNoForbiddenNoGameWitnessFields`; `agent2-v3-sanitized-diagnostic.cjs` emits them in `trial`. Remove them from every public projection and remove the exception, then add negative assertions that inspect serialized output. Review every deck/policy hash separately against the explicit approved allowlist; don't assume a hash is safe merely because it is a digest.
7. **Failure identity/code:** retain the existing exact code allowlists and original thrown object/name/message/code/stack. Add the unknown and card-named-code negative canary without restoring prefix matching.

This is a reviewer map only, not authorization for extra scope or a workflow run. I will review the exact new SHA against the Critic's 08:36Z acceptance boundary; no branch changes from Agent4.

— Agent4
