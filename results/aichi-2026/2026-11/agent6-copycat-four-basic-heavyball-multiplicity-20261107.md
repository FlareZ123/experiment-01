# Agent 6: four-Basic Copycat Heavy Ball multiplicity sensitivity

**Date:** 7 November 2026  
**Evidence class:** exact finite combinatorics, optimistic necessary-condition bound  
**Deck source:** Aichi Open League 2026 published rank 1, unchanged 60-card list

## Question

How much does increasing the rank-1 list's single Hisuian Heavy Ball copy reduce the Prize-only obstruction to the four-Basic Mimikyu Copycat response package?

The package requires four Basic roles to be available: Mimikyu, Dialga-GX, Radiant Eternatus, and at least one Lillie's Clefairy ex. The published rank-1 list has one copy of each singleton role, two Clefairy ex, nine other Basic Pokémon, and one Hisuian Heavy Ball. This is 14 Basics and 46 non-Basics in 60 cards.

## Exact model

The enumerator considers all six-Prize compositions across these groups:

- Mimikyu: 1 copy
- Dialga-GX: 1 copy
- Radiant Eternatus: 1 copy
- Lillie's Clefairy ex: 2 copies, with either copy satisfying the role
- Other Basics: 9 copies
- Hisuian Heavy Ball: 1, 2, or 3 copies
- Other non-Basics: the remainder needed to keep 60 cards

For each Prize composition, it weights that composition by the number of seven-card opening hands from the remaining 54 cards that contain at least one Basic Pokémon. A role is Prize-missing only when every copy of that role is in the six Prizes. Each Heavy Ball not prized is optimistically counted as one recovery for one missing role. The Prize-only obstruction occurs when the number of missing roles exceeds the number of unprized Heavy Balls.

The denominator is the same across all variants: 7,637,545,871,155,200 legal Prize/starting-hand combinations. The calculation is exact integer combinatorics, not Monte Carlo.

## Results

| Heavy Ball copies | Other non-Basics | Prize-only obstruction | 11/32 field-weighted contribution* | Reduction vs 1 copy |
|---:|---:|---:|---:|---:|
| 1 | 45 | 4.6811456582% | 1.6091438200 percentage points | 1.00x |
| 2 | 44 | 0.5474454531% | 0.1881843745 percentage points | 8.55x |
| 3 | 43 | 0.0440741415% | 0.0151504862 percentage points | 106.21x |

Exact fractions:

| Heavy Ball copies | Prize-only obstruction | Field-weighted contribution |
|---:|---:|---:|
| 1 | 11,638,172,101 / 248,618,029,660 | 11,638,172,101 / 723,252,449,920 |
| 2 | 16,751,361,217 / 3,059,914,211,200 | 16,751,361,217 / 8,901,568,614,400 |
| 3 | 841,545,694,289 / 1,909,386,467,788,800 | 841,545,694,289 / 5,554,578,815,385,600 |

*The field-weighted column multiplies the Prize-only obstruction by 11/32, assuming all 11 Regidrago lists have this same obstruction rate and every obstruction becomes a loss. It is a deliberately pessimistic scenario, not a matchup estimate.

The 1x result exactly reproduces Agent 46's published four-Basic baseline of 4.6811456582%. A second Heavy Ball lowers the modeled obstruction to 0.5474454531%, and its hypothetical field contribution to 0.1881843745 percentage points. A third copy lowers the obstruction further, with diminishing practical justification because it consumes another deck slot.


## One-slot role-copy comparison

I also compared adding one copy of a single required Basic role instead of adding a second Heavy Ball. Each variant replaces one other non-Basic card and keeps the deck at 60 cards.

| One-slot change | Prize-only obstruction | 11/32 field-weighted contribution |
|---|---:|---:|
| 2x Mimikyu | 2.6789522745% | 0.9208898443 percentage points |
| 2x Dialga-GX | 2.6789522745% | 0.9208898443 percentage points |
| 2x Radiant Eternatus | 2.6789522745% | 0.9208898443 percentage points |
| 3x Lillie's Clefairy ex | 4.5291890682% | 1.5569087422 percentage points |
| 2x Hisuian Heavy Ball | **0.5474454531%** | **0.1881843745 percentage points** |

Under this narrowly defined Prize-only metric, a second Heavy Ball is more effective than one extra copy of any single required Basic role. The model does not capture the additional benefits a duplicate Basic might provide through ordinary draw, search, or having Mimikyu available to promote, so this is not a general card-strength ranking.

## Interpretation

The single-copy package's modeled Prize-only obstruction would exceed the entire 0.5% aggregate loss budget if every such obstruction were a loss across the 11/32 Regidrago field share. The 2x Heavy Ball scenario brings this particular hypothetical contribution below 0.5 percentage points.

This makes a second Heavy Ball a **worthwhile structural variant to test**, especially because it addresses simultaneous Prize-missing roles. It is not yet a deck recommendation. The second copy must replace another non-Basic card, and the opportunity cost of that cut has not been tested. Three copies are a sensitivity bound, not a recommendation.

## Limitations

This is only a Prize-composition obstruction bound.

- Every unprized Heavy Ball is treated as immediately available and usable, even though the model does not require drawing or playing it.
- It does not model search, hand access, discard sequencing, Mimikyu being Active, Energy payment, the opponent's Apex Dragon timing, Fairy Zone suppression, or opponent responses.
- It does not count other ways to access a prized role.
- It does not estimate how often the full Copycat line occurs, how often it wins a game, or the win rate of any deck.
- The field-weighted scenario assumes the same obstruction rate in every Regidrago list and assumes every obstruction is a loss.

The four-Basic line and the policy that executes it still require natural-game validation. The first four-run default-opponent pilot did not provide a Copycat opportunity; a separate exposure-selected follow-up is being run with a stronger Regidrago setup policy.

## Reproduction

- Enumerator: `simulation/evaluation/agent6-copycat-four-basic-heavyball-multiplicity.cjs`
- Tests: `tests/agent6-copycat-four-basic-heavyball-multiplicity.test.cjs`
- Run: `node --test tests/agent6-copycat-four-basic-heavyball-multiplicity.test.cjs`
- Base cross-check: `results/methodology/agent46-champion-four-basic-heavyball-legal-opening-prize-frontier-20261107.md`
- Related two-core multiplicity analysis: `results/aichi-2026/2026-11/agent21-copycat-prize-access-multiplicity-sensitivity-20261107.md`

No change is made to the nominated deck or the public best-deck index. This result supports a controlled 2x Heavy Ball slot experiment only.
