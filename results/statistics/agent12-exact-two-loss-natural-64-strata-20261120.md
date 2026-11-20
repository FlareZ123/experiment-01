# Exact two-nonwin natural-protocol field-mean design for 64 strata

**Agent 12 · 20 November 2026 · prospective statistical design only.** This is a statistical qualification design, not evidence that any deck has achieved the target.

## Result

For the equal-weight **natural tournament-protocol field mean** across all 32 Aichi Open League opponents and the two candidate physical seats, a fixed balanced design of:

- **20 independent games in each of 64 strata** (opponent rank × candidate physical seat);
- **1,280 total games**;
- pass only if there are **at most two nonwins** across the complete sample,

has an exact worst-case null p-value of **0.045950043785651845**, below the one-sided 5% threshold. The null is that the equal-weight natural-protocol field mean game-win probability is at most 99.5%.

The adjacent smaller fixed design, 19 games per stratum (1,216 total), cannot pass this same at-most-two-nonwin rule: the equal-stratum null point alone has p-value **0.0580617402978067**. Thus 20 per stratum is minimal for this fixed-sample rule.

### Predeclared two-look alternative

The same exact result supports a finite-look group-sequential rule:

1. **Look 1:** after 19 complete rounds (1,216 games), pass early only if all 1,216 games are wins.
2. **Look 2:** otherwise continue to 20 complete rounds (1,280 games); pass if there are at most two nonwins in total.
3. **Futility:** stop as soon as a third nonwin occurs.

Under the null field mean \(\bar p\le0.995\), the early all-win probability is bounded by
\[
0.995^{1216}=0.002253544751357136\ldots
\]
and the final-look false-pass probability is bounded by the exact heterogeneous result above:
\[
P(\operatorname{Binomial}(1280,0.005)\le2)
=0.045950043785651845\ldots.
\]
The union bound gives
\[
\alpha_{\rm total}\le0.04820358853700898<0.05.
\]
No independence between the two looks is required. The early and final looks must be predeclared; do not select a look schedule after seeing confirmatory outcomes.

## Estimand and assumptions

Index the 64 equally weighted strata by opponent rank \(r\in\{1,\ldots,32\}\) and candidate physical seat \(s\in\{0,1\}\). Let \(q_j\) be the fixed per-game nonwin probability in natural tournament protocol in stratum \(j\). Each stratum contributes exactly \(n=20\) independent, identically distributed games, and all games are mutually independent across strata.

The natural-protocol field-mean null is
\[
H_0:\quad \frac1{64}\sum_{j=1}^{64}(1-q_j)\le0.995,
\]
equivalently
\[
\sum_{j=1}^{64}q_j\ge Q=64(0.005)=0.32.
\]

**Natural protocol is part of the estimand.** In every game, the coin toss is fair and the policy that wins the toss naturally resolves the subsequent \`ConfirmPrompt/GO_FIRST\` choice. The coin toss selects the chooser; GO_FIRST selects the actual starter. The resulting actual-first/second mixture is integrated into each \(q_j\). Do not override GO_FIRST in this 64-stratum natural-protocol cohort. Record coin winner, chooser, chooser response, actual starter, and physical seat separately.

This differs from the **128-stratum equal-start conditional estimand**, which separately samples candidate-first and candidate-second cells and must control GO_FIRST to realize the assigned actual starter. The two estimands must not be conflated.

The result requires all 32 authenticated opponent lists, frozen candidate and opponent policies, fixed engine/hooks and adjudication, equal cell quotas, and genuinely independent paper-qualified games. Within each stratum the win probability must remain fixed over the sample. It does not apply to paired/common-deal clusters, changing policies or versions, post-hoc sample allocation, or per-game probabilities that vary within a stratum. Ties count as nonwins for a game-win-rate target. Censored, errored, native-only, or otherwise unqualified attempts remain governed by the evidence ledger and cannot be silently dropped or relabelled.

## Heterogeneous worst-case proof

First, \(P_q(X\le2)\) is coordinatewise nonincreasing in each \(q_j\), so its supremum over \(\sum q_j\ge0.32\) occurs on the boundary \(\sum q_j=0.32\).

It remains to show that equal stratum failure rates maximize this lower tail on the simplex. Consider any pair of strata with probabilities \(q_i,q_j\), and hold their sum \(s=q_i+q_j\) fixed while increasing their product \(t=q_iq_j\) toward \(s^2/4\). This is pairwise equalization. Put
\[
A=1-s+t,\qquad b=s-2t,\qquad
r_k=\frac{q_k}{1-q_k}\quad(k\ne i,j),
\]
\[
h_0=\prod_{k\ne i,j}(1-q_k)^{20},\qquad
R=20\sum_{k\ne i,j}r_k,
\]
\[
T=\frac{20^2}{2}\left(\sum_{k\ne i,j}r_k\right)^2
-\frac{20}{2}\sum_{k\ne i,j}r_k^2.
\]

Expanding the zero-, one-, and two-nonwin terms and differentiating at fixed \(s\) gives
\[
\frac{\partial P_q(X\le2)}{\partial t}
=20A^{17}h_0\left(P_0+RP_1+TP_2\right),
\]
where
\[
P_0=19\left(-Ab+9b^2+tA\right),\qquad
P_1=A(19b-A),\qquad
P_2=A^2.
\]
The leading factor is positive. Write \(u=0.32-s\). Convexity and superadditivity of \(x/(1-x)\) give
\[
R_{\rm lo}=\frac{20u}{1-u/62}\le R\le
\frac{20u}{1-u}=R_{\rm hi}.
\]
Also,
\[
T\ge\frac{19}{40}R^2.
\]
Throughout the domain, \(0\le b\le s\), \(1-s\le A\le1\), and therefore
\[
P_0\ge-19s.
\]

The derivative bracket is positive in three regions.

1. **Region A: \(0\le s\le3/50\).** If \(P_1<0\), then \(|P_1|=A(A-19b)\le A^2\le1\); if \(P_1\ge0\), its contribution is nonnegative. Hence \(RP_1\ge-R_{\rm hi}\). Here \(u\ge13/50\), so
   \[
   R_{\rm lo}\ge\frac{20(13/50)}{1-(13/50)/62},
   \quad
   R_{\rm hi}\le\frac{20(8/25)}{1-8/25}=\frac{160}{17},
   \quad A^2\ge(47/50)^2.
   \]
   Using \(T\ge(19/40)R_{\rm lo}^2\), the bracket is at least the exact rational
   \[
   -19(3/50)-160/17+
   (47/50)^2\frac{19}{40}
   \left(\frac{20(13/50)}{1-(13/50)/62}\right)^2
   =0.8929806151284924\ldots>0.
   \]

2. **Region B: \(3/50\le s\le103/1000\).** Since \(t\le s^2/4\),
   \(b\ge s-s^2/2\). The function \(19s(1-s/2)\) is increasing on the full domain and at \(s=3/50\) equals \(5529/5000>1\ge A\). Thus \(P_1>0\). Also \(u\ge217/1000\) and \(A\ge1-s\ge897/1000\). Therefore the bracket is at least
   \[
   -19(103/1000)+(897/1000)^2\frac{19}{40}
   \left(\frac{20(217/1000)}{1-(217/1000)/62}\right)^2
   =5.292421452947837\ldots>0.
   \]

3. **Region C: \(103/1000\le s\le8/25\).** Again \(P_1>0\). For \(h(s,t)=-Ab+9b^2+tA\),
   \[
   h_t=3A-37b+t\le3-37s+\frac{75}{4}s^2<0.
   \]
   The upper bound is decreasing on this interval (its derivative is \(-37+\frac{75}{2}s<0\)) and is already negative at \(s=103/1000\). Thus \(h\) decreases in \(t\), so its minimum occurs at \(t=s^2/4\), where
   \[
   h(s,s^2/4)=\frac{s(s-2)^2(39s-4)}{16}\ge0
   \]
   because \(103/1000>4/39\). Hence \(P_0\ge0\), and the full bracket is nonnegative.

Consequently pairwise equalization cannot decrease \(P_q(X\le2)\). Repeated equalization shows that the maximum occurs at \(q_j=0.005\) for every stratum. At that point \(X\sim\operatorname{Binomial}(1280,0.005)\), giving the exact p-value above.

## Homogeneous-alternative operating characteristics

For a common natural-protocol win probability \(p\), let \(q=1-p\), \(n_1=1216\), \(n_2=1280\), and \(m=64\). The two-look pass probability is
\[
\pi(p)=p^{n_1}
+n_1q p^{n_1-1}\left(p^m+mq p^{m-1}\right)
+\binom{n_1}{2}q^2p^{n_2-2}.
\]
Expected games are computed by a direct stopping-time recursion over active probabilities of 0, 1, or 2 nonwins; mass is removed on the early all-win look and on the third nonwin.

| True homogeneous natural-protocol win rate | Pass probability | Expected games |
|---:|---:|---:|
| 99.8% | 52.84% | 1,054.2 |
| 99.9% | 86.18% | 1,207.5 |
| 99.95% | 97.28% | 1,235.6 |

These are homogeneous-alternative planning values, not a uniform power guarantee over heterogeneous matchup probabilities.

## Reproduction

Run \`python scripts/agent12-exact-two-loss-natural-64-strata-proof.py\`. The script uses exact rational arithmetic to certify the Region A and B lower bounds, the Region C endpoint conditions, the adjacent fixed-sample binomial tails, and the two-look alpha sum.

**Limitations:** this is one aggregate natural-protocol field-mean test, not a guarantee that every opponent matchup individually exceeds 99.5%. It does not establish paper qualification or competitive strength. All 32 matchup-level outcomes, failures, sample counts, frozen policies, engine revision, and uncertainty must still be reported.
