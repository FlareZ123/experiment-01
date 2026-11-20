# Full-field bounds on two-sided mulligan bonus offers with three missing Aichi lists

**Agent 2 · 20 November 2026**

**Evidence class:** exact finite-population combinatorics and exhaustive integer sensitivity over the missing opponents' Basic counts. No game simulation, source reconstruction, accepted bonus draws, or matchup/win-rate evidence.

## Question

Agent30's 20 November report computes the exact equal-rank mean of maximum optional mulligan bonus offers over the 29 authenticated Aichi lists. Ranks 23, 25, and 28 remain unavailable. Can those three unknown Basic counts reverse the *sign* of the 32-opponent average for the five-Basic Psychic Reserve v3 or fourteen-Basic Hood Shield v1 candidate?

This report bounds the missing ranks without inventing any decklists.

## Exact two-player model

For a 60-card deck with (b) Basic Pokémon and a seven-card opening hand, define

\[
p(b)=1-\frac{\binom{60-b}{7}}{\binom{60}{7}},\qquad q(b)=1-p(b).
\]

Let candidate A have (a) Basics and opponent B have (b) Basics. A simultaneous no-Basic opening has probability (q_Aq_B) and restarts jointly without a unilateral step-5.d mulligan. Let (z=1-q_Aq_B). The mutually exclusive first non-joint-failure outcomes are:

[
P(B\text{ gets an offer})=\frac{q_Ap_B}{z},\quad
P(A\text{ gets an offer})=\frac{p_Aq_B}{z},\quad
P(\text{neither})=\frac{p_Ap_B}{z}.
]

If A is the sole player without a Basic, A's number of unilateral failed seven-card deals, including the first, is geometric with mean (1/p_A). Therefore the expected maximum optional offers are

[
E_B=\frac{q_Ap_B}{zp_A},\qquad
E_A=\frac{p_Aq_B}{zp_B}.
]

Define the per-opponent difference

[
D_a(b)=E_B-E_A,
]

positive when the opponent has the larger expected maximum offer ceiling. These are optional offers; the recipient may take fewer or none.

## Exhaustive missing-rank bounds

For each candidate count `a ∈ {5, 14}`, I evaluated the exact rational formula for every integer opponent Basic count `b = 1, …, 60`. The interval is deliberately broad: a playable 60-card tournament deck must contain at least one Basic Pokémon, and no source inventory is assumed for the missing ranks.

| Candidate | Minimum (D_a(b)) | Maximum (D_a(b)) |
|---|---:|---:|
| Psychic Reserve v3 (5 Basics) | −6.4642231137 at `b = 1` | +1.1072054578 at `b = 54–60` |
| Hood Shield v1 (14 Basics) | −7.4105402715 at (b=1) | +0.1608882999 at (b=54\ldots60) |

The exact extremal fractions are:
- 5-Basic candidate: minimum (-16754148/2591827), maximum (409955/370261).
- 14-Basic candidate: minimum (-13073853/1764224), maximum (40549/252032).

The maximum occurs at 54 or more Basics because every seven-card hand then contains a Basic; the opponent cannot mulligan and the candidate's own failure offers the opponent bonus cards. The minimum occurs at one opponent Basic.

Agent30's exact known-29 equal-rank means are (+0.7729606344) for the 5-Basic candidate and (-0.1733565235) for Hood. The full-32 mean is the known-29 sum plus the three unknown per-rank differences, divided by 32. Applying the extrema independently gives:

| Candidate | Known-29 mean (D) | Full-32 mean lower bound | Full-32 mean upper bound |
|---|---:|---:|---:|
| Psychic Reserve v3 (5 Basics) | +0.7729606344 | **+0.0944746580** | +0.8042960866 |
| Hood Shield v1 (14 Basics) | −0.1733565235 | −0.8518424998 | **−0.1420210713** |

## Paper post-setup draw cap: 47 remaining cards

The repository's [setup procedure, steps 6–7](../../../resources/manual/EN_advanced_manual-2025-transcription-structured.md#L638-L680), sets aside six Prize cards before step 7 grants one optional draw per opponent mulligan. After the seven-card opening hand and six prizes, a valid player has 47 cards left. The unbounded geometric offer count above is a useful theoretical ceiling, but the maximum number of cards actually available to draw is \(\min(M,47)\).

Conditional on the opponent being the sole player without a Basic, the number \(M\) of unilateral mulligans has \(P(M\ge k)=q_A^{k-1}\). Therefore

\[
E[\min(M,47)]=\sum_{k=1}^{47}q_A^{k-1}=\frac{1-q_A^{47}}{p_A}.
\]

The paper-cap expected maximum available cards are consequently

\[
E_B^{47}=\frac{q_Ap_B}{z}\frac{1-q_A^{47}}{p_A},\qquad
E_A^{47}=\frac{p_Aq_B}{z}\frac{1-q_B^{47}}{p_B}.
\]

Re-evaluating all 60 possible Basic counts for each missing rank gives:

| Candidate | Known-29 mean \(D^{47}\) | Per-missing-rank minimum | Per-missing-rank maximum | Full-32 mean lower bound | Full-32 mean upper bound |
|---|---:|---:|---:|---:|---:|
| Psychic Reserve v3 (5 Basics) | +0.7729606344 | −6.4445318279 (1 Basic) | +1.1072054578 (54–60 Basics) | **+0.0963207161** | +0.8042960866 |
| Hood Shield v1 (14 Basics) | −0.1733565235 | −7.3887150502 (1 Basic) | +0.1608882999 (54–60 Basics) | −0.8497963853 | **−0.1420210713** |

The 47-card cap slightly narrows the extreme candidate-favored tail when a missing opponent has one Basic. It does **not** change the sign conclusion: the five-Basic candidate remains opponent-favored on mean maximum available bonus cards under every missing-rank Basic count, and fourteen-Basic Hood remains candidate-favored. The script and regression suite now compute both unbounded mulligan offers and this paper-cap version.

Thus, within this setup-only metric:
- Even if all three missing lists each had exactly one Basic, the 5-Basic candidate's full-field mean opponent-minus-candidate offer difference remains positive (at least +0.0945).
- Even if all three missing lists each had 54 or more Basics, Hood's full-field mean remains negative (at most −0.1420).

The **sign** of the equal-rank 32-list mean is therefore robust to all three missing Basic counts for both candidate configurations. The magnitude is not tightly identified, and these bounds do not replace the missing source lists.

## Reproduction

The calculation is fully specified by:
1. `p(b) = 1 − C(60−b, 7) / C(60, 7)`;
2. the joint-reset formulas above;
3. exhaustive evaluation of integer `b = 1, …, 60`;
4. `(29 × known29 mean + 3 × bound) / 32`, using Agent30's published 29-rank means.

A dependency-free implementation is provided at [the exact bounds script](../../../scripts/agent2-full32-mulligan-offer-bounds.py), with [six regression tests](../../../tests/test_agent2_full32_mulligan_offer_bounds.py). Run with `python3 scripts/agent2-full32-mulligan-offer-bounds.py` and `python3 tests/test_agent2_full32_mulligan_offer_bounds.py`. A local shell run of a copy of the committed script and the six corresponding unittest cases passed 6/6; the repository's broader CI/test runner has not been run.

The 29-rank source vector remains the previously authenticated vector; ranks 23, 25, and 28 are excluded from it and are not reconstructed here.

## Limitations and interpretation

- The measure is the **expected maximum optional bonus-card offer ceiling**, not the number of cards accepted or drawn.
- It models only opening Basic counts, independent uniform shuffles, and the simultaneous joint-reset rule. It does not model later draw quality, deck depletion, player decisions, board development, or games.
- It is not a matchup estimate, a candidate-strength ranking, or evidence toward the 99.5% objective.
- Psychic Reserve v3's separate Japanese-only Palace Book / Palace Belt conflict with the project's English-language international-Expanded candidate requirement remains unresolved. This calculation does not make that list eligible.
- The primary 32 source lists remain incomplete. These bounds are not a substitute for ranks 23, 25, and 28.

## Relationship to existing work

This is a narrow missing-rank sensitivity extension to [Agent30's opening/mulligan screen](agent30-iron-thorns-psychic-reserve-opening-mulligan-screen-20261120.md), which applies the established Agent1 / Agent16 two-sided formula to the known 29-list field. It does not supersede the underlying Agent1, Agent16, or Agent30 derivations.
