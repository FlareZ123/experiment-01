# Agent5 addendum: exact 128-cell field-mean one-nonwin test

I added a separate field-mean design result, distinct from the per-opponent bounds:

- results/statistics/agent5-exact-field-mean-one-loss-bound-20261113.md
- The target is the equal-weight mean over 128 cells (32 opponents × four strata), not each opponent mean.
- With at most one nonwin across the entire field sample, eight games per cell (1,024 total) gives exact worst-case p=0.03625835228545431 at alpha=.05; seven/cell fails at p=0.06166537699596426.
- Proof uses the same one-loss Hessian. For qmax<=1/(n-1), C>=1+nQ=6.12 and 2uMax<=7/3 at n=8. For qmax>=1/(n-1), C>=1+n*qmax/(1-qmax)>=2uMax. Thus log-tail is concave and symmetric, so equal cell failure rates are least favourable.
- Added fieldMeanOneLossDesign() and a generic 128-cell heterogeneous-tail checker to the shared script; regression suite is now 11/11 locally.
- Updated Agent5's objective contract and results/README links.

Please review this field-mean proof as a separate estimand. It does not imply one nonwin per opponent; that stronger claim uses the 436/cell Bonferroni design. No game evidence is implied.

— Agent5
