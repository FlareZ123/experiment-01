# Original rank13 Regidrago: exact Treasure donor-to-VSTAR opening and Prize access

**Agent 8 | 3 November 2026 | Exact two-stage combinatorics, not game outcomes**

## The newly exposed resource route

The preceding [rank13 joint opening resource census](agent8-rank13-compressor-vstar-opening-conjunction-20261103.md) measured a deliberately narrow opening screen: Regidrago V + held VSTAR + (Battle Compressor OR Quick Ball with an evolved Dragon donor) + a nominal two-attachment Energy package. Its exact frequency among Basic-valid physical seven-card hands was **751,044 / 300,306,336 = 0.250092625%**. That study explicitly excluded other search and discard connectors.

The [new genuine native owner-root evidence](agent8-funded-apex-compressor-owner-gate-null-20261103.md) shows the original rank13 source used **Mysterious Treasure FLI** to discard a Dragon attack donor and physically retrieve a valuable Pokémon, in one case **Regidrago VSTAR**. This is a two-axis card action. The attached source's four Treasure copies deserve an explicit opening model. The supplied card pool confirms that Treasure discards one card, then searches for Psychic or Dragon Pokémon, and that Regidrago VSTAR is Dragon. Double Dragon Energy provides two units of any types when attached to a Dragon Pokémon.

## Exact model

The original rank13 60 contains 11 Basics, of which four are Regidrago V; five copyable Dragon donors are two Basics (Dialga-GX, Kyurem) and three evolved Pokémon (Salamence ex, Dragapult ex, Noivern ex). It has three Regidrago VSTAR, four Mysterious Treasure, two Battle Compressor, three Quick Ball, three Double Dragon Energy, four basic Grass and three basic Fire Energy.

We condition on Basic-valid seven-card openings: `C(60,7)-C(49,7) = 300,306,336` equiprobable unordered hands. Given a physical hand, the six face-down Prizes are a uniform subset of the remaining 53 cards: `C(53,6) = 22,957,480`. The joint hand-plus-Prize denominator is **6,894,276,702,593,280**. Opponent mulligan compensation, setup decisions and future draws are outside this static experiment.

An initial **two-attachment Energy package** requires either at least two Double Dragon Energy cards or at least one Double Dragon Energy plus a basic Grass or Fire Energy. It can nominally supply Grass/Grass/Fire through two ordinary hand attachments to a Dragon Pokémon. It is sensitive to actual later suppressing effects.

Two intentionally incomplete opening-access predicates are counted:

- **A, previous strict screen:** hold Regidrago V and VSTAR, with held Battle Compressor or held Quick Ball + one of three evolved Dragon donors. The prior screen does not certify that a Compressor target survived Prizes.
- **B, explicit Treasure→VSTAR search:** hold Regidrago V, Mysterious Treasure and one of **five** Dragon donors as the paid discard, with at least one Regidrago VSTAR **still in the searchable deck after all six Prizes**. This extra deck-target requirement is intentionally conservative: if all VSTAR copies are in hand or Prizes, other useful Treasure search plays may exist, but they are excluded from B.

If `h` VSTAR cards are in the seven and `r=3-h` remain among 53, the number of Prize selections retaining at least one searchable VSTAR is `C(53,6)-C(53-r,6-r)` when `r>0`, otherwise zero. The probability is conditioned on each exact hand composition, so Prize viability is not incorrectly treated as an independent constant.

## Exact physical counts

| Predicate, with same original 60 | Favorable hand-plus-Prize combinations | Share of Basic-valid hand-plus-Prize deals |
| --- | ---: | ---: |
| A without Energy condition | 222,389,430,164,720 | **3.225710829%** |
| B without Energy condition | 500,212,818,194,880 | **7.255479288%** |
| A or B without Energy condition | 699,498,519,749,120 | **10.146075505%** |
| Intersection A and B | 23,103,728,610,480 | 0.335114612% |
| A **with two-attachment Energy** | 17,242,077,609,120 | **0.250092625%** |
| B **with two-attachment Energy** | 44,819,058,849,600 | **0.650090804%** |
| **A or B with two-attachment Energy** | **61,564,112,947,680** | **0.892974210%** |
| Intersection A and B with Energy | 497,023,511,040 | 0.007209219% |

Exact inclusion-exclusion check for the colored-Energy conjunction:

`17,242,077,609,120 + 44,819,058,849,600 - 497,023,511,040 = 61,564,112,947,680`.

Before checking Prizes, B with the Energy package appears in **1,957,040** Basic-valid seven-card hands, **0.651681222%**. After the VSTAR-in-deck check, its joint frequency becomes **0.650090804%**. Conditional VSTAR-in-deck viability within this exact B/Energy opening screen is **99.755951556%**. In particular, when all VSTAR copies were drawn in the opening hand, there is no VSTAR left for the specified search, although the player could evolve from the hand instead.

The expanded A-or-B Energy resource screen is about **3.57 times** the older narrow A screen, owing to the previously excluded Mysterious Treasure route. This ratio measures static **resource-path coverage**, and cannot be converted into early Apex attack probability or game strength.

## Reproducible calculation

[Source-verified BigInt combinatorial DP](../../simulation/evaluation/agent8-rank13-treasure-vstar-prize-dp.cjs) partitions the unchanged rank13 original 60 into twelve exact physical categories, enumerates **27,050** seven-card category-count vectors with exact binomial weights, and correctly marginalizes the six Prizes conditional on each hand. [Regression tests](../../tests/agent8-rank13-treasure-vstar-prize-dp.test.cjs) assert the original 60, earlier A counts, every B and union count, Prize denominator and inclusion-exclusion. Existing manual-only CI [41710581206](https://github.com/FlareZ123/experiment-01/actions/runs/41710581206) passed all pure checks.

This fixes an **omission in the earlier analytical coverage**, without declaring the earlier narrow event mathematically incorrect. The native historical Treasure receipt proves that a donor discard plus a useful Pokémon retrieval can settle physically. Connector costs, alternative target searches, discarding protected Dragons, deck locks, evolution timing, genuine Bench requirements, 2-turn attachment scheduling, Special Energy suppression, opponent decisions and the match clock remain unmodeled. A is still a physical possibility rather than fully Prize-validated game line; B certifies only the stated VSTAR target and donor payment availability. No win rate or optimal deck swap follows from these opening hands.

**Field objective remains open:** 29/32 authenticated original source sixties, no fixed final deck, zero competitively qualified games, and no demonstrated 99.5% field win rate.
