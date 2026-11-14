# Agent39 independent audit: 128-stratum two-nonwin field-mean proof

**14 November 2026 · Independent mathematical review of Agent12's prospective design**

## Review outcome

I independently reconstructed the heterogeneous lower-tail derivative and checked the three-region sign proof in [Agent12's exact two-nonwin field-mean report](agent12-exact-two-loss-field-mean-bound-20261114.md). **No mathematical defect was found.** The pairwise-equalization argument is valid for the stated model: 128 equally weighted strata, 10 independent i.i.d. Bernoulli games per stratum, and a total nonwin probability of at least 0.64 under the null.

This verifies a prospective statistical design only. It does not establish source-field admission, paper qualification, independent physical games, policy competence, deck strength, or a 99.5% result.

## Independent reconstruction of the derivative

For two selected strata, let their nonwin probabilities be (q_1,q_2), with fixed sum (s=q_1+q_2) and product (t=q_1q_2). Define

[
A=1-s+t,qquad B=s-2t.
]

The probability-generating polynomial for the combined 20 games in these two strata is

[
(A+Bz+tz^2)^{10}.
]

For the remaining 126 strata, define

[
r_k=rac{q_k}{1-q_k},quad R_0=sum r_k,quad
h_0=prod(1-q_k)^{10},
]

[
R=10R_0,qquad T=50R_0^2-5sum r_k^2.
]

Here (h_0), (h_0R), and (h_0T) are the zero-, one-, and two-nonwin probabilities for the remaining strata. In particular,

[
T=45sum r_k^2+100sum_{k<l}r_kr_lge45R_0^2.
]

Expanding the total event (Xle2) gives

[
P(Xle2)=h_0left[
A^{10}(1+R+T)+10A^9B(1+R)+10A^9t+45A^8B^2
ight].
]

Differentiating at fixed (s), and collecting terms, gives exactly

[
rac{partial P(Xle2)}{partial t}
=5A^7h_0(P_0+RP_1+TP_2),
]

with

[
egin{aligned}
P_0&=9(10B^2-2s+6t-2t^2),\
P_1&=2A(10B+t-1),\
P_2&=2A^2.
end{aligned}
]

This independently reproduces Agent12's derivative identity, including its factor and all three coefficient polynomials.

## Feasible-simplex bounds

On the null boundary, (sum_j q_j=0.64). For the selected pair, (0le sle0.64) and (0le tle s^2/4). The other 126 probabilities sum to (u=0.64-s).

Convexity of (x/(1-x)) gives the Jensen lower bound, while its superadditivity for nonnegative inputs summing to less than one gives the upper bound:

[
rac{u}{1-u/126}le R_0lerac{u}{1-u}.
]

Also (Age1-s), (Ale1), (P_2ge2(1-s)^2), (Tge45R_0^2), and (P_0ge-18s). These are the correct directions for the three-region lower bounds.

## Three-region sign audit

1. **(0le sle2/19).** The lower bound (b_{min}(s)=10s-19s^2/4-1) is nonpositive. Since (P_1=2A(10s-19t-1)), this gives (P_1ge2b_{min}(s)). Combining the adverse (P_0) and (RP_1) terms with the positive (TP_2) term gives Agent12's (F_1(s)). I independently simplified it to

   [
   F_1(s)=
   rac{
   22327109375s^5-64823018750s^4+84498860750s^3
   -82866212360s^2+26972769608s+149021440
   }{(25s+9)(25s+3134)^2}.
   ]

   Its derivative numerator, after canceling the common positive factor, matches the seven coefficients in Agent12's exact-rational script. Substitution (s=2z/19) yields seven strictly positive Bernstein coefficients on (zin[0,1]). Since (F_1(0)=37255360/22099401>0), the bound is positive throughout the interval.

2. **(2/19le sle11/50).** Here (P_1ge0). Using (P_0ge-18s), (1-sge39/50), and (R_0ge126/299), the derivative bracket is bounded below by

   [
   -rac{99}{25}
   +90left(rac{39}{50}ight)^2left(rac{126}{299}ight)^2
   =rac{381123}{66125}>0.
   ]

3. **(11/50le sle16/25).** Again (P_1ge0). For (h(s,t)=10(s-2t)^2-2s+6t-2t^2),

   [
   h_t=6-40s+76tle6-40s+19s^2<0.
   ]

   Thus the minimum occurs at (t=s^2/4), where

   [
   g(s)=rac{s(s-2)^2(19s-4)}8.
   ]

   It is positive at (s=11/50), with (g(11/50)=784179/50000000), and its derivative ((s-2)(19s^2-22s+2)/2) is positive throughout this interval. Hence (P_0ge0).

The derivative is therefore nonnegative for every feasible pair and every configuration of the other 126 strata. Pairwise averaging increases (or preserves) the lower-tail probability until all 128 probabilities are equal. The equal vector is the global maximizer.

## Numerical and interpretation checks

The exact null-boundary tail is

[
P{operatorname{Binomial}(1280,0.005)le2}
=0.04595004378565184
]

using the exact-rational calculation in Agent12's certificate. At 1,152 games the equal null point alone gives (0.07308314434173511), so the same at-most-two-nonwin rule cannot pass with nine games per stratum.

A direct independent floating-point evaluation differs only in the final few (10^{-16}) digits; this is ordinary numerical rounding, not a discrepancy in the exact certificate.

## Scope limits retained

- This is one equal-weight aggregate field-mean test, not 32 simultaneous per-opponent guarantees.
- It requires exactly balanced fixed quotas and a fixed within-stratum win probability.
- It assumes mutually independent games and i.i.d. outcomes within each stratum.
- It is fixed-sample only; it does not permit optional stopping or post-hoc sample allocation.
- Paired/common-deal clusters, changing policies/engine versions, unqualified games, and incomplete opponent admission do not satisfy the stated model.

**Conclusion:** Agent12's 1,280-game, at-most-two-nonwin proof is independently supported under its explicit assumptions. No deck, policy, opponent field, or qualification status changes follow from this review.
