# Nine-Regidrago Latias dependency and Hisuian Heavy Ball Prize protection

**Agent 20, 19 October 2026.** Evidence: direct audit of all nine published Regidrago 60s in [the Aichi manifest](full-decklists.json), card text, and exact six-Prize combinations. This is an inventory/Prize-configuration finding, not a game outcome.

## Source observations

The [14 May first-person Raichu Top-32 article by kume](https://note.com/kume_pokeca/n/n6cfd126f5774) reports treating Regidrago's reliance on Latias ex for mobility and its early Basic-Pokémon Ability engine as exploitable. The free portion describes active Klefki as a plausible Basic-Ability denial tool, and identifies counterplay including opposing Wobbuffet, Path to the Peak, Sudowoodo and Budew. It argues that active Klefki, Wobbuffet or Tool-Garbodor have different self-lock and setup costs. These are **the author's deck-selection heuristics**, not verified matchup percentages or a published exact 60. An earlier [Agent 22 source report](agent22-missing-placements-source-leads.md) already identified this first-person article; this study quantifies one previously unmodeled opposing inventory response.

Across the **nine exact published Regidrago decks**, ranks 10, 12, 13, 14, 18, 20, 21, 27 and 32:

- All nine have exactly **one Latias ex**, and all nine have **Hisuian Heavy Ball**; rank 18 runs **two**, the other eight each run **one**.
- Every list has **Tapu Lele-GX and Dedenne-GX**, exposing an additional Basic-Ability line in principle, although board state determines whether a lock matters.
- None has a printed **Float Stone, Air Balloon or Escape Rope**. This is a three-card-name census, not a proof that switching/retreating is impossible: every list has Guzma, some include Prime Catcher, and other movements/effects must be checked separately.

| Ranks | Number of lists | Latias ex | Hisuian Heavy Ball | Unconditional probability all listed copies of both are Prized |
| --- | ---: | ---: | ---: | ---: |
| 10, 12, 13, 14, 20, 21, 27, 32 | 8 | 1 | 1 | 1/118 = **0.84746%** |
| 18 | 1 | 1 | 2 | 1/1711 = **0.05845%** |

## Exact combinatorial calculation

With a uniformly random six-card Prize subset of a 60-card list, any specified singleton is Prized with probability **6/60 = 10%**. If Latias and its only Hisuian Heavy Ball are two specified cards, the joint event is **C(58,4)/C(60,6) = 1/118**. With two Heavy Balls, it becomes **C(57,3)/C(60,6) = 1/1711**. The equal-placement mean of the *specific simultaneous-Prizing event* across these nine Regidrago lists is **0.75979%**.

[Official Hisuian Heavy Ball text](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/swsh10/146/) allows its user to exchange the Item for a face-down Prized Basic Pokémon and shuffle the remaining Prizes. Hence merely finding the Latias singleton among one's Prizes does **not** establish permanent loss of Latias. If Heavy Ball remains outside the Prizes, it still requires actual access and a legal Item play. An opposing Item lock, search disruption, hand choices, turn timing, or a Basic-Ability lock can make the theoretical recovery line unavailable or insufficient; conversely a deck can function without Latias on a particular turn.

**Important model boundary:** this enumeration is unconditional on legal seven-card opening hands and mulligan recycling; it does not represent an exact opening-turn probability under the actual Basic-Pokémon opener rule. It models one preselected six-Prize subset and preserves every 60-card source multiplicity. It does not measure the chance Latias is accessible, on the Bench, Active, functional, or strategic, nor any player win probability.

## Turn-one direct Heavy Ball access under a valid opener

The joint-Prizing event above is a **backup-resource collapse**, while finding Heavy Ball immediately is a different question. A second exact model conditions on a legal seven-card starting hand containing at least one Basic Pokémon, then follows the real order **opening seven → six Prizes → first ordinary draw**. It tests the conjunction `Latias ex is Prized AND at least one Hisuian Heavy Ball is in the opening seven or first ordinary draw`. The nine original Basic counts are independently sourced from [the event's printed Basic audit](opening-hand-audit.json).

| Rank | Known Basic Pokémon | Heavy Balls | Direct one-draw recovery-card presence **and** Latias Prized |
| ---: | ---: | ---: | ---: |
| 10 | 15 | 1 | **1.27752%** |
| 12 | 15 | 1 | **1.27752%** |
| 13 | 11 | 1 | **1.22781%** |
| 14 | 14 | 1 | **1.26722%** |
| 18 | 16 | 2 | **2.42605%** |
| 20 | 14 | 1 | **1.26722%** |
| 21 | 14 | 1 | **1.26722%** |
| 27 | 15 | 1 | **1.27752%** |
| 32 | 13 | 1 | **1.25567%** |

The conditional calculation sums exact opening-seven compositions by other Basics, Heavy Ball copies and non-Basics, with Latias outside the seven. In each such opening it multiplies the probability of Latias entering six Prizes by the probability a Heavy Ball is already in hand or occupies the first ordinary draw. [The enumerator](../../scripts/aichi-regidrago-latias-prize.cjs) uses integer binomial weights; the [tests](../../tests/aichi-regidrago-latias-prize.test.cjs) compare its general formula with a separate exhaustive small-deck ordered-deal enumerator, as well as the real Basic counts.

Thus **theoretical recovery from Prizes is substantially broader than immediate direct first-eight availability**. Neither measurement is a full deck-access estimate. The first-eight model excludes Quick Ball/Trainers that access Heavy Ball, Forest Seal Stone, card draws from Abilities, supporter usage, opposing mulligan bonus cards, and decisions after observing K1 Prize information. Item lock can further deny actual Heavy Ball use. It also does not establish whether Latias is needed at all in that game's first turn.

## Deck-selection implications and falsification

An anti-Regidrago counter centered exclusively on *Prizing* a singleton is poorly justified. A serious candidate should test whether **an actually Active Klefki / other Basic-Ability lock** denies Latias mobility and the basic draw/search engine **after legal opponent responses**, with the Regidrago player retaining its printed Hisuian Heavy Ball, Guzma and relevant switching alternatives. This must preserve the causal cost of occupying the attacker's own Active Spot, self-locking the candidate's Basics, source opponent Supporter decisions, Item-lock contention and board evolution. Source-backed early pressure and realistic unlocked/locked reply trajectories are the intended discriminators.

A qualifying trial should freeze one of the unchanged rank-specific Regidrago 60s, a candidate 60, actual starting order, policy revision, legal prompt closure, an ability-lock event, and the following real opponent response. Record all preregistered attempts and non-opportunities; a single staged Klefki success is not a matchup result. This can inform the population's later candidate-choice matrix without reopening already closed rank-6/rank-11 mechanical packets.

## Reproducibility

- [Pure exact source enumerator](../../scripts/aichi-regidrago-latias-prize.cjs) reads the actual pinned `full-decklists.json` and fails if an included rank, singleton or 60-card total changes.
- [Node tests](../../tests/aichi-regidrago-latias-prize.test.cjs) independently assert BigInt binomial boundaries, exact fractions, mocked 60-card source matrices and the real nine-rank original-inventory census.
- Included in the existing [manually dispatched Regidrago response workflow](../../.github/workflows/regidrago-temple-answers.yml). No push-triggered CI or new workflow.

**Research status remains 29/32 exact opposing 60s, zero independently competitively qualified games, and no established 99.5% fixed deck.**
