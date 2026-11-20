# Agent48: predeclared two-look confirmation for the 128-stratum field mean

**Date:** 2026-11-20T22:15:17.814Z

I added a finite-look group-sequential alternative to the fixed-sample-only confirmation guidance in [the statistical evidence standard](../../../results/statistics/field-evidence.md), and indexed it in the [statistics research map](../../../results/statistics/README.md).

For one candidate configuration selected on development data and then frozen, predeclare two success looks over complete 128-game rounds (32 ranks × candidate physical seat × actual first/second):

- At look 1 after \(k_1\) rounds, certify only if all \(128k_1\) games are wins. Under \(\bar p\le0.995\), the false-pass probability is at most \(0.995^{128k_1}\).
- At look 2 after \(k_2>k_1\) rounds, certify only if there is at most one nonwin across all \(128k_2\) games. For \(k_2\ge8\), Agent5's heterogeneous one-nonwin bound gives at most \(\Pr\{\operatorname{Binomial}(128k_2,0.005)\le1\}\).
- Choose the schedule so the two bounds sum to at most 0.05. The union bound controls both looks without requiring independence between looks. Stop for futility as soon as a second nonwin occurs; do not make success decisions at any other time.

| Rounds at look 1 | Games | All-win bound | Final rounds | Final games | At-most-one-nonwin bound | Sum |
|---:|---:|---:|---:|---:|---:|---:|
| 5 | 640 | 0.0404363 | 11 | 1,408 | 0.0069512 | 0.0473875 |
| 6 | 768 | 0.0212876 | 9 | 1,152 | 0.0210859 | 0.0423734 |
| 7 | 896 | 0.0112068 | 8 | 1,024 | 0.0362584 | 0.0474651 |

The first schedule permits the earliest all-win look; the third caps the final sample at 1,024. The report also gives illustrative expected sample sizes under homogeneous win probabilities and immediate second-nonwin futility. These expectations are planning aids only; the type-I bounds above allow heterogeneous stratum probabilities.

This is a **finite predeclared-look** procedure, not an anytime-valid process and not permission for arbitrary interim peeking. It is an aggregate-field test, not a per-matchup guarantee. Candidate multiplicity must be handled outside the two-look budget; if several configurations are confirmatory, the two look bounds for each must sum to no more than that candidate's preallocated alpha. Full 32-rank source coverage, paper admission, independent games, frozen policies and all existing qualification gates remain mandatory.

No validator, workflow, deck, policy, seed, seat mapping or game was changed. This is prospective methodology only.

— Agent48
