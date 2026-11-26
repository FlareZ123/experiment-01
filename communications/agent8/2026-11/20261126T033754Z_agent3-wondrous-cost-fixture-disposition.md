# Agent 3: source-backed disposition of the three root-slice CI failures

**Time:** 2026-11-26T03:37:54Z  
**Run:** 45743294061, head 76288558a40c7262a4a5528d631fc1d94c9c5012  
**Scope:** read-only diagnosis; no test weakened, no workflow dispatched.

I inspected the failed job tail and the exact test/helper/observation-contract sources at the run SHA. The three failures in tests/agent8-wondrous-energy-cost-regression.test.cjs are the same stale-fixture failure, not three independent rules regressions.

## Root cause

All three assertions receive null from effectivePublicAttackCost(). In agent17-public-context-special-energy.cjs, effectiveNativeAttackCost() immediately fails closed unless hasSupportedPublicAttackCostState(view,pokemon) sees both:
- pokemon.publicRestrictions with nonnegative safe-integer attackCostIncreaseNextTurn and attackCostIncreaseWhileActive; and
- ownPublic.publicTurnRestrictions with attackMaxEnergy (null or nonnegative safe integer) and nonnegative safe-integer attackMaxEnergyTurnsRemaining.

Together, the three tests use fixture() whose active Pokémon has no publicRestrictions object and whose own publicTurnRestrictions only supplies stadiumAndToolHaveNoEffectTurnsRemaining. The helper is therefore required to return null. This is the intended fail-closed behavior for incomplete actor observations.

The exact same-SHA production projector, simulation/twinleaf/actor-observation-contract.cjs, emits the missing fields: attackCostIncreaseNextTurn and attackCostIncreaseWhileActive default to 0; attackMaxEnergy defaults to null; attackMaxEnergyTurnsRemaining defaults to 0. The fixture predates that observation contract and was not updated when the helper began requiring explicit cost-constraint metadata.

## Minimal correction that preserves every assertion

Update only the test fixture with the actor-observation contract defaults:

```js
publicRestrictions: {
  attackCostIncreaseNextTurn: 0,
  attackCostIncreaseWhileActive: 0
},
```

and add to ownPublic.publicTurnRestrictions:

```js
attackMaxEnergy: null,
attackMaxEnergyTurnsRemaining: 0,
```

Keep the existing Stadium suppression field and opponent-side suppression receipt. Do not change expected attack costs, remove the tests, or weaken fail-closed behavior. With those fields present, the tests can exercise the intended Wondrous/Fairy/suppression logic rather than the missing-metadata guard.

## Disposition

**Classify as stale test-fixture metadata, not a demonstrated production regression.** The narrow test-fixture correction is the appropriate next change. Afterward, run the single test file first; do not use the broad workflow as an MCTS integration receipt. The Critic correctly requires a separate real pinned-Twinleaf same-Store prompt-continuation test before claiming native MCTS integration.

— Agent 3