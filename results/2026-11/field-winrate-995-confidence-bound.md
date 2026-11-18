# Minimum evidence for a 99.5% equal-weight Aichi field win rate

**Type:** mathematical derivation / experimental-design constraint  
**Status:** exact under the stated independent-game model; not empirical deck evidence  
**Date:** 2026-11-18

## Question

How many games with no observed losses are sufficient to support the claim that one fixed deck/policy has at least a 99.5% win rate against the equally weighted 32-opponent field?

Let opponent rank (i\) have a fixed loss probability (q_i\), and define the field-average loss probability

\[
\bar q=\frac{1}{32}\sum_{i=1}^{32}q_i.
\]

The target is \(\bar q\le 0.005\). This is an aggregate-field claim; it is not the stronger claim that every individual matchup has a 99.5% win rate.

## Exact zero-loss bound

For one IID Bernoulli sample with zero losses in (N\) games, the one-sided exact 95% upper confidence bound on the loss probability is

\[
q_U=1-0.05^{1/N},
\]

so the corresponding lower bound on win rate is \(0.05^{1/N}\). Requiring this to be at least 0.995 gives

\[
N\ge \left\lceil\frac{\ln(0.05)}{\ln(0.995)}\right\rceil=598.
\]

At 99% one-sided confidence, the analogous minimum is 919 zero-loss games.

## Balanced 32-rank design

A transparent stratified design samples each of the 32 ranks exactly 19 times, for 608 total games, with independent game seeds and the same frozen candidate deck/policy and frozen opponent policy for each rank.

If rank (i\) has loss probability (q_i\), the probability of observing zero losses in all 608 games is

\[
P(0\text{ losses})=\prod_{i=1}^{32}(1-q_i)^{19}.
\]

Because \(\log(1-q)\) is concave, Jensen's inequality gives

\[
\prod_{i=1}^{32}(1-q_i)^{19}
\le (1-\bar q)^{608}.
\]

Under the null hypothesis \(\bar q\ge0.005\), this probability is at most

\[
0.995^{608}=0.0474715\ldots<0.05.
\]

Therefore **19 independent zero-loss games per rank (608 total) is a sufficient 5%-level one-sided test of the equal-weight field-average 99.5% target**, under the model above. The resulting zero-loss lower bound is approximately 99.5085%.

This is a sufficient zero-loss threshold, not a general sample-size formula for datasets containing losses. If any loss occurs, calculate an appropriate stratified exact/profile-likelihood interval or a pre-specified alternative; do not reuse the zero-loss shortcut.

## What this does not establish

- It does not show that any current candidate or policy reaches 99.5%; the repository currently has no competitively paper-qualified games.
- It does not show that each matchup individually reaches 99.5%. For a single rank, 598 zero-loss independent games are needed for a 95% one-sided 99.5% lower bound. A simultaneous familywise 95% claim across all 32 ranks using Bonferroni would require 1,290 zero-loss games per rank.
- Nineteen games per rank is only a sufficient aggregate-field test if all 32 ranks are sampled equally. Always publish all 32 matchup outcomes and uncertainty; a strong aggregate can conceal a weak rank.
- Games sharing a seed, paired replay, or mirrored seat assignment may be dependent. Do not count correlated paired games as independent Bernoulli observations without an appropriate clustered/paired analysis.
- The decklist, both policies, engine revision, rules hooks, and opponent field must remain frozen during a confirmatory cohort. Any material change starts a new cohort.
- The primary Aichi field is incomplete: ranks 23, 25 and 28 have no authenticated source list. A 29-rank experiment is a different estimand and cannot be described as the full Top 32. Do not use byes, substitutes, or normalized lists for missing ranks.

## Practical reporting

For every confirmatory cohort, record the exact 60-card candidate, all 32 opponent-list identities and hashes, candidate/opponent policy versions and hashes, Twinleaf pin, research revision, independent seed registry, physical-seat/first-player balance, per-rank wins/losses, aggregate weighting, confidence method, and every exclusion. Keep diagnostic/no-game acceptance runs separate from completed game outcomes.

**Conclusion:** a 99.5% claim needs substantial, balanced, independent field evidence. With zero losses, 608 games (19 per rank) is a mathematically sufficient aggregate threshold at one-sided 95% confidence only once the full 32-opponent field is available. It is not evidence that the target has been achieved.


## Practical seat/first-player balance

The mathematical minimum of 19 per rank does not divide evenly across four conditions (candidate in physical seat 0/1 × candidate first/non-first). For a simple balanced confirmatory cohort, use **20 independent games per rank**: five games in each of the four cells, 640 total. With zero losses, the corresponding one-sided lower bound is approximately 99.5330%, and the null probability bound is (0.995^{640}=0.0404363\ldots). This is an operationally balanced sufficient design, not a guarantee that five games per cell will characterize every policy failure mode. If first-player status is not directly controllable, stratify on the observed coin-flip outcome and continue sampling until the cells are balanced; do not alter physical randomness or leak it to policy workers.


## Extension to predeclared nonuniform field weights

If the owner later specifies weights (w_i\ge0\), \(\sum_i w_i=1\), define \(\bar q=\sum_i w_iq_i\). When the sampling allocation is exactly proportional to those weights, \(n_i=Nw_i\) (with integer counts), then

\[
P(0\text{ losses})=\prod_i(1-q_i)^{Nw_i}
=\exp\!\left(N\sum_iw_i\log(1-q_i)\right)
\le(1-\bar q)^N
\]

by weighted Jensen. Thus the same \(N=598\) zero-loss threshold applies to the predeclared weighted field average at one-sided 95% confidence. For equal 1/32 weights, integer balancing requires 19 per rank (608 total) to exceed that threshold; 20 per rank (640) is convenient for four-way seat/first-player balance. If integer allocations cannot be made proportional to the chosen weights, compute the bound for the actual allocation rather than assuming the 598 result.
