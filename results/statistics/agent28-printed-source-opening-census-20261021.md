# Aichi Top 32: independently print-validated opening Basic census

**Agent 28, 21 October 2026.** Scope: **29 published, exact ranked 60-card source decks**, missing official ranks **23, 25, 28**. This is a rules/combinatorics cross-check, **not** new game-performance evidence or evidence of the aspirational 99.5% target.

## Why this verification exists

The existing [name-based opening audit](../../scripts/aichi_opening_audit.cjs) already estimates Basic counts and mulligan probabilities. This independently audits the same 29 source lists from **exact English card printings** in the local set/card database. It fails closed when a set, printed number, printed name, or Pokémon stage cannot be resolved and distinguishes Mega Pokémon printed as Basic versus Evolution. Promo number prefixes and alternate Prism Star glyphs are explicitly normalized. It also calculates the probability of a solitary Basic **conditional on the first valid seven**, an opening exposure previously studied in [the Meloetta solo audit](../../scripts/aichi_solo_start.cjs).

- Reproducer: [`scripts/aichi-opening-basics.cjs`](../../scripts/aichi-opening-basics.cjs), with [four regression tests](../../tests/aichi-opening-basics.test.cjs).
- [Compiled manual CI success 39618029025](https://github.com/FlareZ123/experiment-01/actions/runs/39618029025), engine not needed. Code at `2f2d80a3b4c7c2003970a13d809ea6e8a23a0dc4`; Node 22.23.3; all four new tests passed and the existing larger opening-audit workflow passed.
- Archived artifact ID **12352529791**, ZIP SHA-256 `b72eb11cf56ea51deb92ff0b9f922ed117d7cd4352e3afa38d6d731376482f5a`. Inner `aichi-printed-opening-basics.json` SHA-256 `2f1704b54c1271ccc317a87d5739b459eaf65ff1890ed57deba55d8868642a49`. The JSON contains **29 rank rows and 102 distinct checked printings**.
- Earlier CI **39617841826** correctly caught an unnormalized source `Ditto ♢` versus database `Ditto ◇`; fix `2f2d80a3`, then native source corpus passed. Archive the failure as a regression witness, not an opponent-deck problem.

## Combinatorial definitions

For a 60-card deck containing `b` Basic Pokémon, before mulligans and before Prize setting:

```text
P(no Basic in seven)            = C(60-b,7) / C(60,7)
P(exactly one Basic | valid 7)  = b*C(60-b,6) / [C(60,7)-C(60-b,7)]
E(failed redraws before valid)  = C(60-b,7) / [C(60,7)-C(60-b,7)]
```

All binomial coefficients are computed as exact `BigInt` integers before ratios are converted to floating-point. The original seven-card setup may contain at most five freely selected Benched Basics; the sole-Basic statistic assumes no other setup effects or optional bonus draws. It is a board-exposure condition, **not** a predicted donk, game loss, or evaluation of player strategy.

## Full published field check

| Rank | Deck | Basic count | Initial mulligan | One Basic given valid seven |
| ---: | --- | ---: | ---: | ---: |
| 1 | Shadow Rider Calyrex | 14 | 13.859% | 39.418% |
| 2 | Vileplume Control | 14 | 13.859% | 39.418% |
| 3 | Snorlax Stall | 11 | 22.242% | 51.222% |
| 4 | Raichu Electrode | 13 | 16.284% | 43.174% |
| 5 | Mew Genesect | 11 | 22.242% | 51.222% |
| 6 | Iron Thorns | 4 | **60.050%** | **84.175%** |
| 7 | Snorlax Stall | 12 | 19.065% | 47.111% |
| 8 | Absol Garbodor | 10 | 25.863% | 55.499% |
| 9 | Absol Electrode | 11 | 22.242% | 51.222% |
| 10 | Regidrago | 15 | 11.750% | 35.847% |
| 11 | Absol Garbodor | 11 | 22.242% | 51.222% |
| 12 | Regidrago | 15 | 11.750% | 35.847% |
| 13 | Regidrago | 11 | 22.242% | 51.222% |
| 14 | Regidrago | 14 | 13.859% | 39.418% |
| 15 | Lopunny Vileplume | 14 | 13.859% | 39.418% |
| 16 | Absol Garbodor | 11 | 22.242% | 51.222% |
| 17 | Raichu Electrode | 13 | 16.284% | 43.174% |
| 18 | Regidrago | 16 | 9.922% | 32.466% |
| 19 | Raging Bolt | 16 | 9.922% | 32.466% |
| 20 | Regidrago | 14 | 13.859% | 39.418% |
| 21 | Regidrago | 14 | 13.859% | 39.418% |
| 22 | Absol Garbodor | 12 | 19.065% | 47.111% |
| 24 | Iron Thorns | 4 | **60.050%** | **84.175%** |
| 26 | Meloetta Donk | 12 | 19.065% | 47.111% |
| 27 | Regidrago | 15 | 11.750% | 35.847% |
| 29 | Iron Thorns | 4 | **60.050%** | **84.175%** |
| 30 | Lillie's Clefairy | 16 | 9.922% | 32.466% |
| 31 | Dusknoir Chimecho | 15 | 11.750% | 35.847% |
| 32 | Regidrago | 13 | 16.284% | 43.174% |

### Interpretation and next useful test

Ranks 6, 24 and 29 are the **only** documented source lists with four Basics and the only ones above a 30% initial mulligan rate; all four are Iron Thorns ex. The 60.050% / 84.175% figures match the historical opening audit, now independently verified via each actual Pokémon printing.

Game-state inference requires modeling simultaneous mulligans, optional bonus draws, Bench choices, Prize locations, pre-attack search, legal turn order, Ability/Item lock and whether the candidate can actually KO the exposed Active. The existing [`scripts/aichi_solo_start.cjs`](../../scripts/aichi_solo_start.cjs) already incorporates the first two; avoid adding initial and post-bonus probabilities as independent opportunities. An eventual policy benchmark should preserve **all** source deals and rank weights, including cases with extra Basics drawn and source players declining to Bench.

This audit changes no candidate 60, establishes no game win, and supplies no basis for the 99.5% claim.
