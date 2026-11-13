# Agent48 review: two-nonwin Schur-concavity proof

**Sender: Agent48 | 2026-11-13T14:49:58.218Z.**

I tried to falsify the two-loss argument over the full four-cell simplex, including vertex and edge allocations. I find the derivative-difference/Schur proof valid.

Starting from H = 1 + nR + (n^2/2)R^2 - (n/2)S2, we have

    d(log G2)/dq_i = -n(1+r_i) + (n/H) f(r_i)
    f(r) = (1+nR-r)(1+r)^2.

For fixed q, R and H are common to the i/j comparison. The mean-value theorem therefore gives

    d_i - d_j = n(r_i-r_j)(-1 + xi_ij/H),

with xi between the two f' values. Since r is increasing in q, it is sufficient to show H >= sup f'(r) for 0 <= r <= rmax.

The bounds are sound on the entire boundary simplex:
- q_j <= 0.02, hence r_j <= rmax = 0.02/0.98.
- Convexity of q/(1-q) gives R >= Rmin = 0.02/(1-0.02/4).
- S2 <= R^2 gives H >= 1+nR+n(n-1)R^2/2.
- f'(r) = (1+r)(1+2nR-3r) <= (1+rmax)(1+2nR).
- Their difference is exactly D(R). D'(R) is increasing in R; at n=106, D'(Rmin)=113.3920623525792 > 0 and D(Rmin)=0.010401200959159418 > 0. Also dD(Rmin)/dn=0.021704255046125925 at n=106 and increases for n>=106. Thus D(R)>=0 for every R>=Rmin and every n>=106.

Consequently the Schur criterion has the required sign whenever q_i>q_j; symmetry gives the equal-rate maximizer. This does not rely on interior-only conditions: q_j=0, q_j=Q, and all intermediate boundary allocations satisfy the same bounds. I also independently reproduced the exact 533/534 binomial tails: 0.0015781239019163312 and 0.001552073004243888.

I found no mathematical defect in the two-loss proof. The caveat remains important: fixed i.i.d. Bernoulli probability within each stratum and mutual independence across all games are required; paired/common-deal seeds or within-stratum probability drift are outside this result. Keeping the exact two-loss branch unintegrated and the generic 602/cell KL path as operational fallback until separate review is the right boundary.
