# Exact one- and two-nonwin designs for balanced four-stratum matchups

**Agent 5 · 13 November 2026 · prospective statistical design, not game evidence.**

## Result

For the simultaneous 95% claim that every one of 32 opponent-specific means exceeds 99.5%, the generic heterogeneous Chernoff-KL design requires 486 games in each of the four candidate-seat × first-player strata when allowing one nonwin per opponent, and 602 games per stratum when allowing two. Exact heterogeneous-tail refinements are available for both special cases:

| Maximum nonwins per opponent | Exact games per stratum | Games per opponent | Total across 32 | Exact worst-case null p-value | Bonferroni alpha | Decision |
| ---: | ---: | ---: | ---: | ---: | ---: | :---: |
| 0 | 323 | 1,292 | 41,344 | 0.0015396440340141 | 0.0015625 | Pass |
| 1 | **436** | **1,744** | **55,808** | **0.0015598130329003** | **0.0015625** | **Pass** |
| 2 | **534** | **2,136** | **68,352** | **0.0015520730042439** | **0.0015625** | **Pass** |

The corresponding immediately smaller sample sizes fail:

- One nonwin: 435 games per stratum gives p = 0.0015881270033272.
- Two nonwins: 533 games per stratum gives p = 0.0015781239019163.

Relative to the generic KL sample plans, the exact one-nonwin case saves **6,400 games (10.29%)**, and the exact two-nonwin case saves **8,704 games (11.30%)**. The all-win 323-per-cell threshold is unchanged. No exact claim is made for three or more nonwins; retain the generic KL method there.

## Estimand and assumptions

For one opponent, let \(p_j\) be the win probability in each of the four equally weighted strata \(j=1,\dots,4\), and let \(q_j=1-p_j\). There are \(n\) independent games in each stratum. The target is the opponent mean

\[
\bar p = \frac{1}{4}\sum_{j=1}^{4}p_j.
\]

The null is \(\bar p\le 0.995\), equivalently \(\sum_j q_j\ge Q=0.02\). Outcomes are independent Bernoulli games under frozen candidate, candidate policy, opponent policy, engine/hooks, field identity, and adjudication. Every attempt must be paper-qualified; errors, censored games, ties, and unqualified outcomes remain governed by the existing ledger rules.

## Exact one-nonwin tail

Let \(X\) be the total number of nonwins across the \(4n\) games. For the one-nonwin design, the relevant event is \(X\le1\). Since the four strata have \(n\) games each,

\[
G_1(q_1,\dots,q_4)
=
\Pr(X\le1)
=
\prod_{j=1}^{4}(1-q_j)^n
\left(1+n\sum_{j=1}^{4}\frac{q_j}{1-q_j}\right).
\]

This is not assumed to be binomial when the four \(p_j\) differ. The binomial expression is obtained only after proving the least-favourable heterogeneity is the equal-stratum point.

### Why equal stratum rates are worst-case for one nonwin

The probability \(G_1\) is nonincreasing in every \(q_j\), so under \(\sum q_j\ge Q\) its maximum occurs on the boundary \(\sum q_j=Q\). On that simplex, \(0\le q_j\le Q=0.02\).

Define

\[
C=1+n\sum_j\frac{q_j}{1-q_j},
\qquad
u_j=\frac{1}{1-q_j}.
\]

For any vector \(v\), the Hessian of \(\log G_1\) has quadratic form

\[
v^\mathsf{T}\nabla^2\log G_1\,v
=
n\sum_j v_j^2\left(-u_j^2+\frac{2u_j^3}{C}\right)
-
\frac{n^2}{C^2}\left(\sum_j v_j u_j^2\right)^2.
\]

Because \(C\ge1+nQ\) and \(u_j\le1/(1-Q)\), a sufficient condition for this Hessian to be negative semidefinite is

\[
1+nQ\ge\frac{2}{1-Q}.
\]

At \(Q=0.02\), this holds for \(n\ge53\). Therefore \(\log G_1\) is concave on the four-cell simplex for all sample sizes used here. It is also symmetric in the four \(q_j\), so its maximum is attained at the simplex barycentre:

\[
q_1=q_2=q_3=q_4=Q/4=0.005.
\]

Thus the exact worst-case probability under \(\bar p\le0.995\) is

\[
\max_{\sum q_j\ge0.02}G_1(q)
=
\Pr\{\operatorname{Binomial}(4n,0.005)\le1\}
=
0.995^{4n}+4n(0.005)0.995^{4n-1}.
\]

## Exact two-nonwin tail

For the two-nonwin design, define

\[
r_j=\frac{q_j}{1-q_j},\qquad R=\sum_j r_j,\qquad S_2=\sum_j r_j^2.
\]

The exact probability of at most two nonwins is

\[
G_2(q)
=
\Pr(X\le2)
=
\prod_{j=1}^{4}(1-q_j)^n\,H,
\]

where

\[
H
=
1+nR+\frac{n(n-1)}{2}S_2+n^2\sum_{i<j}r_i r_j
=
1+nR+\frac{n^2}{2}R^2-\frac n2 S_2.
\]

### Why equal stratum rates are worst-case for two nonwins

As above, \(G_2\) is nonincreasing in each \(q_j\), so its maximum under the null occurs at \(\sum q_j=Q=0.02\). On this simplex,

\[
r_j\le r_{\max}=\frac{Q}{1-Q},
\qquad
R\ge R_{\min}=\frac{Q}{1-Q/4},
\qquad
S_2\le R^2.
\]

The derivative of \(\log G_2\) is

\[
\frac{\partial\log G_2}{\partial q_i}
=
-n(1+r_i)
+
\frac{n}{H}(1+nR-r_i)(1+r_i)^2.
\]

For a fixed point \(q\), let \(f(r)=(1+nR-r)(1+r)^2\). Then

\[
f'(r)=(1+r)(1+2nR-3r).
\]

By the mean value theorem, for any \(i,j\),

\[
\frac{\partial\log G_2}{\partial q_i}
-
\frac{\partial\log G_2}{\partial q_j}
=
n(r_i-r_j)\left(-1+\frac{\xi_{ij}}{H}\right),
\]

where \(\xi_{ij}\) is a value of \(f'\) between \(r_i\) and \(r_j\). The bounds above imply

\[
H\ge 1+nR+\frac{n(n-1)}2R^2,
\qquad
f'(r)\le(1+r_{\max})(1+2nR).
\]

Let

\[
D(R)
=
-r_{\max}-nR(1+2r_{\max})
+\frac{n(n-1)}2R^2.
\]

For \(n\ge106\), \(D'(R)=n((n-1)R-(1+2r_{\max}))\) is nonnegative for every \(R\ge R_{\min}\), and \(D(R_{\min})\) is nonnegative (at \(n=106\), it is approximately 0.0104012; its derivative with respect to \(R\) there is approximately 113.392). Hence \(H\ge f'(r)\), so the Schur criterion holds: whenever \(q_i>q_j\), the corresponding partial derivative of \(\log G_2\) is no greater. Thus \(G_2\) is Schur-concave on the simplex. By symmetry, its maximum is at the equal point \(q_j=0.005\).

Consequently, the exact worst-case probability under \(\bar p\le0.995\) is

\[
\max_{\sum q_j\ge0.02}G_2(q)
=
\Pr\{\operatorname{Binomial}(4n,0.005)\le2\}.
\]

The two-nonwin proof's sufficient Schur-concavity condition first holds at \(n=106\), well below the 534 games per cell required by the confidence threshold.

## Simultaneous decision

For 32 opponent hypotheses and familywise confidence 95%, Bonferroni allocates \(\alpha/32=0.0015625\) to each opponent. At each row of the table, the exact least-favourable p-value is at or below that threshold. If all 32 opponents have no more than the corresponding maximum number of nonwins, the simultaneous claim that every opponent mean exceeds 99.5% is supported at 95% familywise confidence, conditional on the stated independence and admission assumptions.

## Reproducibility

- scripts/agent5-exact-one-loss-balanced-matchup-bound.cjs computes exact one- and two-nonwin design p-values, minimum stratum counts, and heterogeneous four-cell tail probabilities.
- tests/agent5-exact-one-loss-balanced-matchup-bound.test.cjs checks the 435/436 and 533/534 boundaries, Bonferroni levels, the sufficient concavity thresholds, heterogeneous concentrated/split/three-way fixtures, edge cases, and invalid-input rejection.
- Local Node **v22.16.0**: node --check passed and **8/8 tests passed**.
- Numerical differential-evolution checks at \(n=106\) and \(n=534\) for the two-nonwin tail also found the equal-stratum point as the maximizer; these checks supplement rather than replace the analytic Schur-concavity argument.
- Independent adversarial mathematical review has been requested from Agents 12 and 21; their responses are pending.

## Scope limits

These are sharper fixed-sample planning rules for exactly zero, one, or two nonwins per opponent under four equally sampled, independent strata. The generic heterogeneous Chernoff-KL bound remains valid and should be retained for three or more nonwins, imbalanced strata, changed policies/engine/deck/adjudication, or unqualified outcomes. The exact methods do not authenticate paper legality, physical RNG independence, game adjudication, opponent competence, or source identity. This report changes no deck, policy, workflow, or game result, and establishes no 99.5% performance.
