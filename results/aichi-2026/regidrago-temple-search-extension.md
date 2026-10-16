# Prize-aware Marshadow search against Temple

**Agent 20, 16 October 2026.** [Exact source-derived model](../../scripts/regidrago-temple-search.cjs), [small-deck independent exhaustive tests](../../tests/regidrago-temple-search.test.cjs), [manual CI passed](https://github.com/FlareZ123/experiment-01/actions/runs/38826658564).

The [direct-response study](regidrago-temple-response.md) measures opening-seven-plus-first-draw access to Stadium replacement, Stadium-removal Items and benchable Resetting Hole Marshadow. This extension additionally considers Quick Ball and Mysterious Treasure as routes to **Marshadow UNB 81**, which is Psychic-type and searchable by both Items. The model assumes the needed discard and Item play are available, and that there is Bench space.

If Marshadow is absent from the first eight observed cards, six of the remaining 52 are face-down Prizes and 46 remain in deck. The exact enumeration multiplies the card-search route by this conditional deck-access probability, using valid opening seven hands and the mandatory next draw. A Marshadow that starts Active as the only opening Basic cannot use Resetting Hole from the Bench in this model.

| Rank | Quick Ball + Treasure | Direct access | With ideal search |
| ---: | ---: | ---: | ---: |
| 10 | 6 | 23.897% | 62.720% |
| 12 | 8 | 42.956% | 78.430% |
| 13 | 7 | 33.759% | 33.759% |
| 14 | 8 | 33.852% | 74.220% |
| 18 | 7 | 43.122% | 76.133% |
| 20 | 7 | 42.776% | 75.526% |
| 21 | 8 | 42.776% | 78.106% |
| 27 | 8 | 34.017% | 74.579% |
| 32 | 7 | 34.037% | 34.037% |

The equal-placement mean among the nine published Regidrago decks changes from **36.799%** direct access to **65.279%** restricted optimistic access. Ranks 13 and 32 contain no Resetting Hole Marshadow.

**Interpretation:** These are probabilities that a restricted access route exists under optimistic action assumptions. They exclude search discard opportunity costs, Item lock, resource contention, missed turns, opponent mulligan draws, alternative search and recovery paths, and attacks. Consequently these results cannot be used as game-win rates or as rigorous upper or lower bounds for actual successful Stadium removal. They do show why a model assigning Temple persistent lock value without testing opponent search will be optimistic.

**Discard-cost sensitivity follow-up:** [The exact nine-list discard-budget audit](regidrago-temple-discard-sensitivity.md) demonstrates that this report's 65.279% mean assumes every searcher has a free discard. With only a second searcher as the discardable resource, the same first-eight restricted event averages **47.690%**; treating printed Basic Energy as additionally expendable raises it to **58.142%**; treating all Energy as expendable yields **61.674%**. These are explicitly different idealized opportunity assumptions, not actual played-card decisions or matchup wins. The [expanded tests passed manual CI 38870418683](https://github.com/FlareZ123/experiment-01/actions/runs/38870418683).

See [Psychic Marshadow's pinned-engine interaction](regidrago-temple-marshadow-fixture.md) for the separate proof that Wobbuffet's Psychic exception permits Resetting Hole.
