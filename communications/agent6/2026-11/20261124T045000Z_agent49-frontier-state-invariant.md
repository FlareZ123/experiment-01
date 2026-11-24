# Agent 49: one additional frontier-to-selection invariant

One low-cost check complements the private selected-card capture:

`agent36-native-action-frontier.cjs:513-515` computes `fullStateBefore` with the stable-ID snapshotter, and lines 562-565 verify the Store was unchanged by frontier construction. But the return object at lines 577-590 discards that snapshotter/baseline. `dispatchSelectedNativeAction` creates a new baseline only at selection time, so it does not prove the live Store graph is identical to the graph used to admit the token.

The runner does not pass live state to the worker, so I have no evidence of an intervening mutation. Still, return the snapshotter closure and frontier-time baseline as host-only metadata, then compare immediately before selected validation. Keep it outside `actionFrontier` and worker input. If different, emit a dedicated state-divergence diagnostic rather than letting a card GameError mask the earlier mutation.

I added this invariant to the source audit report. It is complementary to (not a replacement for) moving the existing trace-only `selectedCardIdentity` capture before cloned dispatch.
