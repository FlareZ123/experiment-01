# Evidence threshold for a 99.5% per-opponent win-rate claim

**Agent27 | 12 November 2026 | exact binomial derivation**

## Question

What evidence would support the conservative interpretation of the objective: a fixed deck and fixed decision policy win at least **99.5% of games against each of the 32 authenticated Aichi Top 32 opponents**, rather than merely achieving a 99.5% aggregate over a favorable mixture?

## Exact one-sided bound

For one fixed matchup, model independent game outcomes as Bernoulli trials with unknown win probability (p). With (n) wins and zero losses, the one-sided exact Clopper–Pearson lower confidence bound at significance (alpha) is:

[
L = alpha^{1/n}.
]

Requiring (L ge 0.995) gives:

[
n ge rac{log(alpha)}{log(0.995)}.
]

- **One matchup, 95% one-sided confidence:** (alpha=0.05), so **598 consecutive wins** are required.
- **All 32 matchups simultaneously, 95% family-wise confidence:** a simple Bonferroni allocation uses (alpha=0.05/32=0.0015625) per matchup, so **1,290 consecutive wins per opponent** are required, or **41,280 total games** across 32 matchups.

The corresponding lower bounds are approximately 99.5003% for one matchup at (n=598), and 99.5004% per matchup at (n=1,290) under the Bonferroni allocation.

For comparison, zero losses in 100 games yields only a 97.05% one-sided 95% lower bound; zero losses in 200 yields 98.51%; zero losses in 500 yields 99.40%. A small perfect sample is not evidence for a 99.5% true win rate.

## Interpretation and experimental requirements

1. Treat **each exact opposing 60-card list** as its own stratum. Do not pool the 11 Regidrago opponents or any other archetype into one proxy matchup.
2. Keep the contender 60, opponent 60, rules, simulator revision, decision policy, and policy configuration fixed throughout a confirmatory sample. A deck or policy tuned on these games needs a separate held-out confirmatory sample.
3. Use independent, preregistered shuffle/game seeds. Replaying the same deal under different policies is a paired causal experiment, not an independent win-rate sample.
4. Report wins, losses, ties, nonterminals, engine errors, and excluded games per opponent. Do not count caps, aborts, unqualified native terminals, or paper-invalid outcomes as wins.
5. Use the exact binomial lower bound when losses occur; do not use a normal approximation at a 0.5% failure rate.
6. This is a statistical threshold **after** the game-evidence gates are met. It does not make native simulation equivalent to paper play, certify Japanese print legality, or replace independent paper/policy review.

## Scope caveat

This calculation addresses the conservative **per-opponent** reading of “against the entire field.” If the intended target is instead a field-weighted average, the weights and estimand must be frozen before testing, and all 32 matchup rows must still be reported. An aggregate estimate must not hide a weak matchup.

## Current repository implication

The 4410 pipeline capture is not an admitted game outcome and contributes **zero** observations to this statistical target. Even a future single independently reviewed game per opponent would establish coverage, not a 99.5% rate. The calculation is intended to prevent overclaiming and to make clear that the 99.5% target requires an unusually large, carefully controlled confirmatory study.

