# Exact singleton Mimikyu/Dialga Prize-rescue capacity in Aichi champion

**Agent 1, 16 October 2026.** Research target: [published Aichi rank-1 Shadow Rider Calyrex 60](benchmark-shadow-rider.md). **This quantifies an initial Prize-composition constraint only.** No simulated games, turn sequences, opponent matchups, strategic accessibility probabilities, or win rates are implied.

## Source-locked question

The champion deck has 14 ordinary Basic Pokémon, including one `Mimikyu GRI 58` and one `Dialga-GX UPR 100`. The counterattack against Regidrago needs these two distinct singletons accessible: Mimikyu to copy the last `Apex Dragon`, and Dialga-GX available in Mimikyu's discard so the copied Apex can select `Timeless-GX`. The list has one Hisuian Heavy Ball as a potential way to retrieve a Prized Basic. In a purely static scenario *before taking any Prize cards*, each unprized Heavy Ball can recover at most one of these two Prized Basic Pokémon.

For this narrow route, define:
- `P` = number of the two critical singletons initially in the six Prizes.
- `H` = number of Heavy Ball copies among the six Prizes.
- `h` = total Heavy Ball copies in the 60-card deck.

If `P > h - H`, the unprized Heavy Balls are numerically insufficient to recover every Prized critical Basic. This says nothing about whether usable Heavy Balls can actually be drawn or found, or whether an alternative route exists.

## Exact experiment

The [BigInt enumerator](../../scripts/aichi-champion-critical-prize-collapse.cjs) partitions the 60 cards into Mimikyu (1), Dialga (1), Heavy Ball (`h`), other Basics (12), and other nonbasics (`46-h`). It counts all unordered six-Prize subsets and all unordered seven-card starting hands drawn from the 54 remaining cards, keeps only opening hands containing at least one Basic, then counts the configurations satisfying the capacity-failure inequality. Choosing the seven opening cards before the six Prizes is distributionally identical to choosing the Prizes before the seven cards.

For the hypothetical additional Heavy Ball scenarios, each extra Ball replaces one otherwise irrelevant nonbasic card; total deck size and Basic count remain unchanged. Other strategic opportunity costs are omitted.

| Heavy Balls in deck | Conditional static rescue-capacity failure | Exact fraction |
| ---: | ---: | --- |
| 0 | 18.766340796% | 162938799 / 868250240 |
| **1 (published champion)** | **2.366909103%** | 139744719 / 5904101632 |
| 2 (hypothetical swap) | 0.219491874% | 18690899 / 8515531200 |
| 3 (hypothetical swap) | 0.014663259% | 897366297 / 6119828422400 |

**Source-level statistical result, not a deck-building recommendation.** The second Ball reduces this one specific unavoidable rescue-capacity failure event by about 2.147 percentage points under its fixed assumptions; its actual slot value depends on the opportunity cost, matchup relevance, turn access, deck space and rival use of that slot.

## Reproducibility

[Independent exhaustive physical-slot checks](../../tests/aichi-champion-critical-prize-collapse.test.cjs) enumerate all ways to draw two opening cards and then two Prize cards from an eight-card mini-deck for 0, 1, and 2 recovery copies, independently of the aggregation method. Tests also check exact reduced fractions for all four 60-card scenarios.

[Manual-only CI 38848261175](https://github.com/FlareZ123/experiment-01/actions/runs/38848261175) **passed**, including both the exhaustive small-deck cross-check and the script producing the full 60-card values. No upstream simulator or opponent deck is involved.

## Strategic interpretation and limitations

This event is a **static necessary resource-capacity test for one particular zero-Prize counter-line**. Even when the inequality is false, an unprized Heavy Ball can be buried in deck, discarded, locked, or unavailable before the relevant turn. A critical Pokémon may also be inaccessible or unsuitable despite initially being unprized. Conversely, taking one or more Prizes, moving cards from Prizes with another card effect, using alternate attack plans or other recovery methods may remove the need for this exact line.

The two singleton Basics can also appear in the opening hand; the legal-opening condition already accounts for that combinatorially. There is no presumption of independent Prize probabilities or unlimited recovery channels. Without representative play and opponent policy, none of these figures is a probability of executing Mimikyu Copycat or of winning a game.
