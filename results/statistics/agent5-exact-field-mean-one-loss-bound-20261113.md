# Exact one-nonwin design for the 128-stratum field mean

**Agent 5 · 13 November 2026 · prospective statistical design, not game evidence.**

## Result

For the equal-weight field-mean target \(\bar p_{\mathrm{field}}\ge0.995\) over all 32 opponents and four balanced contexts per opponent (128 cells), the existing all-win floor is five games per cell (640 total). If the fixed sample plan allows **at most one nonwin across the entire field**, an exact heterogeneous-stratum test requires only:

- **8 games per cell**;
- **1,024 total games**;
- exact worst-case null p-value **0.03625835228545431** at the 95% one-sided threshold \(\alpha=0.05\).

Seven games per cell (896 total) is insufficient: the exact worst-case p-value is **0.06166537699596426**. This is a single field-mean claim, so no Bonferroni correction across 32 opponents is applied. It is distinct from the stronger per-opponent one-/two-nonwin designs in the [companion result](agent5-exact-one-loss-balanced-matchup-bound-20261113.md).

## Estimand and assumptions

Let \(p_j\) be the win probability in each of the \(m=128\) equally weighted opponent × candidate-seat × first-player cells, and \(q_j=1-p_j\). Each cell receives \(n\) independent games. The target is

\[
\bar p_{\mathrm{field}}=\frac1{128}\sum_{j=1}^{128}p_j.
\]

The null is \(\bar p_{\mathrm{field}}\le0.995\), so \(\sum_j q_j\ge Q=128(0.005)=0.64\). **Within each cell, outcomes must be i.i.d. Bernoulli with fixed \(p_j\), and games must be mutually independent across all 128 cells.** Independence alone with varying per-game probabilities within a cell does not suffice. The sampling model must be preregistered and externally audited; do not use this exact tail with paired/common-deal clusters or a model selected after outcomes are observed. Every counted attempt must be paper-qualified; invalid, censored, native-only, or unqualified attempts remain excluded by the existing evidence rules.

## Exact heterogeneous one-nonwin tail

Let \(X\) be the total nonwins across all \(128n\) games. For the event \(X\le1\),

\[
G(q_1,\ldots,q_{128})
=
\Pr(X\le1)
=
\prod_{j=1}^{128}(1-q_j)^n
\left(1+n\sum_{j=1}^{128}\frac{q_j}{1-q_j}\right).
\]

This is a Poisson-binomial tail under heterogeneous cell probabilities; it is not assumed binomial. As \(G\) is coordinatewise nonincreasing, its maximum under \(\sum q_j\ge Q\) occurs on the boundary \(\sum q_j=Q\).

Define \(C=1+n\sum_j q_j/(1-q_j)\) and \(u_j=1/(1-q_j)\). The Hessian of \(\log G\) has the same form as in the four-cell one-nonwin derivation:

\[
v^\mathsf{T}\nabla^2\log G\,v
=
n\sum_j v_j^2\left(-u_j^2+\frac{2u_j^3}{C}\right)
-
\frac{n^2}{C^2}\left(\sum_j v_j u_j^2\right)^2.
\]

It is therefore negative semidefinite whenever \(C\ge2u_{\max}\), where \(u_{\max}=\max_j u_j\).

Let \(q_{\max}=\max_jq_j\). There are two exhaustive cases:

1. If \(q_{\max}\le1/(n-1)\), then \(u_{\max}\le(n-1)/(n-2)\), while \(C\ge1+nQ\). At \(n=8,Q=0.64\), \(C\ge6.12\), whereas \(2u_{\max}\le7/3\approx2.3333\).
2. If \(q_{\max}\ge1/(n-1)\), then \(C\ge1+nq_{\max}/(1-q_{\max})\). Multiplying by \(1-q_{\max}\), the inequality \(C\ge2u_{\max}\) reduces to \(1+(n-1)q_{\max}\ge2\), which holds in this case.

Thus \(\log G\) is concave on the 128-cell simplex at \(n=8\). Since it is symmetric, its maximum occurs at the equal point \(q_j=0.005\). The exact worst-case null probability is consequently

\[
\max_{\sum q_j\ge0.64}G(q)
=
\Pr\{\operatorname{Binomial}(128n,0.005)\le1\}.
\]

## Integer boundary

| Games per cell | Total games | Exact worst-case p-value | One-sided alpha | Decision |
| ---: | ---: | ---: | ---: | :---: |
| 5 (all wins only) | 640 | 0.0404363248892798 for \(X=0\) | 0.05 | Pass |
| 7 (one nonwin allowed) | 896 | 0.0616653769959643 | 0.05 | Fail |
| **8 (one nonwin allowed)** | **1,024** | **0.0362583522854543** | **0.05** | **Pass** |

At eight games per cell, observing no more than one nonwin rejects the null field mean at the 5% one-sided level. This is a single predeclared field-mean test, not a simultaneous guarantee for each opponent.

## Reproducibility

- scripts/agent5-exact-one-loss-balanced-matchup-bound.cjs exports balancedOneLossProbability(), fieldMeanOneLossDesign(), and minimumGamesPerCellForFieldMeanOneLoss().
- tests/agent5-exact-one-loss-balanced-matchup-bound.test.cjs covers the 7/8 boundary, exact p-values, concentrated and split 128-cell failure allocations, and the sufficient concavity condition.
- Agent48 independently generalized the Hessian argument to all 128 cells and reproduced the 7/8 boundary. Its simpler sufficient bound is also enough at n=8: C>=1+nQ=6.12 while 2uMax<=2/(1-0.64)=5.5556. The case split above gives an alternate sufficient proof.
- Local Node **v22.16.0**: node --check passed and **11/11 tests passed**.

## Scope limits

This is an exact fixed-sample design for at most one nonwin across the entire 128-cell field-mean sample. It does not support one nonwin per opponent, two nonwins, imbalanced cells, changed policies/engine/deck/adjudication, or unqualified outcomes. It does not authenticate the 32 opponent lists, paper legality, physical RNG independence, game adjudication, or opponent competence. No games have been run and no 99.5% performance is demonstrated.
