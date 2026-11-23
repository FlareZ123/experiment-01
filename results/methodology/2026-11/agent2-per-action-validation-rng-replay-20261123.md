# Per-action native frontier RNG replay: deterministic counterexample and isolated repair (2026-11-23)

**Agent:** Agent2. **Status:** source-level reproducibility result, executable pure regression **passed**, actual Stage-A failure attribution **not established**. **Repair:** [draft PR #62](https://github.com/FlareZ123/experiment-01/pull/62); [isolated CI run 45264571903](https://github.com/FlareZ123/experiment-01/actions/runs/45264571903), head `7cf5304711825134a8d3901eb205538379d1d33b`, successful.

## Mechanism

The V3 runner's root path formerly invoked:

```js
const {frontier,admission}=request.withValidationRandom(()=>{
  const enumerator=...;
  const frontier=actionFrontier.buildNativeActionFrontier({...});
  ...
});
```

The **entire** `buildNativeActionFrontier` loop performed one separate native `Simulator` clone-and-dispatch per action, but under **one shared seeded RNG scope**. Every preceding action's random draws affected what a later cloned Store would see.

The same runner then calls `actionFrontier.dispatchSelectedNativeAction`, which creates another cloned Store **inside a new** `request.withValidationRandom()`. In `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`, `createValidationRandomScope` creates a **fresh** deterministic `seededRandom(validationSeed)` closure on each call. Therefore selected replay begins at the *first* validation RNG draw even if the selected action was the second, third, etc. item in the original frontier.

This can create the following contradiction with no change in physical game state or opponent policy:

| Action | Historical shared frontier RNG | Later selected replay |
|---|---:|---:|
| First candidate | 0.25266689783893526 (draw #1) | not selected |
| Second candidate | 0.5698249398265034 (draw #2) | 0.25266689783893526 (reset draw #1) |

The source-pure regression in `tests/2026-11/agent36-native-action-frontier.test.cjs` supplies a synthetic native action that rejects if `Math.random() < 0.5` with the **expected typed** `GameError('CANNOT_USE_POWER')`. On the historical shared scope the second action incorrectly survives frontier validation, but the worker-selected clone replay throws `CANNOT_USE_POWER`. The test explicitly demonstrates the contradictory old path, then verifies corrected behavior.

## Repair semantics

Draft PR #62 adds optional `withValidationRandom` to `buildNativeActionFrontier()`, wrapping each candidate's cloned Simulator creation, exact-scoped Item preflight and dispatch separately; V3 runner supplies its existing per-decision validation scope at the candidate level instead of wrapping all candidates together. The selected cloned Store replay already uses one freshly seeded scope, so **both paths now use the same RNG prefix for the same candidate**.

The corrected regression shows: three independent candidate probes each observe `0.25266689783893526`; the RNG-sensitive second action is correctly excluded, while other valid actions (including Pass) remain in the frontier. The physical shuffle RNG next value is unchanged. Existing fail-closed unexpected GameError handling is retained.

The pinned Twinleaf `ptcg-server/src/advanced-bot/action-enumerator.ts` has **no** `Math.random` calls, so moving deterministic scope from outer enumeration to individual cloned Store probes does not leave any enumerator RNG calls unscoped in that pinned upstream implementation.

## Interpretation and limits

- **Proved by construction:** old source permits sequence-dependent candidate-validation and selected-replay disagreement, even though both are branded deterministic. This can produce a false-negative root choice or a post-worker error.
- **Not proved:** that the frozen Stage-A ordinal-23 `messageLength=18` error was caused by RNG divergence. Its exact raw error code and concealed selected action were not disclosed to this investigation.
- **Not a deck-strength result:** no complete games, matchups, opponents or Prize awards were simulated by this regression; it cannot support any win-rate claim.
- **Integration boundary:** PR #62 remains a separate draft, not the accepted Stage-A SHA. Any merge requires owner-reviewed same-head contract/no-game witness/registered two-seat fixture acceptance under the original immutable deck, seed and policy registrations.

The actionable result is a minimal adapter repair plus a regression able to reject reintroduction of the old asymmetry. Avoid replacing it with broad error suppression, random fallback actions, changing the actual physical RNG seed, or untrusted raw worker logs.
