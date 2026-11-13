# Exact two-nonwin four-stratum confidence design for a 99.5% per-opponent target

**Status: prospective statistical design; no games or deck strength established.**

## Result

For each of 32 pre-specified opponents, balance four independent strata equally:

1. candidate occupies physical seat 0, candidate goes first;
2. candidate occupies physical seat 0, candidate goes second;
3. candidate occupies physical seat 1, candidate goes first;
4. candidate occupies physical seat 1, candidate goes second.

At **534 independent games per stratum** (2,136 games per opponent), an exact one-sided test can reject the null that the equally weighted mean opponent win rate is at most 99.5%, provided that opponent has **at most two nonwins** across its 2,136 games. The equal-stratum configuration is proven to maximize the null probability of observing at most two nonwins for every four-stratum failure-rate vector when n ≥ 534.

For a 32-opponent family at 95% family-wise confidence:

| Quantity | Result |
| --- | ---: |
| Per-stratum sample | 534 |
| Per-opponent sample | 2,136 |
| Full-field sample | 68,352 |
| Bonferroni alpha per opponent | 0.0015625 |
| Worst-case exact p-value at n=534 | 0.001552073004243903 |
| Equal-stratum p-value at n=533 | 0.001578123901916346 |
| Minimum proven per-stratum sample | **534** |

The existing two-nonwin heterogeneous KL design requires 602 games per stratum (77,056 games over 32 opponents). This exact special case saves **8,704 games (11.30%)** while retaining a two-nonwin allowance. It is less efficient than the separate one-nonwin exact design (436 per stratum), but tolerates one additional nonwin per opponent.

This is a per-opponent simultaneous guarantee, not a single aggregate field-average claim.

## Statistical model and assumptions

For one opponent, let the four strata have independent per-game failure probabilities q₁,…,q₄. Each stratum contributes exactly n independent games:

\[
X_j \sim \operatorname{Binomial}(n,q_j),\qquad X=\sum_{j=1}^{4}X_j.
\]

The equally weighted mean failure probability is \(\bar q=(q_1+q_2+q_3+q_4)/4\). The null for a 99.5% mean win-rate target is

\[
H_0:\quad \bar q\ge 0.005
\quad\Longleftrightarrow\quad
q_1+q_2+q_3+q_4\ge Q=0.02.
\]

The test rejects when the observed total nonwins are at most two. Its p-value is the supremum of \(P_q(X\le2)\) over this composite null. Bonferroni allocates \(0.05/32=0.0015625\) to each opponent.

Required assumptions are the same as for the existing balanced-field confidence design: fixed candidate, opponent list, policy, engine/hooks and adjudication; genuinely independent games; exact equal quotas in all four strata; paper-qualified completed outcomes; and authenticated original opponent identities. The 128-cell ledger is the appropriate structural gate for equal counts and frozen identities, but external paper and independence audits remain necessary.

## Heterogeneous-stratum worst-case proof

First, \(P_q(X\le2)\) is nonincreasing in every qⱼ by stochastic monotonicity of Bernoulli failures. Therefore its supremum over \(\sum q_j\ge Q\) occurs on the boundary \(\sum q_j=Q\).

It remains to show that, for n ≥ 534 and Q = 0.02, equalizing any pair of q values cannot decrease \(P_q(X\le2)\). Repeated pairwise averaging then proves that the global maximum is at \(q_1=\cdots=q_4=Q/4=0.005\).

Choose a pair q₁,q₂ and hold its sum \(s=q_1+q_2\) and the other two probabilities fixed. Write \(t=q_1q_2\), \(A=1-s+t\), and \(u=Q-s=q_3+q_4\). Increasing t at fixed s is exactly pairwise equalization. Let h₀,h₁,h₂ be the probabilities that the other two strata contribute respectively zero, one, or two failures. Define

\[
R=\frac{h_1}{h_0}=n(r_3+r_4),\qquad
T=\frac{h_2}{h_0}=\binom n2(r_3^2+r_4^2)+n^2r_3r_4,
\qquad r_j=\frac{q_j}{1-q_j}.
\]

Expanding the two selected strata's probabilities for zero, one and two failures and differentiating gives

\[
\frac{\partial P(X\le2)}{\partial t}
=\frac{nA^{n-3}h_0}{2}
\left(P_0+RP_1+TP_2\right),
\]

where

\[
\begin{aligned}
P_0&=(n-1)\left[n(s-2t)^2-2s+6t-2t^2\right],\\
P_1&=2A\left[n(s-2t)+t-1\right],\\
P_2&=2A^2.
\end{aligned}
\]

The leading factor is positive. The following bounds hold throughout the simplex, since 0 ≤ s ≤ 0.02 and 0 ≤ t ≤ s²/4:

- \(1-s\le A\le1\), so \(P_2\ge2(1-s)^2\).
- \(P_0\ge-2s(n-1)\), because \(n(s-2t)^2\ge0\) and \(6t-2t^2\ge0\).
- Put \(B=n(s-2t)+t-1\). It is decreasing in t, so
  \[
  B\ge B_{\min}(s)=n(s-s^2/2)+s^2/4-1.
  \]
  The function \(B_{\min}\) is increasing in s. Let s₁ be its unique zero. For n ≥ 534, \(B_{\min}(0.002)>0\), hence s₁ < 0.002. Thus P₁ ≥ 0 for s ≥ s₁. For s ≤ s₁, B ≥ −1 and A ≤ 1, hence P₁ ≥ −2.
- Since q₃+q₄=u, \(r_3+r_4\ge u\) and \(r_3+r_4\le u/(1-u)\). Also \(r_3^2+r_4^2\ge(r_3+r_4)^2/2\). Consequently
  \[
  nu\le R\le\frac{nu}{1-u},\qquad
  T\ge\frac{n(n-1)}4u^2.
  \]
- Put \(g(s)=ns(1-s/2)^2\), which is increasing on [0,0.02], and let s₀ solve g(s₀)=2. Since g(0.004)>2 for n ≥ 534, s₀ < 0.004. Moreover s₁ < s₀: at s₁, \(n(s_1-s_1^2/2)=1-s_1^2/4\), so \(g(s_1)=(1-s_1^2/4)(1-s_1/2)<1<2\). For s ≥ s₀, \(s-2t\ge s(1-s/2)\), giving P₀ ≥ 0; P₁ is also nonnegative because s ≥ s₀ > s₁.

It remains to bound the two small-s regions.

**Case 1: 0 ≤ s ≤ s₁.** Use P₀ ≥ −2s₁(n−1), P₁ ≥ −2, R ≤ nQ/(1−Q), and the lower bounds on T and P₂. Since s₁ < 0.002, u ≥ Q−s₁ > 0.018, and 1−s ≥ 1−s₁ > 0.998,

\[
P_0+RP_1+TP_2
\ge
-0.004(n-1)-\frac{2nQ}{1-Q}
+\frac{n(n-1)}2(0.018)^2(0.998)^2.
\]

At n = 534 the right-hand side exceeds 21.9965. Its derivative with respect to n is positive for all n ≥ 534.

**Case 2: s₁ ≤ s ≤ s₀.** Here P₁ ≥ 0. Use P₀ ≥ −2s₀(n−1), u ≥ Q−s₀ > 0.016, and 1−s ≥ 1−s₀ > 0.996:

\[
P_0+RP_1+TP_2
\ge
-0.008(n-1)
+\frac{n(n-1)}2(0.016)^2(0.996)^2.
\]

At n = 534 the right-hand side exceeds 31.8767. Its derivative is positive for all n ≥ 534.

**Case 3: s ≥ s₀.** P₀, P₁ and TP₂ are all nonnegative.

Therefore the derivative with respect to t is nonnegative for every pair and every point on the four-cell simplex whenever n ≥ 534. Pairwise averaging increases the tail probability until all qⱼ are equal. This proves the equal-stratum worst case for the stated target and sample range.

## Exact sample boundary

At the worst-case equal configuration, X is Binomial(4n, 0.005). Therefore

\[
p_n=P\{\operatorname{Binomial}(4n,0.005)\le2\}.
\]

High-precision evaluation gives:

- n = 533: p = 0.0015781239019163460528…, above 0.0015625, so it fails.
- n = 534: p = 0.0015520730042439028557…, below 0.0015625, so it passes.

The equal configuration is itself a valid null point, and the equal-stratum tail decreases as n increases. Thus no n ≤ 533 can pass; the heterogeneity proof establishes validity at n = 534. The minimum proven sample is exactly 534 games per stratum.

## Reproducible implementation

- [Design calculator](../../scripts/agent39-exact-two-nonwin-balanced-matchup-bound.cjs)
- [Node regression tests](../../tests/agent39-exact-two-nonwin-balanced-matchup-bound.test.cjs)

The calculator computes the exact four-stratum tail by truncated probability-generating-function convolution and only labels the equal-stratum value as the worst-case p-value when n ≥ 534, where the proof applies. The tests cover the 533/534 boundary, adversarial heterogeneous fixtures, equality with the ordinary binomial tail, q = 0/1 boundaries, and invalid inputs.

The helper is deliberately a **design calculator**, not an observed-ledger evaluator. It does not check whether every opponent actually has at most two nonwins. A future evaluator should first call the shared 128-stratum ledger validator, require at most two nonwins for every opponent, and then apply this exact per-opponent p-value. The existing KL evaluator remains unchanged.

## Limitations and current project status

This result is statistical design only. It does not establish that any deck, policy or opponent is legal, physically authenticated, independently sampled, or strong. It cannot be applied to the current 24 diagnostic-only Aichi reconstructions as a 32-opponent competitive claim: five unchanged lists are incompatible with international Expanded, three exact lists are unavailable, and original physical-source paper admission remains 0/32. No games or 99.5% result are established.

The result complements [Agent5's exact one-nonwin design](agent5-exact-one-loss-balanced-matchup-bound-20261113.md) and the [existing 128-stratum simultaneous matchup methodology](agent12-simultaneous-128-stratum-matchup-confidence-20261107.md). Do not generalize the pairwise-smoothing proof to another target or a three-or-more-nonwin tail without a separate proof.
