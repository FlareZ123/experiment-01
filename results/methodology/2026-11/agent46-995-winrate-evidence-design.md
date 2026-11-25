# Statistical evidence design for a 99.5% Aichi-field game-win claim

**Author:** Agent46  
**Date:** 2026-11-25  
**Status:** Prospective methodology only. No qualifying games have been run; this document makes no win-rate claim.

## 1. Define the estimand before collecting games

Let $p_i$ be the probability that the unchanged candidate wins one game against the exact original Aichi list at rank $i$, under a fixed simulator revision, fixed candidate policy, fixed opponent policy, randomized game seed, and randomized physical seat.

For the primary benchmark, weight the 32 ranks equally:

$
p_{field}=\frac{1}{32}\sum_{i=1}^{32}p_i.
$

This is an equal-rank Top 32 estimand, not an archetype-frequency or tournament-population estimate. If another weighting is desired, declare it as a separate estimand before testing. The target is a **single game**, not a best-of-three match.

The current source field is incomplete: only 29/32 exact lists are authenticated; ranks 23, 25, and 28 remain unavailable. A 29-list result can be development evidence, but it cannot establish the 32-rank benchmark.

## 2. Primary field-average claim: use a genuinely random field mixture

For the aggregate claim, independently select the opponent rank uniformly from 1 through 32 for each game (with replacement), draw an independent game seed, and randomize the candidate's physical seat 50/50. Keep the candidate list, candidate policy, opponent list, and opponent policy fixed throughout the holdout. Under this sampling design, each outcome is an independent Bernoulli draw from the equal-rank field mixture $p_{field}$.

Count every game in the denominator. Wins are successes; losses, draws, timeouts, illegal-action aborts, and other non-wins must be reported separately and treated as non-wins for the conservative claim. Do not silently discard inconvenient outcomes.

For (n) games and (k) non-wins, the exact one-sided Clopper–Pearson lower confidence bound is

$
p_L = \operatorname{BetaInv}(\alpha; n-k, k+1),
$

where $\operatorname{BetaInv}$ is the beta-distribution quantile. Claim $p_{field}\ge 0.995$ at 95% one-sided confidence only when $p_L\ge0.995$. With zero non-wins, this reduces to $p_L=\alpha^{1/n}$.

| Non-wins observed | Minimum aggregate games, one-sided 95% |
|---:|---:|
| 0 | **598** |
| 1 | **947** |
| 2 | **1,258** |
| 3 | **1,549** |

Thus 598 zero-loss games is only just sufficient: the lower bound is 99.500294%. One loss raises the requirement to 947 games. These are exact binomial results, not normal-approximation intervals.

**Important allocation caveat:** a deliberately balanced design with exactly the same number of games against each fixed opponent produces independent but non-identically distributed outcomes when the $p_i$ differ (a Poisson-binomial total), not an IID binomial sample. Do not apply the pooled Clopper–Pearson interval to that stratified total as if the opponent rank had been randomly sampled. Either keep a separate uniformly randomized aggregate stream for the field-average claim, or use a pre-specified stratified confidence procedure for the balanced panel.

## 3. Per-matchup reporting is a separate requirement

Report, for every rank, the exact list identifier, number of games, candidate-first/second counts, wins, losses, draws/timeouts, point estimate, and exact one-sided confidence interval. Do not let the aggregate hide a weak matchup.

If the goal is to establish that an individual matchup is at least 99.5%:

| Non-wins in that matchup | Games required for one-sided 95% lower bound | Games required per matchup for simultaneous 95% coverage across 32 (Bonferroni) |
|---:|---:|---:|
| 0 | **598** | **1,290** |
| 1 | **947** | **1,744** |
| 2 | **1,258** | **2,135** |
| 3 | **1,549** | **2,494** |

The zero-loss simultaneous requirement is 1,290 games per rank, or **41,280 games across 32 ranks**. The unadjusted 598-per-rank requirement is 19,136 games, but its 95% intervals do not provide 95% simultaneous coverage for all 32 matchups.

For scale, zero losses in only 19 games against one rank gives a one-sided 95% lower bound of about **85.4%**, not 99.5%. A small clean-looking matchup sample is not evidence for a near-perfect matchup rate.

The primary aggregate claim and the per-matchup panel answer different questions. A field-average result does not establish that every $p_i\ge0.995$. If the project wants both claims, preregister both sampling streams and report both; do not switch estimands after seeing the results.

## 4. Dependence, seat balance, and stopping rules

- Use independent seeds for games in the primary aggregate stream and randomize candidate seat 50/50. Record the seed and seat for every game.
- If the harness runs both seat orientations from the same seed, those games are paired and may be correlated. Treat the pair as a cluster or use a cluster-aware interval; do not count the two games as independent Bernoulli observations.
- Freeze the 60-card list and both decision policies before holdout evaluation. Use separate development and holdout seeds. No tuning, deck edits, policy edits, or opponent-policy changes after inspecting holdout outcomes.
- Pre-register the sample size and stopping rule. Do not stop early because the running win rate looks favorable or continue selectively after an unfavorable result.
- Publish all outcomes, not only wins: include failed setup, invalid action, engine error, timeout, concession, and draw counts with a predeclared handling rule.

## 5. Simulator and opponent-model limitations

These confidence bounds are conditional on the exact simulator and policies used. They do not correct model misspecification, unsupported card effects, incorrect paper rulings, weak opponent policies, or an unrepresentative list. A narrow confidence interval around a biased simulator estimate is still biased.

Before treating the result as evidence of paper competitive strength, record and validate:

1. all 32 exact original opponent lists and their provenance;
2. the fixed candidate's exact 60 cards and legality snapshot;
3. pinned Twinleaf revision and research-code revision;
4. candidate and opponent policy versions and decision-policy assumptions;
5. supported-card/rules coverage and unresolved simulator gaps;
6. seed schedule, physical-seat assignment, outcome handling, sample counts, and raw outcomes.

The current repository has 29/32 authenticated lists, 0/32 qualified competitive matchups, no nominated final 60, and no demonstrated 99.5% field win rate. Current contract-only CI results are not game outcomes. The Stage-A fixture remains frozen; this design does not authorize a fixture, game, new workflow, or deck change.

## 6. Reproducible calculation

The pure-standard-library calculator [`agent46-binomial-lower-bound.py`](agent46-binomial-lower-bound.py) implements the regularized incomplete beta with a continued fraction, inverts it by deterministic bisection, and asserts the minimum sample sizes in both tables.

Run from the repository root:

```bash
python results/methodology/2026-11/agent46-binomial-lower-bound.py
```

Expected output:

```text
losses,aggregate_n_95pct,per_matchup_n_95pct,per_matchup_n_familywise_95pct,total_32_familywise
0,598,598,1290,41280
1,947,947,1744,55808
2,1258,1258,2135,68320
3,1549,1549,2494,79808
19_games_zero_losses_per_matchup_lower_95pct=0.854131496688
```

The script uses Python's standard library only; no SciPy or external package is required.
