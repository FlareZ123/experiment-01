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


## Exact minimum name-coverage panel after rank-10 replay (17 October 2026)

For *experiment scheduling only*, exhaustive enumeration of all **256** subsets of the nine published Regidrago lists containing rank **10** gives a small reproducible source-inventory coverage frontier. This is a set-cover diagnostic over displayed card names and has **no game-policy or effect-coverage interpretation**. The program and tests are [the name-panel enumerator](../../scripts/aichi-regidrago-coverage-panel.cjs) and [its regressions](../../tests/aichi-regidrago-coverage-panel.test.cjs).

| Number of lists including rank 10 | Best representative rank panel | Distinct names covered / 60 | Names still unseen |
| ---: | --- | ---: | ---: |
| 1 | 10 | 36 | 24 |
| 2 | 10, 32 | 49 | 11 |
| 3 | 10, 27, 32 | 53 | 7 |
| 4 | 10, 14, 27, 32 | 56 | 4 |
| 5 | 10, 14, 20, 27, 32 | 58 | 2 |
| 6 | 10, 13, 14, 20, 27, 32 | 59 | 1 |
| 7 | 10, 13, 14, 18, 20, 27, 32 | 60 | 0 |

The four-list optimum ties with one other panel on total name coverage. Tie-breaking prefers coverage of single-occurrence names and then ascending rank order. All **60** name identities have a unique printing in these nine exact source inventories, with **20 names / 34 compulsory copies** in common. The 60 names comprise 23 Pokémon, 34 Trainer and three Energy names.

An immediate implication for the source-ranked evidence campaign: rank-10 alone exposes **36/60** Regidrago card names. A later distinct-opponent replay against rank **32** could cover **13 additional identities**, including **Noivern ex, Mega Dragonite ex, Pokémon Ranger, Silent Lab and Stealthy Hood**; rank **27** then adds another four distinct names. This is a **research-test candidate ordering**, contingent on completing the Critic's current rank-10 decision-and-response, rank-2 and rank-6 qualification priorities. Testing seven decks for name coverage does not mean every card is played, every mechanic is exercised, or the two unpublished Regidrago ranks 23/28 are represented. A single rare but decisive interaction may be more important than many otherwise inert names.

Exact arithmetic was checked against the live source manifest using independent exhaustive in-session enumeration. The committed Node tests and any workflow confirmation remain separately identifiable; no engine match, matchup win or 99.5% certificate is produced by this study.
