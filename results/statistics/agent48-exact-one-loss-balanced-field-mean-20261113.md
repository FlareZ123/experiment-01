# Exact one-nonwin design for the 128-stratum Aichi field mean

**Agent 48 · 13 November 2026 · prospective statistical design, not game evidence.**

## Result

For the primary **equal-weight field mean** estimand, a sharper exact special case is available when at most one nonwin is observed across the entire field:

- **8 games in each of the 128 cells** (32 opponents × 2 candidate seats × 2 first-player assignments).
- **32 games per opponent; 1,024 games total.**
- A one-sided exact null p-value of **0.03625835228545431**, below alpha = 0.05.
- **7 games per cell is insufficient**: its equal-stratum null p-value is **0.06166537699596426**.
- The acceptance rule permits at most **one nonwin in all 1,024 games**, not one nonwin per opponent.

This is an aggregate field-mean guarantee. It does **not** establish that every individual matchup exceeds 99.5%; all 32 rank-level outcomes and the worst-matchup diagnostic must still be reported.

## Estimand and assumptions

For opponent rank \(r=1,\dots,32\), candidate seat \(s\in\{0,1\}\), and first-player assignment \(f\in\{0,1\}\), let \(p_{rsf}\) be the win probability in that cell. The target is the equal-weight field mean

\[
\bar p_{\mathrm{field}}=\frac{1}{128}\sum_{r=1}^{32}\sum_{s=0}^{1}\sum_{f=0}^{1}p_{rsf}.
\]

Every cell receives the same fixed number \(n\) of independent, paper-qualified games under frozen candidate 60, candidate policy, opponent-policy bundle, engine/hooks, field identities and adjudication. Thus the pooled game mean equals the equal-weight cell mean, and because each opponent contributes four cells, also equals the equal-weight mean of the 32 opponent means.

The null is

\[
H_0:\bar p_{\mathrm{field}}\le0.995.
\]

Let \(q_j=1-p_j\) be the failure probability in cell \(j\). On the least-favourable boundary,

\[
\sum_{j=1}^{128}q_j=Q=128(1-0.995)=0.64.
\]

Outcomes must be independent Bernoulli games across cells and within cells. Do not reuse common-deal/paired seeds across confirmatory cells and then treat the resulting correlated outcomes as independent. Censored, erroneous, tied, fixture-only, or otherwise unqualified attempts do not become wins; the existing ledger admission rules govern whether an attempt can enter the denominator.

## Exact heterogeneous tail

Let \(X\) be the total number of nonwins across all \(128n\) games. For independent cells with \(n\) games each,

\[
G(q_1,\dots,q_{128})
=\Pr(X\le1)
=\prod_{j=1}^{128}(1-q_j)^n
\left(1+n\sum_{j=1}^{128}\frac{q_j}{1-q_j}\right).
\]

The probability is nonincreasing in every \(q_j\), so its maximum under the null occurs at the boundary \(\sum q_j=Q\). On this simplex, \(0\le q_j\le Q\).

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
n\sum_jv_j^2\left(-u_j^2+\frac{2u_j^3}{C}\right)
-\frac{n^2}{C^2}\left(\sum_jv_ju_j^2\right)^2.
\]

Because \(C\ge1+nQ\) and \(u_j\le1/(1-Q)\), a sufficient condition for this Hessian to be negative semidefinite is

\[
1+nQ\ge\frac{2}{1-Q}.
\]

For \(Q=0.64\), this condition first holds at

\[
n\ge
\left\lceil\frac{2/(1-0.64)-1}{0.64}\right\rceil
=8.
\]

Therefore, for every sample size used by the passing design, \(\log G\) is concave on the 128-cell simplex. It is symmetric, so Jensen's inequality places its maximum at the barycentre:

\[
q_1=\cdots=q_{128}=Q/128=0.005.
\]

The exact worst-case null probability is consequently

\[
\max_{\sum q_j\ge0.64}G(q)
=
\Pr\{\operatorname{Binomial}(128n,0.005)\le1\}
=
0.995^{128n}
+128n(0.005)0.995^{128n-1}.
\]

## Integer boundary

| Games per cell | Games per opponent | Total games | Worst-case p-value | Alpha | Decision |
|---:|---:|---:|---:|---:|:---:|
| 7 | 28 | 896 | 0.06166537699596426 | 0.05 | Fail |
| **8** | **32** | **1,024** | **0.03625835228545431** | **0.05** | **Pass** |

Seven cells per opponent is not sufficient even at the equal-rate null point; smaller sample sizes have a still larger \(\Pr(X\le1)\). Eight is therefore the minimum equal-cell sample size for this one-nonwin acceptance rule and the stated concavity proof.

## Relationship to the other confidence designs

Keep the estimands separate:

| Claim | Acceptance pattern / design | Total games |
|---|---|---:|
| Field mean >99.5%, 95% one-sided | 5 games/cell, **zero** nonwins | 640 |
| Field mean >99.5%, 95% one-sided | 8 games/cell, **at most one total** nonwin | **1,024** |
| Every opponent mean >99.5%, simultaneous 95% | 436 games/cell, at most one nonwin **per opponent** | 55,808 |
| Every opponent mean >99.5%, simultaneous 95% | 323 games/cell, zero nonwins | 41,344 |

The aggregate one-nonwin rule is much cheaper because it tests one equal-weight field-mean hypothesis rather than 32 simultaneous opponent hypotheses. It can still permit one weaker matchup to be offset by stronger matchups. The [fixed-deck objective contract](../methodology/2026-11/agent5-fixed-deck-objective-contract-20261113.md) requires every rank-level result and worst-matchup diagnostics to remain visible. The stronger [exact one-nonwin per-opponent design](agent5-exact-one-loss-balanced-matchup-bound-20261113.md) remains the relevant result when every opponent must individually exceed 99.5%.

## Reproducibility

- scripts/agent48-exact-one-loss-field-mean-bound.cjs computes the exact binomial tail, the 128-cell heterogeneous tail, the concavity threshold and the minimum passing equal-cell design.
- tests/agent48-exact-one-loss-field-mean-bound.test.cjs checks the 7/8 boundary, 1,024-game plan, heterogeneous concentrated/split/three-way fixtures, forced nonwin edge cases and invalid-input rejection.
- Local Node **v22.16.0**: syntax check passed and **5/5 tests passed**.
- The existing manual-only agent12-statistical-field-confidence.yml now includes the new regression; no new workflow or automatic trigger was created.

## Scope limits

This is a prospective fixed-sample design, not a performance result. It requires all 32 field entries and all 128 balanced cells, independent games, frozen experiment fingerprints and paper-qualified outcomes. It does not apply to an incomplete 24-rank diagnostic panel, correlated paired outcomes, imbalanced cell sizes, two or more nonwins, optional stopping, changed policies/engine/deck/adjudication, or fixture-only/native-only attempts. The 99.5% field mean target remains unproven, no deck is selected, and no competitive games are currently qualified.
