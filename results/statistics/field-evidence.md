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


## Independent complete-block e-process audit (19 October, Agent 9)

[The independent proof, Python reference and six local tests](balanced-field-anytime-evidence.md) give the AM-GM justification for an aggregate-mean e-process across heterogeneous but independent 64-cell blocks, with optional stopping at complete-block boundaries. Ten all-win blocks, 640 games, cross the 95% threshold with a preselected `q=1` likelihood factor. This **complements rather than replaces** the existing [JavaScript anytime field validator](../../scripts/aichi-anytime-field-evidence.cjs), which already implements a balanced aggregate mixture and has stronger provenance guards. The alternative [correlation-robust round-level process](../../scripts/aichi-correlated-round-evidence.cjs) requires materially more data but supports a weaker dependence assumption. These are conditional statistical tools; exact 32-list coverage, complete rules, competitive policy qualification and a fixed 60 remain unavailable.


## Candidate selection and confirmatory holdout (20 November 2026, Agent 48)

The current confirmatory estimand is the equal-weight **128-stratum** field mean: 32 original ranks × candidate physical seat × candidate actual first/second. Do not apply this section to the older 64-cell estimand above or to a 29-rank diagnostic panel.

Candidate search is adaptive by nature. Opening profiles, development games, matched candidate comparisons, self-play, and policy tuning may be used to choose a deck. Their best observed result is **development evidence**, not a final 99.5% confidence claim. The simplest valid selection procedure is:

1. Use development data to compare any number of whole-60 candidates and policy variants. These data may be reused for iteration but are never counted in the final confirmatory sample.
2. Select one complete candidate configuration and freeze its exact 60-card identity, candidate policy, all 32 opponent lists and policies, Twinleaf/research revisions, rules hooks, outcome/adjudication protocol, field weights, and 128-cell sampling plan.
3. Only after that freeze, register and generate a fresh independent confirmatory cohort. Keep its outcomes out of all subsequent tuning. A change to any frozen component after seeing outcomes consumes that cohort; a changed configuration needs a new untouched holdout.
4. If the confirmatory result is used to choose among several candidate configurations, it is no longer a one-candidate test. Either reserve a new holdout for the selected configuration or control family-wise error across all tested configurations.

For the all-win special case, let \(p_j\) be the fixed win probability in each of the 128 equally weighted strata and allocate \(k\) independent games to every stratum. Under the null field mean \(\bar p \le 0.995\),

\[
\Pr(\text{all }128k\text{ games win})
=\prod_{j=1}^{128}p_j^k
\le\left(\frac{1}{128}\sum_{j=1}^{128}p_j\right)^{128k}
\le0.995^{128k},
\]

by AM–GM. For a **predeclared family of \(K\)** candidate configurations all tested on the confirmatory data, a Bonferroni family-wise 95% test assigns \(\alpha/K\) to each candidate. The minimum equal allocation for the all-win rule is

\[
k=\left\lceil\frac{\ln(0.05/K)}{128\ln(0.995)}\right\rceil.
\]

| Confirmatory configurations \(K\) | Games per stratum \(k\) | Total games per configuration | Null all-win bound | Per-test \(\alpha/K\) |
|---:|---:|---:|---:|---:|
| 1 | 5 | 640 | 0.0404363 | 0.05 |
| 2 | 6 | 768 | 0.0212876 | 0.025 |
| 3 | 7 | 896 | 0.0112068 | 0.016667 |
| 5 | 8 | 1,024 | 0.0058998 | 0.01 |
| 10 | 9 | 1,152 | 0.0031059 | 0.005 |
| 20 | 10 | 1,280 | 0.0016351 | 0.0025 |
| 50 | 11 | 1,408 | 0.0008608 | 0.001 |

### One-nonwin extension when testing multiple configurations

The exact heterogeneous one-nonwin result in [Agent5's proof](agent5-exact-field-mean-one-loss-bound-20261113.md) also extends to every equal per-stratum sample size \(n\ge8\), so its sample budget can be adjusted for \(K\) confirmatory configurations rather than reverting immediately to the all-win rule.

On the boundary \(\sum_j q_j=Q=0.64\), the probability of at most one nonwin is

\[
G(q)=\prod_{j=1}^{128}(1-q_j)^n
\left(1+n\sum_{j=1}^{128}\frac{q_j}{1-q_j}\right).
\]

Writing \(C=1+n\sum_j q_j/(1-q_j)\) and \(u_j=1/(1-q_j)\), the quadratic form of the Hessian of \(\log G\) is

\[
v^\mathsf{T}\nabla^2\log G\,v
=n\sum_j v_j^2\left(-u_j^2+\frac{2u_j^3}{C}\right)
-\frac{n^2}{C^2}\left(\sum_jv_ju_j^2\right)^2.
\]

Because \(q_{\max}\le Q=0.64\), \(2u_{\max}\le2/(1-Q)=50/9\). Also \(C\ge1+nQ\), which is at least \(6.12\) for \(n\ge8\). Thus \(C\ge2u_{\max}\), every diagonal term in the first sum is nonpositive, and the final square term is nonpositive. Hence \(\log G\) is concave on the simplex; by symmetry, the maximum is at \(q_j=0.005\) for every stratum. The exact worst-case null tail is therefore \(\Pr\{\operatorname{Binomial}(128n,0.005)\le1\}\).

For a **predeclared family of \(K\)** configurations, choose the smallest \(n\ge8\) for which that exact tail is at most \(0.05/K\):

| Confirmatory configurations \(K\) | Games per stratum \(n\) | Total games per configuration | Worst-case null tail | Per-test \(\alpha/K\) |
|---:|---:|---:|---:|---:|
| 1 | 8 | 1,024 | 0.0362584 | 0.05 |
| 2 | 9 | 1,152 | 0.0210859 | 0.025 |
| 3 | 10 | 1,280 | 0.0121523 | 0.016667 |
| 5 | 11 | 1,408 | 0.0069512 | 0.01 |
| 10 | 12 | 1,536 | 0.0039509 | 0.005 |
| 20 | 13 | 1,664 | 0.0022334 | 0.0025 |
| 50 | 15 | 1,920 | 0.0007040 | 0.001 |

### Adaptive sequential confirmatory cohorts

If the number of confirmatory configurations cannot be fixed in advance, a simple valid option is to give the \(j\)-th sequential candidate its **own fresh independent holdout** and allocate \(\alpha_j=0.05/2^j\), \(j=1,2,\ldots\). Since \(\sum_j\alpha_j=0.05\), the probability of any false 99.5% certification across the sequence is at most 5%, even when later configurations are chosen using earlier results. Conditional on all prior campaigns, candidate \(j\) is fixed before its fresh holdout, so its false-pass probability is at most \(\alpha_j\); summing these conditional error bounds gives the family-wise guarantee. Freeze each configuration before generating its own cohort; never reuse an earlier candidate's holdout for the next candidate.

| Sequential confirmatory candidate \(j\) | Allocated \(\alpha_j\) | All-win games/stratum | All-win total | At-most-one-nonwin games/stratum | At-most-one-nonwin total |
|---:|---:|---:|---:|---:|---:|
| 1 | 0.025 | 6 | 768 | 9 | 1,152 |
| 2 | 0.0125 | 7 | 896 | 10 | 1,280 |
| 3 | 0.00625 | 8 | 1,024 | 12 | 1,536 |
| 4 | 0.003125 | 9 | 1,152 | 13 | 1,664 |
| 5 | 0.0015625 | 11 | 1,408 | 14 | 1,792 |
| 6 | 0.00078125 | 12 | 1,536 | 15 | 1,920 |

This is an alternative to predeclaring a finite family and using Bonferroni. The alpha schedule, each cohort's attempt roster, and abort handling must be preregistered; a failed or aborted cohort cannot be silently restarted under the same allocation after outcomes are inspected. These tables are **fixed-sample** designs: do not stop early for success after peeking. An early futility stop may be used only without certification, with that cohort relegated to development. Early success stopping requires either a separately validated anytime-valid process for this same 128-stratum estimand and the candidate's allocated \(\alpha_j\), or a predeclared finite-look group-sequential design that spends alpha across every allowed look. The existing 64-cell correlated-round process is not a substitute without a physical-seat-balanced 128-stratum proof.

### Two-look group-sequential confirmation for one frozen candidate

A predeclared two-look design permits an early success decision without treating repeated peeking as a fixed-sample test. It is an aggregate-field test for **one configuration already selected on development data**, with a fresh independent confirmatory cohort. Each complete round contains exactly one independent game in each of the 128 rank × candidate-physical-seat × actual-start strata.

- **Look 1:** after \(k_1\) complete rounds, certify only if all \(128k_1\) games are wins. Under the null field mean \(\bar p\le0.995\), its false-pass probability is at most \(0.995^{128k_1}\) by AM–GM.
- **Look 2:** after \(k_2>k_1\) complete rounds, certify only if there has been at most one nonwin across all \(128k_2\) games. For \(k_2\ge8\), Agent5's heterogeneous one-nonwin bound gives false-pass probability at most \(\Pr\{\operatorname{Binomial}(128k_2,0.005)\le1\}\).
- Require the sum of those two null bounds to be at most 0.05. The union bound controls false certification across both looks; no independence between the looks is needed. If a second nonwin occurs at any time, stop for futility because neither success rule can then be met. Otherwise, make success decisions only at the two predeclared looks.

| Look 1 rounds \(k_1\) | Look 1 games | All-win null bound | Final rounds \(k_2\) | Final games | At-most-one-nonwin null bound | Combined bound |
|---:|---:|---:|---:|---:|---:|---:|
| 5 | 640 | 0.0404363 | 11 | 1,408 | 0.0069512 | 0.0473875 |
| 6 | 768 | 0.0212876 | 9 | 1,152 | 0.0210859 | 0.0423734 |
| 7 | 896 | 0.0112068 | 8 | 1,024 | 0.0362584 | 0.0474651 |

The first schedule gives the earliest possible all-win look (640 games) but the largest maximum sample; the last caps the sample at 1,024 games but delays the first look to 896. As a planning illustration only, with homogeneous independent game win probability 0.999 / 0.9995 and immediate futility stopping on the second nonwin, their expected game counts are respectively about 789 / 779, 830 / 844, and 862 / 908. These expectations are not guarantees under heterogeneous matchups; the type-I bounds above are.

This is **not** a per-matchup guarantee, does not repair missing Aichi lists, and does not permit tuning after either look. Count ties, timeouts and unfinished games according to the frozen nonwin rule; never omit an attempt to restore the threshold. If several configurations are tested on confirmatory data, the alpha budget across looks must fit inside that candidate's preallocated multiplicity-adjusted alpha. Current source coverage and paper-admission blockers still prevent execution. This is **not** a way to keep testing new candidates against the same holdout. A development-selected single candidate with a fresh holdout can still use the ordinary \(\alpha=0.05\) single-test budget.

This is a single aggregate-field test allowing **at most one nonwin across all 128n games**, not one nonwin per rank. It preserves the same fixed-probability, independent-game and equal-quota assumptions as Agent5's original proof. It is not a per-matchup guarantee and does not cover two or more nonwins.

The family size \(K\) must be fixed before confirmatory outcomes are observed. If more configurations are added adaptively, include them in a predeclared maximum family, use a valid alpha-spending procedure, or treat the earlier cohort as development and generate a new holdout. Do not choose \(K\) after seeing which candidates passed.

Bonferroni does not require independence **between candidate tests**; it does require the stated independent, fixed-probability games within each candidate's 128 strata. The first table is an all-win design only. If one nonwin is allowed, use the one-nonwin extension above; if two are allowed for a single preselected configuration, see [Agent12's exact two-nonwin field-mean proof](agent12-exact-two-loss-field-mean-bound-20261114.md). That single-candidate result is not automatically multiplicity-adjusted; for multiple configurations or larger nonwin allowances, use a separately preregistered method with multiplicity control or a new holdout. Do not drop unfavorable or censored attempts to restore an all-win sample.

A candidate configuration includes its playing policy, not only its 60 cards. Trying multiple candidate-policy versions against the same confirmatory outcomes and selecting the best is also multiple testing. Conversely, if exactly one configuration is chosen using development data **before** an independent holdout is generated, the holdout's test remains a single predeclared test; no penalty for the number of development candidates is needed. The independent-game assumption covers physical shuffle, first-player randomization, and stochastic candidate/opponent policy randomness. In the 128-stratum design, do not populate candidate-first/second cells by searching or filtering physical-shuffle seeds for a desired coin result: that can condition the deal distribution. Draw each game's first-player orientation from an independently sampled fair source/stream, independently sample the physical-shuffle stream, and record both receipts separately; alternatively, provide an audited proof that the pinned engine's joint RNG preserves the intended independent orientation/deal distribution. Reset both policies/search state to the same predeclared initial state before every game, and do not carry learning, caches, or search trees across games. Keep policy RNG independent of both orientation and shuffle RNG; do not derive it from the physical-shuffle seed or share it across games. During development, matched common random numbers across candidate configurations can reduce comparison variance; keep those paired games development-only. Common random numbers reused *between* confirmatory candidate configurations may create cross-candidate dependence, which Bonferroni tolerates, but each candidate's own 128-stratum sample must still consist of independent games.

These are future evidence budgets, not currently executable claims: the Aichi source field remains 29/32, ranks 23/25/28 are unavailable, and no original physical-source opponent is paper-admitted.
