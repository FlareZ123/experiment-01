# Nine published Regidrago lists: first-draw Dragon-payload discard access

**Agent 20, 20 October 2026.** Exact, source-printing-counted combinatorial analysis of two narrowly defined ways to move singleton **Dragapult ex TWM** into the discard by the first ordinary draw. This quantifies a resource-access bottleneck motivated by the actual [rank-10 Mysterious Treasure discard fork](../twinleaf/rank10-early-dragapult-root-discard-fork.md) and [root133 Apex copy-payload failure](../twinleaf/dde-root133-apex-copy-payload-bottleneck.md). It **does not** demonstrate playability, attack conversion, a match outcome, or the relative strength of any fixed-60 candidate.

## Frozen input and modeled chronology

Original printed Aichi 2026 source 60s at ranks **10, 12, 13, 14, 18, 20, 21, 27, 32** from [full-decklists.json](full-decklists.json); independently verified Basic counts from [opening-hand-audit.json](opening-hand-audit.json). Each list has one Dragapult ex, three or four Mysterious Treasure, three or four Quick Ball, and zero, one or two Battle Compressor.

Random physical sequence: **seven initial cards** with at least one Basic, **six inaccessible Prize cards**, then **one normal draw**. Opponent mulligan bonus, repeated turns, extra draws, deck search, and any already played/discarded cards are excluded. The first eight accessible cards are the hand's initial seven plus the normal draw, so the Prize step is modeled between them.

Two **disjoint** restricted routes are counted:

1. **Hand-to-discard:** Dragapult is in those eight accessible cards, with a Mysterious Treasure or Quick Ball also in those eight. Each search Item has a single-card discard cost. The table also isolates *Mysterious Treasure only*, reproducing the previous rank-10 narrow count.
2. **Deck-to-discard:** Dragapult is *not* in those eight cards and *not* among six Prizes, while at least one Battle Compressor is in those eight cards. Dragapult can then be selected from the remaining deck by Compressor in an Item-permitted, otherwise appropriate state.

These are physical location and nominal printed-effect opportunities. The calculation assumes none of these cards has been consumed and does not attest a usable Item under lock, a prudent discard, another card searched as part of an Item effect, a sufficiently developed Regidrago, adequate Energy, open Bench slots, or an eventual copied attack. Other legitimate routes (Ultra Ball, PokéStop, card draw, re-search, recovery and future turns) are deliberately omitted. The union is **neither a global upper bound nor a lower bound on successful gameplay**.

## Exact result, conditional on a Basic-valid initial seven

| Published rank | Basics | Treasure | Quick Ball | Compressor | Treasure + Dragapult | Any one-card Ball + Dragapult | Deck Compressor + unprized Dragapult | Union of the two modeled routes |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 15 | 3 | 3 | 1 | 3.92335% | 6.78689% | 10.06931% | **16.85620%** |
| 12 | 15 | 4 | 4 | 0 | 4.98259% | 8.22938% | 0% | **8.22938%** |
| 13 | 11 | 4 | 3 | 2 | 4.81250% | 7.31464% | 18.71916% | **26.03380%** |
| 14 | 14 | 4 | 4 | 1 | 4.94274% | 8.17165% | 10.03412% | **18.20577%** |
| 18 | 16 | 4 | 3 | 0 | 5.02055% | 7.60132% | 0% | **7.60132%** |
| 20 | 14 | 3 | 4 | 1 | 3.89094% | 7.49462% | 10.03412% | **17.52874%** |
| 21 | 14 | 4 | 4 | 1 | 4.94274% | 8.17165% | 10.03412% | **18.20577%** |
| 27 | 15 | 4 | 4 | 1 | 4.98259% | 8.22938% | 10.06931% | **18.29869%** |
| 32 | 13 | 3 | 4 | 1 | 3.85707% | 7.43718% | 9.99685% | **17.43403%** |
| **Equal-rank mean** | | | | | **4.59501%** | **7.71519%** | **8.77300%** | **16.48819%** |

The rank-10 Mysterious-Treasure-only numerator reproduces the earlier independent **3.9233469367%** calculation. Rank 13's two Battle Compressor copies make its narrow Compressor opportunity larger, conditional on the precise list's fewer Basic Pokémon. Ranks 12/18 lack Compressor entirely, so their restricted deck-to-discard channel is zero; other routes remain available.

## Exact enumeration and Prize adjustment

The [reusable BigInt script](../../scripts/aichi-regidrago-dragapult-opening.cjs) enumerates disjoint **Basic / singleton Dragapult / one-discard searcher / Compressor / remaining** categories in the seven-card hand and the first ordinary draw. It excludes initial hands with zero Basics. For an eight-card observation with Dragapult absent, its conditional probability of being **in the deck rather than among the already placed six Prizes** is exactly **46/52**, because the Dragon must occupy one of the 52 remaining physical positions after the eight observed cards, six of which are Prize positions. The exact rational denominator incorporates the full opening-validity conditioning.

The independent [ordered-physical-deal tests](../../tests/aichi-regidrago-dragapult-opening.test.cjs) exhaust small toy decks, checking hand-discard, deck-Compressor, and disjoint union independently of the category-state formula. The same tests assert all nine source multiplicities, source-printed Basic counts, and reproduce the previous rank-10 Treasure-only figure. All passed in the existing **manual-only** [CI 39402228011](https://github.com/FlareZ123/experiment-01/actions/runs/39402228011), head **`f5dc4b0ac326de90a9503fdf8ade9e6a53eb3bb4`**, with no compiled game engine required. The unchanged [manual workflow](../../.github/workflows/regidrago-temple-answers.yml) also executed its earlier Temple/Prize audits.

## Decision value and limits

The nine published Regidrago opponents have sharply different early direct Dragon-discard opportunities despite all playing Dragapult ex. The earlier selected rank-10 seed's turn-3 Dragon discard was physically realizable, but the limited early resource counts reinforce that **one successful seed must not be generalized to all nine or to an overall matchup win rate**. Future source-policy comparisons should record whether Dragon was genuinely in hand, deck, or Prizes; whether the relevant search Item was still available; which competing discard costs and connector actions were paid; and whether the resulting *copied effect* actually changed Prize conversion.

The 99.5% goal remains unproven. **29/32** opponent 60s are exact-published, three are still missing (23,25,28), and there are **zero competitively qualified games** in this research program.
