# Exact one-nonwin extension: opt-in iid four-stratum confidence bound

**Agent 12 · 13 November 2026 · statistical-method integration.** This is a prospective confidence method, not game evidence, a deck recommendation, or a 99.5% performance claim.

## Decision

Agent5's exact one-nonwin mathematics is correct for four equally sampled strata when games are independent and identically distributed **within each stratum**. The exact method is now an opt-in branch in `scripts/agent12-simultaneous-matchup-kl-bound.cjs`:

- `stratumSamplingModel: 'iid-bernoulli-v1'` enables the exact one-nonwin branch.
- A rank with exactly one nonwin uses the exact bound only when the concavity proof and numerical inversion bracket apply.
- Zero-nonwin ranks retain the exact all-win AM-GM bound.
- Two or more nonwins, an absent/unknown sampling-model declaration, or an inapplicable proof retain the heterogeneous Bernoulli Chernoff-KL bound.
- The structural `validateFieldLedger()` remains unchanged. It continues to own source/attempt/128-cell admission, not statistical-method selection.

The i.i.d. declaration must be frozen in the preregistration and independently audited. The evaluator receives a caller assertion; it does not authenticate the physical randomization protocol. If within-stratum game probabilities may differ, do not set this declaration: use the heterogeneous KL path.

## Mathematical result

For one opponent, let (q_j=1-p_j) be the nonwin probability in each of the four equally weighted candidate-seat × first-player-seat strata, with (n) independent i.i.d. games in each. For (X), the total nonwins,

[
G(q_1,ldots,q_4)=Pr(Xle1)
=prod_{j=1}^{4}(1-q_j)^n
left(1+nsum_{j=1}^{4}rac{q_j}{1-q_j}ight).
]

Under the null opponent mean (ar ple0.995), (sum_j q_jge Q=0.02). Monotonicity puts the maximum on (sum q_j=Q). Define (C=1+nsum_j q_j/(1-q_j)) and (u_j=(1-q_j)^{-1}). The Hessian of (log G) has quadratic form

[
nsum_j v_j^2left(-u_j^2+rac{2u_j^3}{C}ight)
-rac{n^2}{C^2}left(sum_jv_ju_j^2ight)^2.
]

Since (Cge1+nQ) and (u_jle(1-Q)^{-1}), the sufficient condition (1+nQge2/(1-Q)) makes the Hessian negative semidefinite. At (Q=0.02), this holds for (nge53). Symmetric concavity therefore makes (q_j=0.005) the least-favourable point. The exact worst-case one-nonwin p-value is then (Pr{mathrm{Binomial}(4n,0.005)le1}).

Bonferroni uses (alpha/32=0.0015625) for 95% familywise confidence across 32 opponent claims.

| Games per stratum | Games per opponent | Total for 32 | Exact worst-case p-value at 99.5% | Exact lower bound with one nonwin | Decision |
|---:|---:|---:|---:|---:|:---:|
| 435 | 1,740 | 55,680 | 0.0015881270033271668 | 0.9949896284466906 | Fail |
| **436** | **1,744** | **55,808** | **0.0015598130329003142** | **0.9950010946446439** | **Pass** |

The exact branch saves 6,400 games versus the generic heterogeneous-KL one-nonwin design at 486 per stratum. The generic 486-per-stratum result remains valid and necessary when within-stratum outcomes are independent but not identically distributed. The 602-per-stratum two-nonwin KL result is unchanged. The 323-per-stratum all-win floor is unchanged.

## Implementation and checks

- Evaluator: `scripts/agent12-simultaneous-matchup-kl-bound.cjs`; reports per-rank `boundMethod` as `exact-one-loss-iid`, `all-win-exact`, or `heterogeneous-kl`.
- Regression suite: `tests/agent12-simultaneous-matchup-kl-bound.test.cjs`; covers 435/436, explicit-i.i.d. opt-in, generic-KL fallback without the declaration, and KL fallback for two nonwins.
- Agent5's independent design artifact remains available: `scripts/agent5-exact-one-loss-balanced-matchup-bound.cjs`, `tests/agent5-exact-one-loss-balanced-matchup-bound.test.cjs`, and `results/statistics/agent5-exact-one-loss-balanced-matchup-bound-20261113.md`.
- An independent Node 22.16.0 arithmetic check reproduced the exact 435/436 p-values and inverted lower bounds. The repository's manual statistical workflow has **not** been dispatched for this integration; no CI pass is claimed.

## Limits and live benchmark

This special case is invalid if the per-game win probabilities vary within a stratum, the sampling model was selected after observing outcomes, the four strata are not equally sampled, the games are dependent, or any counted game is not independently paper-qualified. The existing ledger still requires all 32 original opponent identities, all 128 balanced strata, frozen deck/policy/engine/adjudication identities, unique deal and receipt IDs, and no unqualified/censored outcomes. External audit of paper legality, game adjudication, and the sampling model remains mandatory.

The current Aichi benchmark still has 29/32 authenticated original lists, five unchanged Japanese-Extra-incompatible lists, three unavailable lists, zero original physical-source paper-admitted opponents, no selected final 60, zero competitively qualified games, and no demonstrated 99.5% result. This report changes only the conditional statistical evaluator; it does not qualify any game or matchup.
