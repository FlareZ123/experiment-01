# Original 29-deck multi-name Stadium exposure: exact seven-card census

**Agent 26 | 6 November 2026 | paper Expanded | observational card-composition mathematics only.**

## Question and finding

The pinned Twinleaf `ActionEnumerator.playStadiumActions()` omits every owner-held Stadium candidate whenever that owner already has a Stadium in play. The paper rulebook I.B-04 permits a different-name Stadium to replace the one in play if the once-per-turn Stadium quota and other conditions allow it. Agent7 and Agent5 independently established real original-source missed-Stadium Pass states, including original ranks 5, 6 and 9. The present study asks how many of the **29 authenticated original Aichi Top 32 name/count sixties** have more than one Stadium name and computes a strictly descriptive random-opening chance of holding two different Stadium names.

**Result: 18/29 originals (62.07%) contain two or more distinct Stadium names.** Eleven contain only one Stadium name. All 29 have at least one Stadium. A field-uniform, unconditional random seven-card hand has a mean **1.69730%** chance of holding at least two different Stadium names across these 29 originals. This mean is a deck-composition diagnostic, not the probability of a paper-playable action, or of a good one.

Source inventory: [29 original 60s](../aichi-2026/full-decklists.json), with [29/32 original-source admission limits](../aichi-2026/original-source-admission-matrix-20261102.md). Stadium subtypes come from the supplied local [card archive](../../resources/cards/en/) rather than guessing from card-name strings; the parser equates the two observed Prism Star diamond glyphs and groups distinct printings by *name*. Exact executable computation: [source](../../scripts/agent26-field-stadium-multi-name-census.cjs) and [pure regressions](../../tests/agent26-field-stadium-multi-name-census.test.cjs). The existing manual [Agent26 original-Stadium workflow](../../.github/workflows/agent26-skyfield-owner-native.yml) now includes the exact-census test; [dispatched native workflow 42194187232](https://github.com/FlareZ123/experiment-01/actions/runs/42194187232).

## Exact seven-card model and inspected rows

Let the distinct Stadium-name copy counts in a 60-card deck be `c_1, ..., c_k`, and `s = sum(c_i)`. The number of seven-card combinations containing **zero or exactly one** Stadium name is

`C(60-s,7) + sum_i [C(60-s+c_i,7) - C(60-s,7)]`.

The complementary count divided by `C(60,7) = 386,206,920` gives the exact probability of at least two distinct Stadium names. The script uses integer `BigInt` arithmetic for the numerators and denominator; percentages are display approximations. Draws are uniform without replacement from the complete 60.

| Rank | Archetype | Stadium copies by name | Exact 7-card chance |
| ---: | --- | --- | ---: |
| 1 | Shadow Rider | 2 Sky Field, 1 Dimension Valley | 2.2706% |
| 2 | Vileplume Control | 2 Artazon, 1 Grand Tree | 2.2706% |
| 3 | Snorlax Stall | 1 Tropical Beach, 1 Temple of Sinnoh | 1.1864% |
| 5 | Mew/Genesect | 2 Sky Field, 2 Path to the Peak | 4.3438% |
| 6 | Iron Thorns | 1 Tropical Beach, 1 Thunder Mountain ◇, 1 Wondrous Labyrinth ◇ | 3.3548% |
| 7 | Snorlax Stall | 2 Chaotic Swell, 1 Artazon | 2.2706% |
| 9 | Absol/Electrode | 2 Silent Lab, 1 Path to the Peak, 1 PokéStop | 5.3329% |
| 11 | Absol/Garbodor | 2 Shopping Center, 2 Temple of Sinnoh | 4.3438% |
| 12, 20, 21, 27 | Regidrago | 1 Path to the Peak, 1 Parallel City (order varies) | 1.1864% each |
| 13, 32 | Regidrago | 1 Silent Lab, 1 Parallel City (order varies) | 1.1864% each |
| 15 | Lopunny/Vileplume | 2 Artazon, 1 Grand Tree, 1 Path to the Peak, 1 Silent Lab | **9.0242%** |
| 24 | Iron Thorns | 1 Thunder Mountain ◇, 1 Wondrous Labyrinth ◇ | 1.1864% |
| 29 | Iron Thorns | 2 Tropical Beach, 1 Thunder Mountain ◇, 1 Wondrous Labyrinth ◇ | 5.3329% |
| 31 | Dusknoir/Chimecho | 1 PokéStop, 1 Grand Tree | 1.1864% |

The **single-name** ranks are 4, 8, 10, 14, 16, 17, 18, 19, 22, 26, 30. Their probability of two *distinct* Stadium names in seven cards is exactly zero under this metric. Every audited source deck has exactly 60 cards.

## Why this matters and what it does not measure

The bug's potential reach is considerably wider than the first two original physical Stadium-miss witnesses. Multi-name source inventories allow legal replacement interactions whenever they physically hold a differently named Stadium, retain the Stadium-play quota, and face no relevant restriction. The exact names are important: `Grand Tree` is an ACE SPEC Stadium, while `Thunder Mountain ◇` and `Wondrous Labyrinth ◇` require Prism Star Lost Zone handling on replacement. One name may be strategically preferred to keep in play, and changing the Stadium may harm the owner's own attack or lock line.

**The 7-card event is neither necessary nor sufficient for a real missed owner action.** A deck can draw its second Stadium on a later turn; conversely, two different Stadiums in the opening hand do not establish an existing own Stadium, a permitted Stadium play on a later root, or a beneficial replacement. These are *unconditional* seven-card combinations, prior to Basic-Pokémon mulligan conditioning, setup choices, Prize separation, first-turn limitations, drawing, searching, disruption and actual Store decisions. The 29 decks are the **known 29**, not a substitute for missing ranks **23, 25 and 28**.

## Decision implication

The common two-seat trainer policy should independently enumerate owner-held **different-name Stadium replacements** from real owner hand plus public Stadium/turn resources. It should not treat the pinned native enumerator as a legality oracle or silently turn an eligible replacement into a forced strategic move. A single owner-safe generic correction covers a **class present in 18 authentic source sixties** and deserves prospective testing in the shared developmental policy. Start with known original-source Stadium opportunities (rank5 Path→Sky Field, rank6 Wondrous Labyrinth→Thunder Mountain and rank9 PokéStop→Silent Lab), then require actual Store acceptance, exact displaced Stadium destination, owner payment/lock checks, counterfactual opportunity cost, and opponent response.

**Qualification:** card inventory plus exact combinatorial arithmetic. No new native action or full-game outcome was measured by this census; historical native witnesses are separate. Selected Issue25 v4 remains unqualified, **zero competitively qualified games**, no selected final fixed 60, and no demonstrated 99.5% benchmark performance.
