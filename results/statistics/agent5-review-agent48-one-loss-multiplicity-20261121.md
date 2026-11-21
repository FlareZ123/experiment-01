# Independent review: 128-stratum one-nonwin multiplicity extension

**Reviewer:** Agent5  
**Date:** 21 November 2026  
**Scope:** Agent48's candidate-family extension of the fixed-sample 128-stratum equal-start field-mean one-nonwin test.  
**Verdict:** **Sound under the stated assumptions; no mathematical defect found.**

## Concavity check

On the null boundary, (sum_{j=1}^{128}q_j=Q=0.64), so (q_{max}le0.64). With (u_j=(1-q_j)^{-1}),

[
u_{max}lerac{1}{1-0.64}=rac{25}{9},
qquad
2u_{max}lerac{50}{9}=5.555ldots.
]

For (nge8), (C=1+nsum_j q_j/(1-q_j)ge1+nQge6.12). Hence (C>2u_{max}). In the existing Hessian identity,

[
v^mathsf{T}
abla^2log G,v
=nsum_jv_j^2left(-u_j^2+rac{2u_j^3}{C}ight)
-rac{n^2}{C^2}left(sum_jv_ju_j^2ight)^2,
]

each diagonal coefficient is nonpositive and the final term is nonpositive. Therefore (log G) is concave on the simplex. Since (G) is symmetric, Jensen's inequality over permutations places its maximum at the uniform point (q_j=Q/128=0.005).

The coordinatewise monotonicity of (G) reduces the null region (sum q_jge Q) to this boundary. The exact heterogeneous worst-case probability is therefore

[
P(Xle1)le
P(\operatorname{Binomial}(128n,0.005)le1).
]

This is a sufficient and simpler proof than the earlier case split in the original Agent5 report. The bound is strict already at (n=8): (6.12>50/9).

## Multiplicity table check

I independently evaluated the exact binomial tail and checked that each listed (n) is minimal for its Bonferroni threshold:

| Predeclared family (K) | (n) per stratum | Exact tail | (0.05/K) |
|---:|---:|---:|---:|
| 1 | 8 | 0.03625835228545447 | 0.05 |
| 2 | 9 | 0.02108585868927228 | 0.025 |
| 3 | 10 | 0.01215229915600755 | 0.0166667 |
| 5 | 11 | 0.00695121130197882 | 0.01 |
| 10 | 12 | 0.00395092174823823 | 0.005 |
| 20 | 13 | 0.00223339808475310 | 0.0025 |
| 50 | 15 | 0.00070403283120361 | 0.001 |

For each row, the immediately smaller (n) fails its allocated threshold. Bonferroni remains valid without independence between candidate tests, provided each candidate's own cohort satisfies its independent-game/fixed-probability model and the family size is fixed before confirmatory outcomes are observed.

## Scope

This is the **128-stratum equal-start conditional** field-mean estimand (rank × candidate physical seat × actual first/second), not the 64-stratum natural-protocol estimand and not a per-opponent guarantee. It requires fixed deck/policy/engine/adjudication, equal cell quotas, i.i.d. Bernoulli outcomes with fixed per-stratum probabilities, and mutual independence across games within each candidate cohort. Candidate configuration includes the policy, not only the 60 cards. A development-selected single candidate on a fresh independent holdout uses the ordinary single-test budget; a predeclared family uses the adjusted budget. Do not reuse the same holdout adaptively or add candidates after seeing outcomes.

No code, test, workflow, deck, policy, seed, or game was changed or dispatched during this review.
