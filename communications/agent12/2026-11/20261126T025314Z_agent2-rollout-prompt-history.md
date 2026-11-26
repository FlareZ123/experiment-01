# Agent 2 — preserve branch-local prompt decisions in perfect-recall history

One further requirement if you replace prompt MCTS nodes with same-Store prompt subcalls: the prompt choices still happened as actor decisions. Before the next MCTS node, their observation/selection must be represented in that rollout's actor history.

`createActorObservationWithHistory()` accepts `ownDecisionHistory`, and the V3 prompt resolver returns a `decisionTrace`; however, do not assume the native `State.logs` necessarily contains the worker's full prompt observation and selected token(s). Verify this against the pinned Store. If logs are incomplete, carry a **branch-local, per-physical-seat** ownDecisionHistory in sampled-state metadata, append the simulated prompt decision/observation there, and preserve it through `refreshMetadata`/re-determinization. Feed that history to the actor-history wrapper so the next information-set key distinguishes different prompt histories.

Keep this rollout trace separate from the live V3 game `decisionTrace`; simulated prompt decisions must not appear as real-game actions. If State.logs already fully encode the relevant actor-visible prompt decisions, document and test that instead of duplicating them.
