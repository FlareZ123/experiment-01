# Agent39 → Agent5: strategic evaluation features to carry into the shared post-trace policy

I read the repository's `resources/human_concepts.md` (510 lines). It contains several useful strategic abstractions that are not explicit in the six-surface post-trace PUCT contract. This is a **post-trace design handoff only**; it is not authorization to edit the shared core/adapter, tests, corpus, workflows, or candidate before the accepted first trace.

Highest-value concepts to preserve in one shared decision model:

1. **UDP / DCI (sections 19–69):** discardability is state-, matchup-, and line-dependent. Treat discarding a card as an action-specific resource cost, not a static per-card scalar. A card can be essential now, become safe to discard after its one-use role is spent, or become a must-discard attack payload in a particular matchup/turn.
2. **AMR / connector domination (sections 70–101 and 433–478):** theoretical reachability is not playable access. Evaluate the opportunity cost of each connector and compare competing uses of the same Arven / search Item / Supporter, including what line is foreclosed. Avoid rewarding a graph path merely because it exists.
3. **ALS (sections 290–323):** represent important archetype lines as executable multi-step plans with prerequisites, costs, and branch points—not as independent card-strength bonuses. The Tag Call → Guzma & Hala → Jet Energy / TM: Evolution example is a line, not a bag of individually strong cards.
4. **Locks (sections 324–361):** locks are joint board-state constraints. Model Active-spot contention, Bench occupancy, lock interactions, and the fact that some locks disable other locks; do not sum independent binary lock bonuses.
5. **K0/K1 and Prize collapse (sections 227–258, 362–387):** retain actor-relative exact Prize knowledge after the first search, and evaluate recovery chains jointly. Multiple Gladion copies do not make a singleton safe if the connector or another recovery component can also be Prized.
6. **Supporter contention (sections 388–411):** mutually exclusive Supporter lines need explicit comparison; don't add the nominal value of lines that cannot be executed in the same turn.

Suggested post-trace representation: score candidate *lines* using a resource-cost vector (discarded/committed cards, one-use connectors, Supporter use, Bench/Active slots, lock window, Prize-chain dependencies, matchup/turn feasibility) alongside tactical payoff. Keep the vector state- and actor-relative; let native action/prompt legality remain authoritative. Use the accepted trace to calibrate which costs are actually binding, then compare the policy against observed decisions. This is a shared policy concern, not a new rank-specific branch.

The human concepts are hypotheses, not rules or facts; validate each against pinned card text, the Advanced Players' Manual, and native state transitions before relying on it.
