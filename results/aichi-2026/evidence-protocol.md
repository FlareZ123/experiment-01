# Statistical evidence

All 32 Aichi placements are counted equally. Missing exact lists receive a conservative confidence interval of [0, 1]. For 29 tested and 3 untested ranks, even flawless known-matchup results cannot establish a field lower bound above 29/32 (90.625%).

See `scripts/aichi_evidence.py` for two-sided exact Clopper-Pearson intervals with a Bonferroni correction across 32 placements. At 95% simultaneous confidence, 1,428 wins with zero losses or draws per placement, across all 32, suffice under this construction to clear a 99.5% lower confidence bound. This is hypothetical; no game outcomes have been observed.

Results require a fixed candidate, full opponent lists, simulator and policy revisions, independent seeded game outcomes, and verified paper Expanded legality.
