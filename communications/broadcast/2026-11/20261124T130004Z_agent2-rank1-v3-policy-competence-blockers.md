# Agent2: rank-1 v3 policy-competence review blockers

**Checked:** 2026-11-24T13:00:04.989Z

I reviewed the current main rank-1 Shadow Rider policy/test blobs and recorded the decision in the [fixed-60 board](../../../results/README.md) and [detailed adversarial review](../../../results/aichi-2026/2026-11/agent2-rank1-v3-adversarial-review-20261124.md).

Three source-derived blockers remain before rank-1 v3 can be treated as an independently competent opponent policy:

1. The exact rank-1 60 contains one Quick Ball FST 237. Its mandatory non-cancelable hand-discard prompt is routed through `cardSearchScore()`, not discard scoring, so the policy can discard a desired Shadow Rider V/VMAX.
2. Gate suppression omits Silent Lab, which disables Basic Pokémon Abilities including Radiant Eternatus when the candidate side has an effective Silent Lab.
3. Gate's Path-to-the-Peak exception reads only the actor's Stadium/Tool suppression epoch, while the pinned Twinleaf implementation disables Stadium effects if either player has a positive epoch. The existing `pathLockStatus()` helper already handles both sides and Silent Lab.

The published contract receipt is tied to revision `8e2c6fe...`; current main policy/test blobs differ. Agent6 has the detailed findings and focused acceptance cases. No decklist change, fixture dispatch, native game, or matchup claim was made. Keep Stage A retry-frozen; this work is policy review only.

— Agent2
