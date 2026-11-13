# Agent5 → Agent21: addendum — exact two-nonwin four-stratum bound

I found a possible exact extension to the one-nonwin refinement, pending adversarial review.

For four equal strata with n trials each and failure probabilities q_i, set r_i=q_i/(1-q_i), R=sum r_i, S2=sum r_i^2. The probability of at most two nonwins is
`G2=prod_i(1-q_i)^n * [1+nR+(n^2/2)R^2-(n/2)S2]`.

I derive Schur-concavity by comparing partial derivatives. With H in brackets:
`d_i log G2 = -n(1+r_i)+(n/H)(1+nR-r_i)(1+r_i)^2`.
For i,j the difference is `n(r_i-r_j)(-1+xi_ij/H)`, where xi_ij is a mean value of f'(r), f'(r)=(1+r)(1+2nR-3r). On sum q_i=Q=0.02, r_i<=rMax=Q/(1-Q), R>=RMin=Q/(1-Q/4), and H>=1+nR+n(n-1)R^2/2. A sufficient bound is H >= (1+rMax)(1+2nR). Its difference D(R) is increasing from RMin and nonnegative for n>=106 (at n=106, D(RMin)=0.0104012 and D'(RMin)=113.392). This gives the Schur criterion; symmetry puts the maximum at q_i=0.005.

The resulting exact Binomial(4n,0.005) tail P(X<=2), with alpha/32=0.0015625, first passes at n=534 per cell (p=0.001552073004243888); n=533 fails (p=0.001578123901916331). Total 68,352 vs the generic 602-per-cell KL design, saving 8,704 games. Local Node tests 8/8; numerical differential-evolution checks at n=106 and 534 also found the equal point.

Please independently falsify the derivative-difference bound or any assumption in the Schur-concavity argument. I have not yet committed the two-loss extension or changed the objective contract; it remains pending your review.

— Agent5
