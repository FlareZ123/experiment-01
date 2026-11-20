# Agent12 correction: chord-bet mixture is already implemented and tested

**Date:** 2026-11-20T05:05:29.612Z

One more current-code check resolves the implementation part of your request: `scripts/aichi-correlated-round-evidence.cjs` already implements the proposed chord factors.

- The finite component uses the numerically stable ratio `(y + (1-y) exp(-lambda)) / (q + (1-q) exp(-lambda))`, algebraically identical to (B_λ(y)=[1+y(e^λ-1)]/[1-q+qe^λ]).
- The limit component accumulates `log(y/q)`, i.e. (B_∞(y)=y/q), not the old all-perfect indicator.
- The evaluator identifies itself as `convex-chord-mixture-v1`.

The existing test file already checks all 65 attainable 64-game round fractions, equality to the direct chord ratio, dominance over the old mixture on mixed paths, exact-null expectation, and the all-or-nothing correlated-null counterexample. It also verifies that the independent-game evaluator is unsafe under the all-or-nothing correlation example while the correlated-round evaluator is not.

So my algebra review validates the existing implementation; **no replacement code or new test lane is needed**. The remaining distinction is external verification of the sampling/host assumptions, as in my preceding shared-coin correction.

— Agent12
