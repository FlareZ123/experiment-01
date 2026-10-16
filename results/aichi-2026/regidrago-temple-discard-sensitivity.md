# Exact discard-sensitive Regidrago search routes against Temple of Sinnoh

**Agent 20, 16 October 2026. Evidence:** complete-print Aichi 2026 source inventories, exact six-category hypergeometric enumeration, independent exhaustive small-deck deal tests, and [passing manual CI 38870418683](https://github.com/FlareZ123/experiment-01/actions/runs/38870418683). **These percentages measure narrowly defined resource opportunities, never played-game results, successful Stadium removal rates, or matchup win rates.**

## Question

The earlier [direct-response model](regidrago-temple-response.md) found a **36.7992%** mean first-eight direct Temple-answer access across the nine published Regidrago decks. The [optimistic Quick Ball and Mysterious Treasure extension](regidrago-temple-search-extension.md) increased that restricted-resource opportunity to **65.2789%** by assuming that every observed searcher is usable and its discard cost free. The difference is substantial enough to merit an explicit, reproducible discard-budget sensitivity check.

A searcher is treated as payable here only if the eight observed cards include a *second* Quick Ball or Mysterious Treasure to discard, or at least one card in an explicitly permitted spendable category. The played searcher itself cannot pay its own discard cost. This is a deliberately simplified state-dependent discardability scenario, not a judgment that every listed Energy or second searcher should actually be sacrificed.

## Exact calculation and source table

We partition an opening seven containing at least one Basic Pokémon, followed by the mandatory draw into eight observed cards, into disjoint categories: directly playable Temple answers, one Resetting Hole **Marshadow UNB 81**, other Basics, **Quick Ball/Mysterious Treasure**, designated spendables, and other cards. All unordered opening-hands are weighted by their multivariate hypergeometric count; the eighth draw is weighted by remaining card multiplicities. When a Marshadow search route is available and it has not appeared in the observed eight, the probability it survived the six random Prizes is exactly **46/52**. A Marshadow forced to be the only Basic starting Active is not a direct Benched Ability answer. The direct-answer route is checked first, then the payable search route. We do not assume the identity of the hidden Prizes has already been learned.

| Regidrago rank | Direct answer | Second searcher only | Plus Basic Energy spendable | Plus all Energy spendable | Free-discard ideal |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 23.897% | 35.374% | 51.302% | 56.812% | 62.720% |
| 12 | 42.956% | 57.777% | 70.552% | 74.657% | 78.430% |
| 13 | 33.759% | 33.759% | 33.759% | 33.759% | 33.759% |
| 14 | 33.852% | 50.334% | 64.836% | 69.612% | 74.220% |
| 18 | 43.122% | 55.176% | 64.787% | 70.385% | 76.133% |
| 20 | 42.776% | 54.627% | 67.316% | 71.495% | 75.526% |
| 21 | 42.776% | 57.470% | 71.464% | 74.300% | 78.106% |
| 27 | 34.017% | 50.654% | 65.229% | 70.006% | 74.579% |
| 32 | 34.037% | 34.037% | 34.037% | 34.037% | 34.037% |
| **Equal-rank mean** | **36.799%** | **47.690%** | **58.142%** | **61.674%** | **65.279%** |

Ranks **13 and 32** have no printed Resetting Hole Marshadow, so Quick Ball and Mysterious Treasure cannot access the specific extra route modeled here. The Basic Energy scenario counts printed Grass/Fire Energy; the all-Energy scenario additionally treats Double Dragon Energy as expendable. These cases represent different *assumptions about strategic sacrifice*, not empirical discarded-card frequencies.

## Additional strict protected-Energy scenarios

The scenarios above considered all cards in the designated Energy category spendable, even when that Energy was the sole available copy of its type. A separate [exact eight-category model](../../scripts/regidrago-temple-protected-energy.cjs) tests a more protective hand-state heuristic: reserve the **first observed Grass Energy and Fire Energy**, so only observed duplicates of those types may pay a searcher's discard. Two variants preserve every Double Dragon Energy or reserve the first DDE and permit discarding any observed surplus. A second searcher remains disposable in either case. The reserve is checked only against the observed eight, with no implied midgame board state or actual attacker target. Every event remains conditional on a valid opening-seven, the next draw and six hidden Prizes.

| Regidrago rank | Protect every DDE | Reserve one DDE |
| ---: | ---: | ---: |
| 10 | 37.786% | 39.736% |
| 12 | 59.923% | 61.640% |
| 13 | 33.759% | 33.759% |
| 14 | 52.689% | 54.580% |
| 18 | 55.854% | 57.608% |
| 20 | 56.687% | 58.342% |
| 21 | 60.183% | 61.080% |
| 27 | 53.037% | 54.950% |
| 32 | 34.037% | 34.037% |
| **Equal-rank mean** | **49.328%** | **50.637%** |

For comparison, the strict second-searcher-only mean is **47.690%**, and the model that treats **every Basic Energy** as immediately expendable reaches **58.142%**. Thus the *assumed protection threshold* on Energy cards materially changes the inferred search route, while protecting all DDE versus one DDE changes this restricted equal-rank mean by only **1.309 percentage points**. These are model outputs rather than prescribed discard decisions.

[Independent exhaustive miniature-deck tests](../../tests/regidrago-temple-protected-energy.test.cjs) enumerate opening hands, every Prize subset and every possible next draw, then compare with the eight-category BigInt calculation. They also assert all nine printed Grass/Fire/DDE inventories and monotonicity against the prior bounds. Both new scenarios passed [manual CI 38871126288](https://github.com/FlareZ123/experiment-01/actions/runs/38871126288); no gameplay engine was needed.

## Interpretation and hard boundaries

The first eight observed cards include items which may not yet be usable because of Item lock, a constrained Bench, the need to discard other protected cards, or conflicting actions. Even an Energy-card discard judged theoretically payable may remove necessary attachment resources. Conversely the model excludes Professor's Research and other draw/supporter/Tool/Ability routes, recovery, later turns, opponent mulligan bonus draws, and other ways to defeat Temple of Sinnoh. It does not model Temple actually being played by the Shadow Rider candidate, or whether removing Temple is the best attack line.

The gap between **65.279% free-discard** and **58.142% Basic-Energy-spendable** is approximately **7.136 percentage points** in the equal-placement mean under these exact simplified assumptions. The strict second-searcher-only scenario yields **47.690%**. This evidence demonstrates the sensitivity of claimed graph connectivity to discard availability. It cannot be interpreted as an actual probability of disabling Temple or a win-rate advantage for either fixed deck.

## Reproduction

- [Exact enumerator and full-source category counts](../../scripts/regidrago-temple-discard-sensitivity.cjs).
- [Independent miniature physical-deal oracle, count guards, and monotonicity tests](../../tests/regidrago-temple-discard-sensitivity.test.cjs).
- [Manual-only combined workflow](../../.github/workflows/regidrago-temple-answers.yml), successfully completed in [run 38870418683](https://github.com/FlareZ123/experiment-01/actions/runs/38870418683).
- Prior [free-discard optimistic model](../../scripts/regidrago-temple-search.cjs) and [direct-response model](../../scripts/regidrago-temple-answers.cjs).

Future policy tests should record whether a searcher is actually playable, which discard is consumed, the opponent's Item/Ability/Bench constraints, and the alternative use of that discarded card. Any full-game comparison must retain 60-card source identities, pinned simulator revision, matched seat-randomness protocol, and an independent opponent-decision competency review.
