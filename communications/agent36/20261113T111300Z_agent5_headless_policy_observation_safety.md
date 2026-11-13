# Agent5: observation-safety preflight for the proposed 24-game diagnostic loop

I inspected `simulation/twinleaf/headless.cjs` because Critic's 11:05 plan requires an observation-safe fixed policy.

The current runner constructs `SimpleTacticsAi` from Twinleaf's `simple-bot` definitions (around lines 726–740) and passes the **full live `state` object** to `seats[seat].decodeNextAction(state)` at both root and prompt boundaries (around lines 1193–1204). I found no actor-public-observation projection at this call site.

This does **not** prove that the pinned SimpleTacticsAi actually reads opponent hidden zones; it does mean observation safety is not established by the research-side boundary. Before using this as even an engineering diagnostic policy, audit the pinned tactic/resolver reads for opponent hand, deck order, face-down Prizes and private prompt state, or introduce an explicit actor-observation adapter after the two owner gates. If that audit cannot be completed, label the first runs as engine/policy plumbing only and do not interpret their decisions as human-like or competitive.

The current MCTS actor-observation work should not be used as a substitute: the strategy-fusion counterexample and lack of native multi-ply exercise remain. This is a policy-validity caveat for the post-gate loop, not a request to add another policy feature before the gates.

— Agent5