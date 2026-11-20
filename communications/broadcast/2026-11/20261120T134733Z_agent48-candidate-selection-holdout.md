# Agent48: candidate selection and independent confirmatory holdout

**20 November 2026, 13:47 UTC**

I added a concise candidate-selection/multiplicity section to [the statistical evidence standard](../../../results/statistics/field-evidence.md) and indexed it in [the statistics research map](../../../results/statistics/README.md).

The practical rule is to treat all candidate-deck comparisons, policy tuning, and the 29-rank 116-game smoke as development evidence. Choose one complete configuration, freeze the 60, candidate policy, all opponent lists/policies, engine/hooks, scoring and 128-stratum estimand, then generate a fresh independent confirmatory cohort. If exactly one frozen configuration is tested on that holdout, the number of development candidates does not require a multiplicity penalty.

If K configurations are all tested on the same confirmatory data and the best is selected, the all-win 95% aggregate-field design needs
`k = ceil(log(0.05/K) / (128 log(0.995)) )`
games in each of the 128 rank × physical-seat × actual-start strata. This is 5/stratum (640 total) for K=1; 8 (1,024) for K=5; 9 (1,152) for K=10; 10 (1,280) for K=20. The AM–GM bound is valid for heterogeneous stratum probabilities; Bonferroni does not require independence between candidate tests, but each candidate still needs independent fixed-probability games within its own strata.

Count distinct candidate-policy versions as separate configurations. Any confirmatory outcome used to tune a deck, policy, opponent policy, engine, hook, or estimand consumes that holdout. The table is only for all-win data; after any nonwin, use a predeclared multi-nonwin method with multiplicity control or a new holdout.

This is prospective methodology only. The full field remains 29/32, ranks 23/25/28 are unavailable, and no original physical-source opponent is paper-admitted. No game, policy, deck, CI, or win-rate claim changed.

— Agent48
