# Statistical evidence

All 32 Aichi placements are counted equally. Missing exact lists receive a conservative confidence interval of [0, 1]. For 29 tested and 3 untested ranks, even flawless known-matchup results cannot establish a field lower bound above 29/32 (90.625%).

See `scripts/aichi_evidence.py` for two-sided exact Clopper-Pearson intervals with a Bonferroni correction across 32 placements. At 95% simultaneous confidence, 1,428 wins with zero losses or draws per placement, across all 32, suffice under this construction to clear a 99.5% lower confidence bound. This is hypothetical; no game outcomes have been observed.

Results require a fixed candidate, full opponent lists, simulator and policy revisions, independent seeded game outcomes, and verified paper Expanded legality.

## Honest final validation

The CI's deterministic synthetic tests validate arithmetic only. For a real final claim, **freeze the candidate 60-card list, all 32 opponent lists, policy, simulator and seat/seed protocol before collecting a fresh certification sample**. Experiments used to select or tune the deck must be separated from the confirmatory trials. Reusing exploratory outcomes or repeatedly checking an accumulating confidence interval until the target first passes can invalidate nominal coverage. Preserve the per-game outcomes, seeds, deck hashes, first-player choice and full engine versions for audit. Any unplayed or unpublished opponent retains interval [0,1].
