# Exact one-nonwin design for a balanced four-stratum matchup

**Agent 5 · 13 November 2026 · prospective statistical design, not game evidence.**

## Result

For the simultaneous 95% claim that every one of 32 opponent-specific means exceeds 99.5%, the existing heterogeneous Chernoff-KL design uses 486 games in each of the four candidate-seat × first-player strata when allowing one nonwin per opponent. A sharper exact special case is available:

- **436 games per stratum** (1,744 per opponent; **55,808 total** across 32 opponents) is sufficient when each opponent has at most one nonwin among its 1,744 games.
- **435 games per stratum** is insufficient.
- The one-sided per-opponent error is \`alpha/32 = 0.0015625\`. At 436 per stratum, the exact worst-case null p-value is **0.0015598130329003142**; at 435 it is **0.0015881270033271668**.
- This saves **6,400 games (10.29%)** relative to the generic 486-per-cell KL bound for the one-nonwin design.

The 323-per-cell all-win floor is unchanged. The existing 602-per-cell two-nonwin KL design is also unchanged; this result does not generalize to two or more nonwins.

## Estimand and assumptions

For one opponent, let \(p_j\) be the win probability in each of the four equally weighted strata \(j=1,\dots,4\), and let \(q_j=1-p_j\). There are \(n\) independent games in each stratum. The target is the opponent mean

\[
\bar p = \frac{1}{4}\sum_{j=1}^{4}p_j.
\]

The null is \(\bar p\le 0.995\), equivalently \(\sum_j q_j\ge Q=0.02\). Outcomes are independent Bernoulli games under frozen candidate, candidate policy, opponent policy, engine/hooks, field identity, and adjudication. Every attempt must be paper-qualified; errors, censored games, ties, and unqualified outcomes remain governed by the existing ledger rules.

## Exact heterogeneous tail

Let \(X\) be the total number of nonwins across the \(4n\) games. For the one-nonwin design, the relevant event is \(X\le1\). Since the four strata have \(n\) games each,

\[
G(q_1,\dots,q_4)
=
\Pr(X\le1)
=
\prod_{j=1}^{4}(1-q_j)^n
\left(1+n\sum_{j=1}^{4}\frac{q_j}{1-q_j}\right).
\]

This is not assumed to be binomial when the four \(p_j\) differ. The binomial expression is obtained only after proving the least-favourable heterogeneity is the equal-stratum point.

### Why equal stratum rates are worst-case here

The probability \(G\) is nonincreasing in every \(q_j\), so under \(\sum q_j\ge Q\) its maximum occurs on the boundary \(\sum q_j=Q\). On that simplex, \(0\le q_j\le Q=0.02\).

Define

\[
C=1+n\sum_j\frac{q_j}{1-q_j},
\qquad
u_j=\frac{1}{1-q_j}.
\]

For any vector \(v\), the Hessian of \(\log G\) has quadratic form

\[
v^\mathsf{T}\nabla^2\log G\,v
=
n\sum_j v_j^2\left(-u_j^2+\frac{2u_j^3}{C}\right)
-
\frac{n^2}{C^2}\left(\sum_j v_j u_j^2\right)^2.
\]

Because \(C\ge1+nQ\) and \(u_j\le1/(1-Q)\), a sufficient condition for this Hessian to be negative semidefinite is

\[
1+nQ\ge\frac{2}{1-Q}.
\]

At \(Q=0.02\), this holds for \(n\ge53\). Therefore \(\log G\) is concave on the four-cell simplex for all sample sizes used here. It is also symmetric in the four \(q_j\), so its maximum is attained at the simplex barycentre:

\[
q_1=q_2=q_3=q_4=Q/4=0.005.
\]

Thus the exact worst-case probability under \(\bar p\le0.995\) is

\[
\max_{\sum q_j\ge0.02}G(q)
=
\Pr\{\operatorname{Binomial}(4n,0.005)\le1\}
=
0.995^{4n}+4n(0.005)0.995^{4n-1}.
\]

This establishes a valid exact one-sided test for the opponent mean despite heterogeneous seat/first-player win probabilities.

## Integer boundary

| Games per stratum | Games per opponent | Worst-case p-value | Bonferroni alpha | Decision |
| ---: | ---: | ---: | ---: | :---: |
| 435 | 1,740 | 0.0015881270033271668 | 0.0015625 | Fail |
| **436** | **1,744** | **0.0015598130329003142** | **0.0015625** | **Pass** |
| 486 (existing KL design) | 1,944 | 0.0006313033069914445 | 0.0015625 | Pass, conservative |

Bonferroni over the 32 opponent hypotheses gives familywise error at most 0.05. If all 32 opponents have at most one nonwin under the balanced 436-per-cell design, the simultaneous claim that every opponent mean exceeds 99.5% is supported at 95% familywise confidence, conditional on the stated independence and admission assumptions.

## Reproducibility

- \`scripts/agent5-exact-one-loss-balanced-matchup-bound.cjs\` computes the exact design p-value and minimum stratum size, and exposes a four-cell exact tail function for adversarial checks.
- \`tests/agent5-exact-one-loss-balanced-matchup-bound.test.cjs\` checks the 435/436 boundary, the 32-opponent Bonferroni level, the concavity condition, heterogeneous concentrated/split/three-way fixtures, edge cases, and invalid-input rejection.
- Local Node **v22.16.0**: \`node --check\` passed and **5/5 tests passed**.

## Scope limits

This is a sharper fixed-sample planning rule for exactly zero or one nonwin per opponent under four equally sampled, independent strata. It does not replace the existing KL bound for two or more nonwins, imbalanced strata, changed policies/engine/deck/adjudication, or unqualified outcomes. The existing 486-per-cell KL result remains valid and conservative; it is not an error. This report changes no deck, policy, workflow, or game result, and establishes no 99.5% performance.
