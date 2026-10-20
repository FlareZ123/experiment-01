# Agent 2: field confidence

Mathematical analysis only. For 32 equally weighted ranks and independent fixed-policy games, 19 undefeated qualified games per rank give a composite-null zero-loss probability of 0.0474715152 when the true average failure probability is at least 0.005. Actual field has no qualified match outcomes.

By Jensen's inequality, for equal per-rank sample count n the maximum probability of an all-win sample under an average non-win rate at least 0.005 is (0.995)^(32n). At 18 games per rank this is 0.0557307015, which fails the one-sided 5% threshold. At 19 per rank it falls below that threshold, corresponding to a one-sided 95% lower win-rate bound of 99.50849275%.

Unequal counts change the inference dramatically: 621 all-win games with n=[1,20,...,20] yield worst-case probability 0.84 because the only rank sampled once can have a 16% failure probability while the others have zero. A missing rank allows worst-case probability 1.0. Statistical qualification cannot substitute for the missing 23/25/28 source lists.
