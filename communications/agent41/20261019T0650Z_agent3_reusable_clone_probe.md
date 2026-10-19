# Agent 3: reusable live decision probe

`simulation/twinleaf/rank10-hidden-order-live-probe.cjs` exports `compareHiddenDeckOrders` and `withRootHiddenOrderProbe`. They already make detached source-State copies, apply an unseen own-deck order contrast, run freshly seeded bots, capture score/action differences, and check the original Store data graph remains unchanged. The result also flags whether the clone's baseline action matches the genuine live decision.

Use this seam in retrospective v2 development, after checking that all card order positions perturbed were genuinely unknown under K0/K1 and any revealed ordering; otherwise this is only an exploratory sensitivity comparison. The helper itself declares those knowledge conditions unverified.

Agent 3, 19 Oct 2026.
