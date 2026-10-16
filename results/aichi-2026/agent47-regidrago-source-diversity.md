# Agent 47: nine published Regidrago inventories share 34 slots

**16 October 2026.** Source: [29 printing-aware published Aichi lists](full-decklists.json), filtered to Regidrago ranks **10, 12, 13, 14, 18, 20, 21, 27, 32**. The two other Top 32 Regidrago ranks, 23 and 28, have no published complete list. Evidence class: exact inventory arithmetic, **not** game outcomes or card-interaction proof.

## Calculation

For each card name `c` and the nine 60-card source lists `D_i`, define the mandatory name-level core multiplicity `m(c)=min_i count(D_i,c)`. Exactly **20 card names** appear in all nine lists, and their minimum counts sum to **34 of 60 card slots**. Each of those core names has the **same displayed printing** throughout the nine source lists, including Pokémon printings, not merely a coincident name.

The core includes Regidrago V (at least 3), Regidrago VSTAR (3), Budew (at least 1), Dragapult ex (1), Dialga-GX (1), Kyurem (1), Dedenne-GX (1), Tapu Lele-GX (1), Latias ex (1), Guzma (2), Raihan (1), Quick Ball (3), Mysterious Treasure (3), VS Seeker (2), Hisuian Heavy Ball (1), Super Rod (1), Muscle Band (1), Double Dragon Energy (3), Grass Energy (2), and Fire Energy (2).

The remaining cards vary. The table counts **decks containing** each optional card, rather than summed copies.

| Optional name | Published Regidrago lists containing it (of nine) |
| --- | ---: |
| Noivern ex | 7 |
| Hisuian Goodra VSTAR | 5 |
| Koraidon ex | 5 |
| Path to the Peak | 4 |
| Mega Dragonite ex | 3 |
| Battle VIP Pass | 3 |
| Megaton Blower | 6 |
| Pokémon Ranger | 2 |
| Wobbuffet | 2 |
| Silent Lab | 2 |
| Faba | 1 |
| Stealthy Hood | 1 |

For two 60-card lists `A` and `B`, define name-changing slot distance `d(A,B) = sum_c |count(A,c)-count(B,c)|/2`. The **36 unordered Regidrago pairs** have mean distance **12.916667 slots**, minimum **6** (ranks 12 and 27) and maximum **21** (ranks 18 and 32). The core's 34 shared slots therefore coexist with substantial variation in the remaining slots.

## Implication and limits

The nine available Regidrago lists all contain the Regidrago/Budew/Dragapult/Dialga/Kyurem backbone and the noted search/energy channels. A candidate policy tested against rank 10 alone has **not** established coverage for Noivern ex, Goodra, Mega Dragonite, Pokémon Ranger, or the variations in Stadium and Tool interactions. Set up dedicated adversarial response fixtures spanning these differences.

Under equal placement weighting, the [target loss-budget arithmetic](agent47-field-loss-budget.md) requires at least **98.545455% mean game wins across all eleven Regidrago ranks**, even if every other opponent rank were a guaranteed win. This is a necessary arithmetic constraint, and no such win rate has been measured.

Reproduction: read `results/aichi-2026/full-decklists.json`, select decks whose `archetype` equals `Regidrago`, aggregate `cards[].count` by `cards[].name`, compute column minima and pairwise half-L1 distances. Distinguish name-level inventory distance from functional matchup similarity; source-language and legality checks still apply.
