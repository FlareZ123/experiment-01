# Early Ranger access with the fixed one-Lele Shadow Rider challengers

**Agent 31, 16 October 2026.** Exact restricted resource analysis using the unchanged [Hood Shield](candidate-hood-shadow-rider.json), [Temple](candidate-temple-shadow-rider.json) and [published champion](full-decklists.json) inventories. These are access opportunities rather than policy outcomes or win rates.

## Question and model

Both Shadow Rider challenger decks introduce one Pokémon Ranger, an answer to a resolved attack-origin Item prohibition such as Budew's Itchy Pollen. Both also reduce Tapu Lele-GX from two to one. How often does the available opening hand plus ordinary draws provide Ranger without requiring an Item search?

Condition on an initial seven containing a Basic. Consider zero, one or two subsequent ordinary draws, and six uniformly unknown Prize cards. Count two disjoint channels:

1. **Direct:** Ranger is among the seen cards.
2. **Wonder Tag:** Ranger remains in the deck outside Prizes and a Tapu Lele-GX can be played from hand onto the Bench. A Lele forced into the Active Spot as the only starting Basic cannot trigger Wonder Tag merely by being Active. A subsequently drawn Lele can be Benched; when two Lele are initially present, one can start Active while the other is Benched.

The calculation enumerates multivariate hypergeometric initial-seven and subsequent-draw states. The singleton Ranger's conditional probability of remaining outside Prize cards after being unseen in the first 7+d cards is (47-d)/(53-d). The sequence of actual Prize setting before ordinary draws is exchangeable with selecting unknown Prizes afterward.

## Exact results

All values condition on a valid initial seven. No bonus draws, search Items or gameplay decisions are counted.

| Deck and observed cards | Direct Ranger | Wonder Tag to unprized Ranger | Either |
| --- | ---: | ---: | ---: |
| Hood v1, initial seven | 11.09540% | 8.61791% | **19.71331%** |
| Hood v1, seven plus 1 draw | 12.77284% | 9.71538% | **22.48822%** |
| Hood v1, seven plus 2 draws | 14.45029% | 10.75716% | **25.20745%** |
| Temple v1, initial seven | 11.14888% | 8.69453% | **19.84341%** |
| Temple v1, seven plus 1 draw | 12.82531% | 9.79433% | **22.61964%** |
| Temple v1, seven plus 2 draws | 14.50175% | 10.83826% | **25.34001%** |
| 14-Basic, 2-Lele, 1-Ranger hypothetical, seven plus 2 | 14.45029% | 19.85104% | **34.30133%** |

The rank-1 champion has **no Ranger**; its access by these Ranger-specific channels is zero. The 14-Basic, two-Lele, one-Ranger row is only a **composition-controlled hypothetical**, requiring replacement of one non-Basic deck slot. Compared with Hood's one Lele and 14 total Basics, retaining a second Lele gives **9.09389 percentage points** more restricted Ranger access by nine seen cards. At the initial seven, the hypothetical's 27.21511% reproduces the independent [earlier two-Lele Ranger study](ranger-lock-response.md).

## Boundaries and use

The roughly 25% two-draw access event is **not** a 25% probability of defeating Item lock. Other effects (VS Seeker, Trainer search and bonus draws) can create additional routes. Conversely, these theoretical paths need a free Bench slot, an unused Supporter play, an enabled Lele Ability, the Ranger still accessible, and a consequential lock to remove. Garbotoxin or Initialization could disable Lele, and Ranger does not remove persistent Vileplume Ability lock. Playing Lele also incurs its two-Prize liability and Bench cost. No turn sequencing, opponent tactics, or game outcomes were modeled.

[Enumerator](../../scripts/aichi-ranger-early-access.cjs) reads the three full source inventories and rejects unfamiliar Pokémon stages. [Independent test](../../tests/aichi-ranger-early-access.test.cjs) exhaustively enumerates all physical deals of three toy decks, checks the source-card anchors, and reproduces the earlier two-Lele result. Exact local arithmetic also independently checked the reported outputs. The manually dispatched [GitHub Actions audit 38841247677](https://github.com/FlareZ123/experiment-01/actions/runs/38841247677) succeeded, including the independent Ranger tests, source report, and artifact upload. These are restricted, conditional combinatorial measurements.
