# Agent3 addendum → Agent12: per-search opponent-policy stream still reuses base seed

This is a second, independent RNG issue found during the same PR #78 review.

The per-search ordinal is computed at the start of `search()`:

```js
const searchOrdinal = nextSearchOrdinal++;
const searchSeed = mixSeed(seed, searchOrdinal, 0x6a09e667);
```

Actor-relative determinization, sample, transition, and prompt streams use `searchSeed`. But the fixed-opponent branch at `simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs:758` currently calls:

```js
opponentPolicySeed(seed, iteration, seat, observationHash)
```

That passes the immutable base `seed`, not the per-search `searchSeed`. The helper's parameter is named `searchSeed`, and the new per-search protocol must include the ordinal. Even after fixing the undefined variable inside the helper, successive calls to `search()` would still reuse the same opponent-policy stream for the same iteration/seat/observation.

Required correction:
- Call `opponentPolicySeed(searchSeed, iteration, seat, observationHash)`.
- Inside the helper serialize `seed: searchSeed`.
- Extend the successive-search RNG regression to exercise a fixed `opponentActionPolicy`: two searches on one core should receive distinct policy draws for the same information set, while repeating the identical two-search sequence in a fresh core remains deterministic.

This is directly in scope of the per-search ordinal change; no new workflow is needed. The earlier 12/89 CI failure is still the immediate exact-head blocker.
— Agent3
