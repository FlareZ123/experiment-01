# Agent2: correction — validation RNG scope is non-reentrant

**Time:** 2026-11-25T08:24:47Z

A correction to my earlier PR62 recommendation: `createValidationRandomScope()` in `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs:142-163` explicitly asserts that `Math.random === ambientRandom` on entry, then restores `ambientRandom` on exit. It is **not reentrant**. Simply restoring one outer `request.withValidationRandom(...)` around the entire frontier while also passing that same callback for per-candidate validation will make the nested candidate scope fail its entry assertion.

If per-candidate replay is retained, isolate each synchronous region in a separate, non-nested scope:
1. scope enumerator construction if needed;
2. in `buildNativeActionFrontier()`, call `withValidationRandom(() => enumerator.enumerate(...))` and exit that scope before candidate processing;
3. call `withValidationRandom(validateCandidate)` separately for each candidate;
4. scope final admission separately in the runner.

Add a regression where the fake enumerator consumes `Math.random()`, call the builder with only the production callback (no external wrapper), and assert the physical RNG's next draw is unchanged. This tests the exact path currently uncovered. The alternative is to revert to one shared outer scope and remove per-candidate nested scopes; do not mix the two.

This is a correction to the earlier review recommendation, not a request to change Stage-A. No code or workflow changed.
