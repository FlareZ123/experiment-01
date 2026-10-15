# Fixed-deck Aichi benchmark: evidence standard and feasibility

**Agent 5, 15 October 2026.** This is statistical-methodology research, not a measured matchup result or a recommendation for a new deck.

## Precise target

For a single unchanged 60-card deck and an unchanged playing policy, define
`p[r,first]` and `p[r,second]` as its respective game-win probabilities against the player at Aichi Top 32 rank `r`, when the candidate takes the first or second turn. Treat ties, timeouts and unfinished games as nonwins unless a different scoring convention is explicitly declared in advance.

An equal-placement, equal-seat objective is:

`p_field = sum(r=1..32) (p[r,first] + p[r,second]) / 64`.

The goal `p_field >= 0.995` is one interpretation of the requested 99.5% across-field game win rate. It assumes uniform placements and uniform turn-order weights, not historical tournament frequencies or metagame share. Those alternative weightings need distinct reports.

As of this document, [three exact decklists are missing](../aichi-2026/README.md): ranks 23, 25 and 28. Even unlimited perfect results against the other 29 opponents cannot establish a 99.5% lower bound for the *complete* field without evidence about these three. If their unmeasured probabilities are allowed to be zero, the maximal lower bound from the remaining 29 is 29/32 = **90.625%**. A separate published-list benchmark can report the 29 known placements with explicit scope.

## Structural consequences of the objective

The desired total loss-probability budget is `32 * (1 - 0.995) = 0.16` across the 32 rank-averaged matchups.

- Even with perfect results against the other 31 ranks, a single rank's win probability must be at least **84%**.
- There are [11 Regidrago placements](../aichi-2026/README.md). If every other archetype matchup had 100% win probability and all 11 Regidrago placements had equal strength against the candidate, that shared Regidrago win probability would need to be **98.54545%** or higher.
- A candidate that is identical to one opponent's list *and is played by identical policies under a symmetric, equally seat-balanced experiment* has a 50% expected win rate in that mirror matchup, assuming no ties. Even with 100% wins against the remaining 31 ranks, the field average would be at most **98.4375%**. This illustrates the inadequacy of copying one field list for the extreme target. The bound does not apply when policies have different skill, or when the candidate differs from the opposing list.

These are algebraic consequences of the chosen benchmark, not estimates of actual Pokémon matchup strength.

## Confidence and sample requirements

For a **fixed, predeclared** candidate and fixed policy, one-sided exact binomial confidence bounds can quantify uncertainty when games within each opponent-and-seat cell are independent Bernoulli trials with a stable win probability. Random seeds, simulator revision, decks, AI policy, first-turn rules and outcome definitions must all be recorded. Reusing a seed for correlated paired experiments requires separate validity analysis.

For a cell with `w` wins in `n` trials, use its one-sided Clopper-Pearson lower confidence bound at `alpha = 0.05 / 64`. The Bonferroni union bound gives at least 95% simultaneous coverage across all 64 predefined cells. Averaging their lower bounds gives a conservative 95% lower bound for the equal-placement, equal-seat field average. Unobserved cells contribute zero lower confidence bound. The result is valid under the stated sampling assumptions regardless of dependence between *different* cells.

For the special case of zero observed losses, the exact one-sided lower bound is `alpha^(1/n)`. This permits a simple feasibility calculation:

| Interpretation | Simultaneous families | Minimum all-win trials per family | Total games if all perfect |
| --- | ---: | ---: | ---: |
| One fixed matchup, one-sided 95% | 1 | 598 | 598 |
| 29 published opponents, ignoring seats | 29 | 1,270 | 36,830 |
| 32 opponents, ignoring seats | 32 | 1,290 | 41,280 |
| 32 opponents, first/second separated | 64 | 1,428 | 91,392 |

Each row uses a strong **sufficient** condition that its every family's lower confidence bound exceeds 99.5%. The objective only requires the weighted **average** to exceed 99.5%, so these sample counts are not mathematical necessities. Splitting the seats is recommended because first/second performance may differ, and blindly pooling unequal-probability seat trials invalidates a simple iid binomial model.

The 64-cell all-win figure is a severe lower-bound stress test for the experimental budget, especially when the engine may lack implementations for some Expanded cards. It provides a reason to invest in *coverage and policy fidelity before brute-force simulation*.

## Reusable implementation

The [`scripts/matchup_evidence.py`](../../scripts/matchup_evidence.py) library exposes `SeatRecord`, `summarize`, `exact_lower`, and `minimum_all_wins`; the [tests](../../tests/test_matchup_evidence.py) check exact endpoints, sample sizes, coverage accounting and invalid inputs. The implementation uses SciPy's documented [`binomtest(...).proportion_ci(..., method="exact")`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binomtest.html). No CI workflow is scheduled.

The function's `statistical_threshold_met` flag means only that observed, complete, model-assumed sampling crosses the chosen confidence threshold. It cannot authenticate card legality, 60-card deck fidelity, engine semantics, player-policy strength or unseen Japanese printings. It also does not correct for choosing a winning candidate *after seeing the evaluation results*. Use development simulations to select a candidate, freeze deck and policy, then use a separately seeded holdout evaluation for any final statistical claim.

**Immediate priorities:** complete all available card-ID and engine coverage checks; produce valid games with documented policy limitations; secure or explicitly omit missing rank lists; test all difficult matchups in both seats before reporting an aggregate result.

## Evidence status

No actual Aichi matchup results were generated for this study. The provided paper Expanded game manual supports gameplay setup and rules, while this statistical report concerns experimental inference. The requested 99.5% achievement remains unverified.
