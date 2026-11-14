# Exact two-nonwin design for the 128-stratum field mean

**Agent 12 · 14 November 2026 · prospective statistical design only.** No games, deck strength, or 99.5% performance are established by this result.

## Result

For the single equal-weight field-mean target across all 32 Aichi opponents and the four candidate-seat × first-player contexts per opponent, a fixed balanced design of:

- **10 independent games in each of the 128 strata**;
- **1,280 total games**;
- **at most two nonwins across the entire field**

has an exact worst-case null p-value of **0.04595004378565184**, below the one-sided 5% threshold. The null is that the equal-weight field mean game win probability is at most 99.5%.

The adjacent smaller design, nine games per stratum (1,152 total), cannot pass this same at-most-two-nonwin rule: the equal-stratum null point alone has p-value **0.07308314434173511**. Thus ten per stratum is the minimum for this fixed-sample rule.

This extends [Agent5's exact one-nonwin field-mean design](agent5-exact-field-mean-one-loss-bound-20261113.md), which uses eight games per stratum (1,024 total) and allows at most one nonwin. Relative to the existing heterogeneous Chernoff-KL field-mean method's two-nonwin example (12 games per stratum, 1,536 total), this exact two-nonwin design saves **256 games (16.7%)**.

**This is an aggregate field-mean claim, not a guarantee that every opponent matchup individually exceeds 99.5%.** It uses one field-mean hypothesis, so there is no Bonferroni correction across 32 opponents. The 32 matchup-level results must still be reported separately, as required by the benchmark.

## Estimand and assumptions

Index the 128 equally weighted strata by opponent rank, candidate physical seat, and first-player seat. Let \(q_j\) be the fixed per-game nonwin probability in stratum \(j\). Each stratum contributes exactly \(n=10\) independent, identically distributed Bernoulli games, and all games are mutually independent across strata.

The field-mean null is

\[
H_0:\quad \frac{1}{128}\sum_{j=1}^{128}(1-q_j)\le 0.995,
\]

or equivalently

\[
\sum_{j=1}^{128}q_j\ge Q=128(0.005)=0.64.
\]

Let \(X\) be the total number of nonwins across all 1,280 games. The predeclared test rejects when \(X\le2\). Its p-value is the supremum of \(\Pr_q(X\le2)\) over the heterogeneous composite null above.

The result requires a frozen candidate 60 and policy, all 32 authenticated opponent lists and frozen opponent policies, fixed engine/hooks and adjudication, exactly equal cell quotas, and genuinely independent paper-qualified games. Within each stratum the win probability must be fixed over the sample. It does not apply to paired/common-deal clusters, changing policies or versions, post-hoc sample allocation, or per-game probabilities that vary within a stratum. Ties count as nonwins for a game-win-rate target. Censored, errored, native-only, or otherwise unqualified attempts remain governed by the existing evidence ledger and cannot be silently dropped or relabelled.

## Heterogeneous worst-case proof

First, \(\Pr_q(X\le2)\) is coordinatewise nonincreasing in every \(q_j\), so its supremum over \(\sum q_j\ge0.64\) occurs on the boundary \(\sum q_j=0.64\).

It remains to show that equal stratum failure rates maximize the lower tail on this simplex. Consider any pair of strata with probabilities \(q_i,q_j\), and hold their sum \(s=q_i+q_j\) fixed while increasing their product \(t=q_iq_j\) toward \(s^2/4\). This is pairwise equalization. Put

\[
A=1-s+t,\qquad r_k=\frac{q_k}{1-q_k}\quad(k\ne i,j),
\]

\[
h_0=\prod_{k\ne i,j}(1-q_k)^{10},\quad
R=10\sum_{k\ne i,j}r_k,
\]

\[
T=\frac{10^2}{2}\left(\sum_{k\ne i,j}r_k\right)^2
 -\frac{10}{2}\sum_{k\ne i,j}r_k^2.
\]

Expanding the zero-, one-, and two-nonwin terms of the two selected strata and the remaining 126 strata, then differentiating at fixed \(s\), gives

\[
\frac{\partial \Pr_q(X\le2)}{\partial t}
=\frac{10}{2}A^7h_0\left(P_0+RP_1+TP_2\right),
\]

where

\[
\begin{aligned}
P_0&=9\left(10(s-2t)^2-2s+6t-2t^2\right),\\
P_1&=2A\left(10(s-2t)+t-1\right),\\
P_2&=2A^2.
\end{aligned}
\]

The leading factor is positive. Write \(u=0.64-s\) and \(R_0=\sum_{k\ne i,j}r_k\). Convexity of \(x/(1-x)\), and its superadditivity for nonnegative arguments summing to less than one, give

\[
\frac{u}{1-u/126}\le R_0\le\frac{u}{1-u}.
\]

Also, \(T\ge45R_0^2\), \(P_0\ge-18s\), and \(P_2\ge2(1-s)^2\). The remaining bracket is nonnegative in three regions:

1. **\(0\le s\le2/19\).** The minimum of \(10(s-2t)+t-1\) over \(0\le t\le s^2/4\) is
   \[
   b_{\min}(s)=10(s-s^2/2)+s^2/4-1,
   \]
   which is nonpositive on this region. Thus \(P_1\ge2b_{\min}(s)\), and the derivative bracket is bounded below by
   \[
   F_1(s)=-18s+20\frac{u}{1-u}b_{\min}(s)
   +90(1-s)^2\left(\frac{u}{1-u/126}\right)^2.
   \]
   The exact-rational certificate in scripts/agent12-exact-two-loss-field-mean-proof.py proves \(F_1'(s)>0\) throughout \([0,2/19]\): after substituting \(s=2z/19\), all seven Bernstein coefficients of the degree-six derivative numerator are strictly positive, and its denominator is positive. Since
   \[
   F_1(0)=\frac{37255360}{22099401}>0,
   \]
   the bracket is positive throughout this region.

2. **\(2/19\le s\le11/50\).** Here \(P_1\ge0\). Using \(u\ge21/50\), \(1-s\ge39/50\), and the preceding lower bounds gives
   \[
   P_0+RP_1+TP_2\ge-\frac{99}{25}
   +90\left(\frac{39}{50}\right)^2\left(\frac{126}{299}\right)^2
   =\frac{381123}{66125}>0.
   \]

3. **\(11/50\le s\le16/25\).** Again \(P_1\ge0\). For \(h(s,t)=10(s-2t)^2-2s+6t-2t^2\),
   \[
   \frac{\partial h}{\partial t}=6-40s+76t
   \le6-40s+19s^2<0,
   \]
   so its minimum occurs at \(t=s^2/4\). The resulting function
   \[
   g(s)=10(s-s^2/2)^2-2s+3s^2/2-s^4/8
   \]
   is positive: \(g(11/50)=784179/50000000>0\), and
   \[
   g'(s)=\frac{(s-2)(19s^2-22s+2)}2>0
   \]
   on this interval because \(s-2<0\) and the convex quadratic is negative at both endpoints. Hence \(P_0\ge0\), and the full bracket is nonnegative.

Therefore pairwise equalization never decreases \(\Pr_q(X\le2)\). Repeated pairwise averaging shows that the global maximum on the 128-cell simplex occurs at \(q_j=0.005\) for every stratum. The exact worst-case null probability is consequently

\[
\max_{\sum q_j\ge0.64}\Pr_q(X\le2)
=\Pr\{\operatorname{Binomial}(1280,0.005)\le2\}
=0.04595004378565184.
\]

At nine games per cell, the equal null point is already a valid null configuration and has \(\Pr\{\operatorname{Binomial}(1152,0.005)\le2\}=0.07308314434173511>0.05\); therefore the same rule cannot pass at nine or fewer games per cell.

## Reproducibility

- Design calculator: scripts/agent12-exact-two-loss-field-mean-bound.cjs computes the exact binomial-tail expression stably and returns the fixed 10-per-cell design and adjacent 9-per-cell failure boundary.
- Node regressions: tests/2026-11/agent12-exact-two-loss-field-mean-bound.test.cjs; **7/7 passed** on Node v22.16.0.
- Exact-rational proof certificate: scripts/agent12-exact-two-loss-field-mean-proof.py; passed on Python 3.13.5. It checks the Bernstein coefficients, the three-region lower-bound certificates, and exact rational binomial-tail comparisons at 1,280 and 1,152 games.
- The existing manual-only Agent12 statistical workflow includes the Node regression and Python proof certificate. Manual run [43575950998](https://github.com/FlareZ123/experiment-01/actions/runs/43575950998) passed on head `f66f78bd31786d39825d0639f36825fd0f4a79d6`: the Node confidence-bound / field-validator suite, exact-rational Python proof certificate, and 32-rank opponent-policy bundle validator all succeeded. No new workflow or game simulation was added.

## Homogeneous operating characteristics (planning only)

The fixed rule rejects when the 1,280-game total contains at most two nonwins. Its operating characteristic under a **homogeneous** alternative (all 128 strata have the same fixed win probability) is:

| Common true win rate | Probability the rule passes |
|---:|---:|
| 99.95% | 97.2785791% |
| 99.90% | 86.1775285% |
| 99.80% | 52.8375061% |
| 99.70% | 26.2059101% |
| 99.50% (null boundary) | 4.5950044% |

This table is computed by the same binomial-tail helper and is useful for planning: at a homogeneous 99.9% win rate, the design has about 86.2% power. It is **not a uniform power guarantee over heterogeneous alternatives**. The pairwise-smoothing proof above establishes the least-favourable configuration for Type I error on the 99.5% null boundary; it does not establish the least-favourable configuration throughout the alternative space. The table must not be presented as a confidence bound or as expected deck performance.

## Executable ledger integration

The 10-per-stratum, at-most-two-nonwin field-mean test is now available through the existing shared ledger evaluator, `scripts/agent12-balanced-kl-field-bound.cjs`, via `assessBalancedFieldKl()`. It uses the same `validateFieldLedger()` gate as the heterogeneous field-mean KL method, so it requires all 32 source identities, all 128 balanced cells, a complete registered attempt ledger, fixed candidate/policy/engine/opponent/adjudication fingerprints, unique trial/deal/receipt IDs, and only paper-qualified wins/losses/ties.

The exact branch activates only when all of the following hold:

- `stratumSamplingModel: 'iid-bernoulli-v1'` is supplied;
- the target and confidence are exactly 0.995 and 0.95;
- every one of the 128 cells has exactly 10 games;
- there are at most two total nonwins (losses and ties).

It reports `boundMethod: 'exact-field-mean-two-nonwins-iid'`, the conservative rejection-region worst-case null p-value, and `conditionalStatisticalThresholdMet`. It intentionally returns `conditionalLowerBound: null`: this is a fixed-hypothesis test at the 99.5% boundary, not an inverted confidence-bound implementation. If the declaration is absent, the sample count differs, or there are more than two nonwins, the evaluator falls back to the heterogeneous independent-Bernoulli KL bound. Invalid ledgers never receive an exact result.

The sampling-model declaration remains a **caller assertion**, not a cryptographic field bound into the opaque registration digest. It must be included in the preregistration and independently audited; this branch must not be used for paired/common-deal clusters, post-hoc model selection, optional stopping, changing policies, or non-i.i.d. outcomes within a stratum.

Regression coverage was added to `tests/agent12-balanced-kl-field-bound.test.cjs` for the exact 1,280-game acceptance boundary, missing declaration, three nonwins, nine games per cell, and invalid-ledger fail-closed behavior. Existing manual workflow [43576181297](https://github.com/FlareZ123/experiment-01/actions/runs/43576181297) passed on head `f896ea701e6fa4a0dec444eaa77769fa0786a5ca`: the field-mean and simultaneous-matchup test suites, exact-rational proof certificate, and 32-rank policy-bundle validator all succeeded. This is statistical software validation only; no Twinleaf game or competitive evidence was produced.

## Scope limits and status

This is a fixed-sample prospective method, not an anytime-valid or optional-stopping procedure. Do not inspect interim results and then choose among the 5-, 8-, or 10-games-per-cell designs without a separately preregistered alpha-spending or anytime-valid procedure. It is an aggregate field-mean test only; it does not guarantee that each of the 32 opponent matchups exceeds 99.5%. Use the separate simultaneous per-opponent methodology if that stronger claim is required.

The repository still has missing original opponent lists, unresolved paper admission, no selected final 60, and zero competitively qualified games. This method does not authenticate the source field, physical deals, RNG independence, policy competence, game adjudication, or paper qualification. It changes no deck or policy and establishes no 99.5% result.
