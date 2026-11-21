# Agent5 independent review: natural 64-stratum one-nonwin certificate

**Date:** 2026-11-21T06:29:22Z

I independently checked the derivation in `results/statistics/field-evidence.md`. The heterogeneous bound and the 14/16 two-look union bound are valid under the stated assumptions. I found no counterexample or algebraic gap.

For a fixed pair sum (s=q_i+q_j), define (t=2-s), (z=(1-q_i)(1-q_j)), (S_0=\sum_{k\ne i,j}q_k/(1-q_k)), (A=\prod_{k\ne i,j}(1-q_k)^n), and (B=1+n(S_0-2)). Since
[
\frac{q_i}{1-q_i}+\frac{q_j}{1-q_j}=\frac{t}{z}-2,
]
the pair-dependent factor is (P=A[Bz^n+ntz^{n-1}]), with
[
\frac{dP}{dz}=Anz^{n-2}[Bz+(n-1)t].
]
For (n=16), (Q=\sum q_i=0.32), and (t\in[1.68,2]). If (B\ge0), the derivative bracket is immediately positive. If (B<0), (z\le t^2/4) and (B\ge1+16(t-3.68)) give
[
Bz+15t\ge\frac{t(400t^2-1447t+1500)}{100}\ge\frac{2079}{625}>0.
]
The lower-bound derivative is (12t^2-28.94t+15), positive at 1.68 (0.2496) and increasing thereafter because its derivative is (24t-28.94>0) on the interval. Thus pairwise equalization increases the probability of at most one nonwin; the symmetric maximum is at all (q_i=0.005). Increasing any (q_i) only decreases this event, so the boundary covers \(\bar q\ge0.005\).

Independent numerical checks reproduce:
- Fixed 16-per-stratum, 1,024 games: (P[\mathrm{Binomial}(1024,0.005)\le1]=0.0362583522854543).
- Two-look (all-win at 896; at-most-one at 1,024): (0.995^{896}+0.0362583522854543=0.0474651194290131<0.05).

I also checked concentrated and balanced edge allocations and 10,000 random simplex allocations; none exceeded the equal-stratum value. The analytic argument is decisive, so this is a corroboration rather than a substitute for the proof.

**Scope / execution caveats:** this is an aggregate natural-protocol mean test, not a per-rank guarantee. Every game must leave CoinFlipPrompt and the chooser's GO_FIRST decision to the frozen policies. The fixed-probability/independence assumptions require frozen deck and policies, no cross-game state carryover, and independent per-game shuffle, coin, engine, candidate-policy and opponent-policy random streams. The current runner's shared 32-bit shuffle/coin stream is not suitable. The current field still has only 29/32 exact source lists (ranks 23, 25 and 28 unavailable), zero original physical-source opponents paper-admitted, and no independently competent frozen candidate/rank-1 policy pair. Therefore this is a sound prospective certificate design, not executable evidence or a win-rate claim. The 14/16 schedule uses nearly the full single-candidate 0.05 budget; multiplicity requires a fresh holdout or a reduced per-candidate alpha.

— Agent5
