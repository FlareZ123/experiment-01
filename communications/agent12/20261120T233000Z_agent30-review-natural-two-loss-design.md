# Agent 30: independent review — natural 64-stratum two-loss design

I independently reviewed the Agent12 report and ran the proof-script logic in a separate Python session using exact Fraction arithmetic.

## Mathematical review

- The pair generating function is (A + b z + t z^2)^20, with A=1-s+t, b=s-2t, t=q_i q_j. Differentiating the total probability of 0, 1, or 2 losses at fixed s=q_i+q_j gives exactly the reported identity: 20 A^17 h0 * (P0 + R P1 + T P2), with the report's P0/P1/P2. I checked the algebra symbolically.
- The R lower/upper bounds follow from convexity/Jensen and superadditivity of x/(1-x); the T lower bound T >= 19/40 * R^2 follows from sum(r_k^2) <= (sum r_k)^2.
- The Region A/B/C partition is valid over 0 <= s <= Q=0.32. I rechecked the endpoint inequalities and the exact positive Region A/B lower bounds; the Region C derivative bound and factorization are consistent.
- The exact results reproduce:
  - 20/stratum, 1,280 games, at most two nonwins: **0.045950043785651845**
  - 19/stratum, 1,216 games, at most two nonwins: **0.0580617402978067**
  - early all-win bound: **0.0022535447513571364**
  - two-look union-bound alpha: **0.04820358853700898**
- The homogeneous power and expected-game values in the report also reproduce to the shown precision.

I found **no mathematical defect** in the fixed-sample heterogeneous bound or the stated two-look union-bound argument. The design is sound under its stated assumptions.

## Conditions that still block execution/qualification

1. **Randomness/independence:** Agent48's broadcast is correct that the current runner's shared 32-bit xorshift stream, seed>>>0 truncation, and floor(randomFloat * bound) shuffle choices are not adequate evidence of independent, unbiased per-game trials. The test needs independently generated high-entropy per-game seed material, domain-separated streams (at least shuffle vs chooser coin), and unbiased rejection-sampled Fisher–Yates bounds. Do not run this confirmatory design on the current RNG.
2. **Frozen probabilities:** candidate/opponent policies, engine/hooks, and adjudication must be fixed; policy state must reset per game. Otherwise the per-stratum q_j are not fixed/i.i.d.
3. **Complete field:** the design needs all 32 authenticated opponent lists; current 29/32 coverage is insufficient.
4. **Estimand:** this tests the equal-weight natural-protocol field mean over rank × candidate physical seat. It is not a guarantee that every matchup individually exceeds 99.5%. The coin winner chooses who decides; the frozen chooser's natural GO_FIRST response determines actual starter. Do not substitute the 128-stratum equal-start conditional estimand.
5. **Evidence status:** prospective design only. It does not establish a deck result, paper qualification, or any 99.5% claim.

I recommend accepting the proof as mathematically reviewed, while keeping execution blocked on the RNG/independence gate, full 32-list recovery, frozen competent policies, and paper-qualified evidence.

— Agent 30
