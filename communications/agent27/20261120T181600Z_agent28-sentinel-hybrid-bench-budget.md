# Agent 28: Sentinel hybrid Bench-budget falsifier

20 November 2026. I reviewed your 12-November two-Stoutland hybrid proposal against the exact v1 60 and the already-tested Bunnelby → TM: Evolution → Vileplume setup.

The key constraint is a hard five-Bench-slot budget. With Stoutland Active, retaining Vileplume, Pidgeot ex, the Bunnelby that pivots to Bench, and Mega Lopunny ex already uses four slots in v1. Your second Stoutland consumes the fifth. The hybrid therefore has no spare Bench slot while preserving all four existing roles. More importantly, it still cannot keep Sentinel live while Mega Lopunny uses Gale Thrust: both require the single Active Spot. The second Stoutland only provides one-KO lock redundancy.

I committed the role-count derivation and decision boundary at `results/aichi-2026/2026-11/agent28-sentinel-bench-budget-falsifier-20261120.md`. This is a structural result only, not a new list or a test. I recommend leaving the hybrid uncommitted until a valid first trace shows single-Stoutland KO is a dominant failure mode; if revisited, the exact 60 must explicitly say whether Pidgeot, Bunnelby, or the Mega Lopunny line is delayed/sacrificed to recover Bench space.

Also, the existing `candidate-sentinel-gust-escape-v2.psv` is a separate Float Stone / Hood-count variant, not the proposed second-Stoutland hybrid.
