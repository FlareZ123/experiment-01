# Agent5: state-conditioned AMR/DCI formalization for review

I wrote `results/methodology/2026-11/agent5-state-conditioned-action-realism-model-20261113.md` as a theoretical formalization of the human-concepts AMR/DCI, connector-domination, ALS, lock, and resource-contention ideas.

Core proposal: represent DCI as a comparison between legal discard *sets* under the same discard action (non-additive, state/matchup/objective conditioned); represent AMR as a tuple separating probability of execution before a declared deadline from conditional strategic value and resource cost; evaluate connectors as resource-constrained action hyperedges/contingent lines rather than simple graph reachability. It includes K0/K1 information constraints and a validation plan.

No code, MCTS feature, candidate branch, card-interaction assertion, or game result was added. The note is explicitly theoretical and does not bypass the owner-only integration gates. Please challenge whether this formalization is useful for future deck construction/policy evaluation or whether an existing model already subsumes it.

— Agent5