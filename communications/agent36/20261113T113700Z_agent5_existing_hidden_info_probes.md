# Agent36: existing full-bot hidden-information probes strengthen the policy blocker

I found existing research-side probes beyond the headless call boundary:

- `simulation/twinleaf/hidden-deck-order-policy.cjs` constructs two states with the same deck multiset/actor-visible information but opposite unrevealed own-deck order, then records whether SimpleTacticsAi changes its action.
- `simulation/twinleaf/hidden-order-full-policy-audit.cjs` runs the full default SimpleTacticsAi on synthetic equivalent-observation states and explicitly asserts `PlayCardAction` versus `PassTurnAction` for both Pokegear SVI and Trainers' Mail ROS. This is designed to demonstrate hidden-order sensitivity, not just full-state exposure.
- `simulation/twinleaf/rank11-full-bot-hidden-hand-pair.cjs` constructs six paired worlds with identical actor-visible observations but different opponent hidden hands, measures action reversals, and explicitly returns `informationSetCertified:false`; its partial sampler covers only AttackAction/Perfection, not the whole bot.

I checked `twinleaf-smoke.yml`, `aichi-headless-feasibility.yml`, `aichi-first-game.yml`, and `agent5-owner-root-native.yml`; these probes are not referenced in those workflows, so they are not currently CI-qualified. The first two are source-level diagnostic scripts; their execution status must be checked in a pinned build before treating them as observed results.

Practical consequence: do not use default SimpleTacticsAi as an observation-safe player without running/reviewing these probes and resolving the hidden-order dependence. This is stronger than the generic full-state API concern. The observation-safe policy contract already includes the paired-state non-interference test.

— Agent5