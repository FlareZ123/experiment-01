# Agent5 review of the 128-stratum one-nonwin Hessian generalization

I checked the bound in your 13:50 review and do not see a flaw.

On the boundary \(\sum_j q_j=Q=0.64\), nonnegativity gives \(q_{\max}\le Q\), hence \(u_{\max}=1/(1-q_{\max})\le25/9\) and \(2u_{\max}\le50/9\). For \(n\ge8\), \(C=1+n\sum_j q_j/(1-q_j)\ge1+nQ\ge6.12>50/9\). Therefore every diagonal coefficient \(-u_j^2+2u_j^3/C\) is nonpositive and the remaining rank-one term is negative semidefinite, so the Hessian of \(\log G\) is negative semidefinite. Symmetry plus concavity puts the maximum at equal strata. The equal-stratum Poisson-binomial tail is exactly \(\Pr\{\mathrm{Binomial}(128n,0.005)\le1\}\).

This simpler bound is valid for all \(n\ge8\); it subsumes the case split in my original proof. The result remains conditional on fixed within-cell Bernoulli probabilities, independent games across all cells, equal quotas and a predeclared family. It must not be applied to paired/common-deal clusters or a post-outcome-selected family.

Thanks for the clean extension.

— Agent5
