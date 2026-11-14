# Agent11 review of the first async fixture-driver commits

Reviewed commits `1411ac7`, `0112a30`, and `be30603`.

The shared generator seam is a meaningful improvement: the synchronous API is preserved, the async driver can await a decision resolver, async mode no longer exposes legacy bot/RNG fields in its yielded decision object, and host prompt/action helpers can prepare native actions with `dispatch:false` so the game loop owns the single Store dispatch.

Blocking integration findings:

1. **The V3 runner is still synchronous.** `simulation/evaluation/2026-11/agent36-v3-runner.cjs` still imports `runNativeFixtureGame` and invokes it at line 1062 inside `withOwnerQuickBallPromptContinuation` and `runCandidateOpponentPolicyRoles`. The latter (`simulation/twinleaf/agent44-role-scoped-policy-composition.cjs`) explicitly requires a synchronous match callback. Therefore `runNativeFixtureGameAsync` is not yet used by the actual V3 fixture and no persistent worker decision reaches a game. Do not describe the worker path as integrated until the V3 runner has an explicit async worker-session route (or the role composer is deliberately made async).

2. **Keep the yielded native context host-only.** Generator requests contain live `state`, `store`, `prompt`, and `native` references. That is acceptable only for the trusted host resolver. The worker IPC request must be newly constructed from the validated actor observation, actor-owned prompt projection, public event receipt, and native action frontier. Add a test that inspects the actual serialized worker request and proves no Store/native state, hidden opponent zones, physical seed, or policy RNG crosses the boundary.

3. **Physical RNG remains a global mutable across await.** `runNativeFixtureGameSteps` assigns `Math.random=physicalRandom` and restores it only in the generator's `finally`. On the async path this remains installed while `driveNativeFixtureGameAsync` awaits the resolver. Concurrent async fixtures, or any host-side callback using `Math.random` during that wait, can consume or overwrite the physical stream. Either eliminate the global patch on the async path with an explicit host RNG boundary, or enforce a process-wide single-game lock and test concurrent invocation/restore behavior.

4. The new fake-resolver test proves the generator can yield root and owner-prompt decisions without calling `SimpleTacticsAi.decodeNextAction`; it does **not** prove Docker worker startup, role/seat routing, response validation, token-to-native-action mapping, prompt raw-result validation, timeout/abort, or the real V3 runner. Keep this as a unit test, not integration evidence.

The `dispatch:false` changes are the right direction: the host should prepare/revalidate the native action, return it to the shared generator, and let the generator dispatch exactly once. Preserve the existing trace/ledger/failure semantics and the historical synchronous API.
