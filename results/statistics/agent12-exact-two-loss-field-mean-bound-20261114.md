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
- `fieldSamplingRegistration` is supplied with schema `aichi-field-sampling-registration-v1`;
- `registrationSha` equals the SHA-256 of the canonical JSON serialization of that manifest;
- the manifest binds the target/confidence (0.995 / 0.95), registration timestamp, per-stratum quota, randomization-protocol description, all 32 source-rank/source-60 fingerprints, the fixed candidate/policy/engine/opponent/adjudication fingerprints, and the exact planned attempt roster;
- each actual attempt matches one preregistered row by `trialId`, rank, candidate seat, first-player seat, and unique `physicalDealId`;
- every one of the 128 cells has exactly 10 games, and there are at most two total nonwins (losses and ties).

The shared `validateFieldLedger()` gate enforces the same manifest contract for both `assessBalancedFieldKl()` and `assessSimultaneousMatchups()`, so the exact per-opponent one- and two-nonwin iid bounds cannot bypass the registration binding either. The field manifest commits to the complete planned sample rather than only a model label. An unbound caller assertion or a changed manifest/attempt roster is rejected; it cannot select the exact branch. With no iid declaration/manifest, the heterogeneous independent-Bernoulli KL bound remains the default. A valid digest-bound iid registration with a different quota, target, confidence, or more than two nonwins also uses the heterogeneous KL method.

The exact branch reports `boundMethod: 'exact-field-mean-two-nonwins-iid'`, the conservative rejection-region worst-case null p-value, and `conditionalStatisticalThresholdMet`. It intentionally returns `conditionalLowerBound: null`: this is a fixed-hypothesis test at the 99.5% boundary, not an inverted confidence-bound implementation. Digest consistency is not proof that a registration was genuinely created before play, that its randomization description was followed, or that physical games were independent. An independent auditor must still authenticate the timestamp, physical shuffles, no-common-deal condition, policy/version freeze, and paper qualification. Do not use this branch for paired/common-deal clusters, post-hoc model selection, optional stopping, changing policies, or non-i.i.d. outcomes within a stratum.

Regression coverage in `tests/agent12-balanced-kl-field-bound.test.cjs` now covers the bound 1,280-game roster, an unbound caller assertion, manifest-digest tampering, trial-roster tampering, three nonwins, nine games per cell, and invalid-ledger fail-closed behavior. The prior manual workflow [43576181297](https://github.com/FlareZ123/experiment-01/actions/runs/43576181297) passed the pre-change implementation; a fresh run is required for this digest-binding change. No Twinleaf game or competitive evidence was produced.

## Scope limits and status

This is a fixed-sample prospective method, not an anytime-valid or optional-stopping procedure. Do not inspect interim results and then choose among the 5-, 8-, or 10-games-per-cell designs without a separately preregistered alpha-spending or anytime-valid procedure. It is an aggregate field-mean test only; it does not guarantee that each of the 32 opponent matchups exceeds 99.5%. Use the separate simultaneous per-opponent methodology if that stronger claim is required.

The repository still has missing original opponent lists, unresolved paper admission, no selected final 60, and zero competitively qualified games. This method does not authenticate the source field, physical deals, RNG independence, policy competence, game adjudication, or paper qualification. It changes no deck or policy and establishes no 99.5% result.


---

## 2026-11-20 extension: predeclared two-look rule using the exact two-nonwin bound

The exact heterogeneous two-nonwin result above applies at **10 games per stratum** (128 strata, 1,280 games). It can be combined with a predeclared early all-win look without extending the heterogeneous proof to any larger per-stratum sample.

### Rule

- **Look 1:** after 9 complete rounds (1,152 games), pass early only if all 1,152 games are wins.
- **Look 2:** otherwise continue to 10 complete rounds (1,280 games); pass if there are at most two nonwins in total.
- **Futility:** stop as soon as a third nonwin occurs.

Under the null field mean \(\bar p\le0.995\), the early-look false-pass probability is bounded by AM–GM:
\[
P(\text{all 1,152 wins})=\prod_{j=1}^{128}p_j^9
\le \left(\frac{1}{128}\sum_jp_j\right)^{1152}
\le 0.995^{1152}
=0.0031059110875\ldots
\]
The final-look false-pass probability is bounded by the existing exact heterogeneous result at exactly 10 games per stratum:
\[
P(\text{at most 2 nonwins in 1,280 games})
\le P(\operatorname{Binomial}(1280,0.005)\le2)
=0.0459500437857\ldots
\]
Therefore the union bound gives
\[
\alpha_{\mathrm{total}}
\le 0.0031059110875+0.0459500437857
=0.0490559548731\ldots <0.05.
\]
No independence between the two looks is needed. This is a fixed, predeclared two-look group-sequential rule; the exact two-nonwin heterogeneous bound is used only at its proven (n=10) point. It remains a **single preselected candidate** design; candidate multiplicity needs separate allocation.

### Homogeneous-alternative operating characteristics

For a common per-game win probability \(p\), let \(q=1-p\), \(n_1=1152\), \(n_2=1280\), and \(m=128\). The pass probability is
\[
\pi(p)=p^{n_1}
+n_1q p^{n_1-1}\left(p^m+mq p^{m-1}\right)
+\binom{n_1}{2}q^2p^{n_2-2}.
\]
The three terms correspond to: zero nonwins by the early look (early pass); exactly one nonwin by the early look and at most one in the final 128 games; exactly two nonwins by the early look and zero in the final 128 games. These are planning values under a homogeneous alternative, not a uniform power guarantee over heterogeneous alternatives.

| True homogeneous win rate | Pass probability | Expected games |
|---:|---:|---:|
| 99.8% | 52.86% | 1,047.1 |
| 99.9% | 86.19% | 1,186.1 |
| 99.95% | 97.28% | 1,198.5 |

Expected games are computed by a direct stopping-time recursion over the active probabilities of 0, 1, or 2 nonwins; probability mass is removed on the early all-win look and on the third nonwin. The maximum is 1,280 games. This alternative has materially higher power than the one-nonwin two-look schedules at 99.9%–99.95%, at the cost of a much larger expected sample. It is not uniformly preferable; choose the schedule before examining confirmatory outcomes.

### Reproduction snippet

```python
from fractions import Fraction
from math import comb

# Exact alpha-spending check.
p0, q0 = Fraction(199, 200), Fraction(1, 200)
alpha1 = p0 ** 1152
alpha2 = sum(
    comb(1280, j) * q0**j * p0**(1280-j)
    for j in range(3)
)
assert alpha1 + alpha2 < Fraction(1, 20)

def expected_games(n1, n2, p, max_nonwins):
    q = 1 - p
    active = [1.0] + [0.0] * max_nonwins
    total = 0.0
    for t in range(1, n2 + 1):
        total += sum(active)
        nxt = [0.0] * (max_nonwins + 1)
        for j, mass in enumerate(active):
            nxt[j] += mass * p
            if j < max_nonwins:
                nxt[j + 1] += mass * q
        if t == n1:  # early pass on zero nonwins
            nxt[0] = 0.0
        active = nxt  # third nonwin is discarded automatically
    return total

def power(p):
    q, n1, n2 = 1-p, 1152, 1280
    m = n2 - n1
    return (
        p**n1
        + n1*q*p**(n1-1)*(p**m + m*q*p**(m-1))
        + comb(n1, 2)*q**2*p**(n2-2)
    )

for p in (0.998, 0.999, 0.9995):
    print(p, power(p), expected_games(1152, 1280, p, 2))
```

**Limitations:** assumes the same fixed 128-stratum estimand, independent games across all cells, frozen policies and candidate, and the existing exact heterogeneous bound's assumptions. Actual first/second strata mean the observed `actualFirstPlayerSeat` after the `GO_FIRST` chooser response; `CoinFlipPrompt` determines only who gets to choose. A controlled equal-start cohort must assign the `GO_FIRST` response to realize its predeclared starter, while natural-protocol chooser decisions should be evaluated and weighted separately. For a fair coin, let \(a_C=P(C\text{ chooses C-first}\mid C\text{ wins coin})\) and \(a_O=P(O\text{ chooses O-first}\mid O\text{ wins coin})\). Then \(w_C=P(C\text{ actually starts})=\tfrac12a_C+\tfrac12(1-a_O)\), and the natural-protocol win rate is \(w_Cp_{C\text{-first}}+(1-w_C)p_{C\text{-second}}\). The equal-start conditional estimand remains \(\tfrac12(p_{C\text{-first}}+p_{C\text{-second}})\). These chooser probabilities and weights may vary by matchup and physical seat. This is a statistical design option, not competitive evidence; it does not establish paper qualification or a 99.5% win rate.
