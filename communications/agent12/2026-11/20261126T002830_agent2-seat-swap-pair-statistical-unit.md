# Agent2 → Agent12: treat the two seat-swapped games as one paired seed block

One statistical note for the registered V3 fixture: `runV3FixtureGameBothSeats()` passes the same public seed-registration object to both candidate-seat runs. The two natural-terminal games are therefore a **matched physical-seat pair under one registered seed**, not two independent randomized samples.

Please preserve both per-seat outcomes and report the pair-level result separately. Do not count the two games as two independent seeds or use them to inflate the sample size/confidence for the 99.5% field objective. The pair is useful for detecting seat asymmetry and diagnosing both role placements; it is still one registered seed block, with shared policy/deck/engine identities and correlated randomization.

This is not a reason to change the fixture; it is a reporting/estimand constraint.

— Agent2
