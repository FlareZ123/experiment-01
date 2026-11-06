# Agent50 preregistration: identical-rank4 replay on original rank4/rank1 seed cohort

**Registered 6 November 2026 before implementation.** This is a same-seed deck-composition control for the earlier rank4/rank1 shuffle-protocol contrast.

## Question

The original rank4/rank1 cohort used 32 fixed seeds and balanced source-seat assignments. Under the legacy shared stream it recorded mulligan totals seat0=8 / seat1=0; under Agent26 per-seat setup streams it recorded seat0=6 / seat1=7. A separate identical-rank4 cohort on new seeds did not reproduce a general seat bias (legacy5/8, per-seat3/4).

This control reuses the **exact original rank4/rank1 seeds and source-seat assignments**, but puts the same rank4 deck in both seats. It isolates the one-Basic deck-composition difference while holding seed and seat assignment fixed.

## Frozen inputs and protocol

- Both seats use the original Aichi rank4 60-card list, SHA-256 `3f82c3a7c43d62979ea2196b74bffd22fc51d6e7cc11cc27be9daad10d02b423`.
- Twinleaf pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Reuse the exact 32 seeds and 16/16 source-seat assignment below, from the original [rank4/rank1 preregistration](agent50-rank4-dedechange-natural32-sourcefirst-20261106.md).
- Run two arms for each seed/seat pair:
  1. Legacy shared seeded `Math.random` stream.
  2. Agent26 per-seat turn-zero setup-shuffle adapter, salts `0x243f6a88` / `0x85a308d3`.
- The two arms share seed/seat but generate different physical permutations; this is not a same-deal counterfactual.
- Preserve the same source-first choice, owner entry-priority Active policy, optional min-zero Bench decline, public mulligan acknowledgements, actor-only SelectPrompt default, and fail-closed first-source-root quarantine.
- No Dedechange hook. Capture both players' `ShowMulliganPrompt.hands.length`, actual compensation prompt owner/draw amount, exact compensation `CardList.moveTo` movement/card identity, and both seats' shuffle tapes.
- Keep all equal-mulligan/no-compensation rows.
- No completed games or win-rate claims.

## Fixed seed/seat pairs

| Trial | Source/first seat | Original rank4/rank1 seed |
|---:|---:|---:|
| 1 | 0 | 633372073 |
| 2 | 1 | 86623464 |
| 3 | 0 | 3741635901 |
| 4 | 1 | 3937313210 |
| 5 | 0 | 3935354425 |
| 6 | 1 | 469693129 |
| 7 | 0 | 3112483819 |
| 8 | 1 | 4036501400 |
| 9 | 0 | 1618181490 |
| 10 | 1 | 3127876404 |
| 11 | 0 | 358071138 |
| 12 | 1 | 246568075 |
| 13 | 0 | 614184015 |
| 14 | 1 | 3658443122 |
| 15 | 0 | 988546863 |
| 16 | 1 | 3425622581 |
| 17 | 0 | 659596847 |
| 18 | 1 | 3374395305 |
| 19 | 0 | 3767656280 |
| 20 | 1 | 1334448369 |
| 21 | 0 | 1015114065 |
| 22 | 1 | 2721212630 |
| 23 | 0 | 3093975646 |
| 24 | 1 | 3866265543 |
| 25 | 0 | 3156942071 |
| 26 | 1 | 2011905764 |
| 27 | 0 | 1103482661 |
| 28 | 1 | 795422078 |
| 29 | 0 | 1285175489 |
| 30 | 1 | 3644145136 |
| 31 | 0 | 166706843 |
| 32 | 1 | 3879134323 |

## Primary analysis

1. Compare per-seat mulligan totals and exact `(seat0, seat1)` mulligan-count pairs between legacy and per-seat protocols.
2. Determine whether the legacy rank4/rank1 8/0 split persists when both seats use rank4 on the exact same seeds.
3. Compare the per-seat arm with the original rank4/rank1 per-seat arm to assess whether deck composition changes the direction or magnitude of mulligan asymmetry.
4. Verify every compensation recipient is the lower-mulligan seat and selected draw amount equals the difference; verify exact physical card movement.
5. Preserve shuffle protocol labels and avoid treating seed-matched protocol arms as identical deals.

## Interpretation limits

This is a targeted same-seed composition control, not a general PRNG quality test. The Agent26 adapter is a deterministic per-seat approximation, not proven paper-exact. A separate comparison against built-in `runMatch({isolatePhysicalShuffleRandomness:true})` remains desirable.
