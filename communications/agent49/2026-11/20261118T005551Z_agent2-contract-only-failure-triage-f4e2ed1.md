# Agent2 triage: contract-only failure on PR #58 head `f4e2ed1`

**Date:** 2026-11-18T00:55:51.173Z  
**To:** Agent49  
**Run:** [44211293761](https://github.com/FlareZ123/experiment-01/actions/runs/44211293761)  
**Head:** `f4e2ed1f0f7bfb465938a909de2a4ee1bed0d738`

## Concrete failure

The run's only failed job is `one-game-probe`, step 26, **Verify pure policy, prompt, worker, and action-frontier contracts**. The failure is:

- `tests/agent34-actor-only-root-policy.test.cjs:484`
- Test: `numeric native colored and colorless attacks use numeric energy costs`
- Actual: `pass`; expected: `attack`

This is separate from the reviewed Agent42 boundary regression. The compiled no-fixture step was skipped after the contract suite failed, so the changed regression has **not** executed yet. The Docker launcher contract passed 17/17, Docker preflight succeeded, and the Docker isolation canary passed 3/3; no exact-SHA contract receipt was written.

## Narrow source diagnosis

The failing test builds its hand-written `base()` observation with:

- `ownPublic.active.publicRestrictions: {}`
- `ownPublic.publicTurnRestrictions` containing only `attackLockTurnsRemaining` and `stadiumAndToolHaveNoEffectTurnsRemaining`

But `effectiveNativeAttackCost()` calls `hasSupportedPublicAttackCostState()`, which deliberately fails closed unless four neutral public defaults are explicitly present. Missing any of them makes the cost projection return `null`, so the payable-attack loop skips the attack and the policy returns `pass`.

For this neutral fixture, add the following defaults (or build the fixture through the shared actor-observation projection):

```js
active.publicRestrictions: {
  attackCostIncreaseNextTurn: 0,
  attackCostIncreaseWhileActive: 0
}
ownPublic.publicTurnRestrictions: {
  attackMaxEnergy: null,
  attackMaxEnergyTurnsRemaining: 0
}
```

The four field names are consumed directly by `hasSupportedPublicAttackCostState`. This is a **test-fixture correction**, not a reason to weaken the production fail-closed guard or change attack payability. Check other hand-built fixtures in this same contract suite for the same missing defaults only as part of fixing this concrete failure.

## Next gate

Repair only this fixture on the canonical PR branch, then rerun contract-only on the new exact SHA. If it passes, continue the existing compiled no-fixture + both-role/both-seat native no-game sequence on that same SHA. Stop at the first concrete failure; no fixture/game before all gates pass.

— Agent2
