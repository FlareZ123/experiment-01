# Hood Shadow Rider's Mimikyu–Dialga counter line: exact initial Prize collapse and a second Heavy Ball

**Agent21 · 28 November 2026 · non-game combinatorial decision support**

## Practical deck decision

The existing single provisional fixed candidate
`results/decks/hood-shadow-rider-v1-mimikyu2-challenger-60.json` contains **2 Mimikyu GRI58, 1 Dialga-GX UPR100, 1 Hisuian Heavy Ball ASR146, 14 Basic Pokémon, 60 total cards**.

A meaningful counter-ALS against opposing Regidrago VSTAR uses **one Mimikyu** and **one Dialga-GX**; both are Basic Pokémon that Hisuian Heavy Ball can retrieve from face-down Prize cards. A single Heavy Ball can retrieve **one**, not two, of those Prized Pokémon. If the remaining copies of the required Pokémon are all in Prize and there are insufficient unprized Heavy Balls, **the line cannot be assembled before taking a Prize**, even under perfect search and discard availability.

This is an exact *necessary physical access* question, distinct from the much harder question of playing, paying and winning with the line.

## Computed results

| Available Heavy Balls in 60 before Prize setting | Failure probability, uniform six Prize cards | Failure conditioned on a valid Basic-containing initial seven |
|---:|---:|---:|
| 0, structural control | 10.7890% | 10.5421% |
| **1, actual provisional fixed 60** | **0.958196%** | **0.939893%** |
| **2, hypothetical non-Basic-for-Heavy-Ball slot substitution** | **0.067344%** | **0.066429%** |
| 3, structural control | 0.003508% | 0.003485% |

**The one-to-two Heavy Ball substitution would reduce *this specific pre-Prize collapse event* by about 0.87346 percentage points, or approximately 14.1×, conditional on a valid seven-card opening.** It is *not* an estimated win-rate improvement, card-swap recommendation, or evidence that two Heavy Balls is the best fixed 60.

The full exact model handles all Prize compositions jointly (including two Mimikyu and Dialga all Prized, recovery-card Prizing, and multiple needed recoveries), rather than adding marginal singleton Prize probabilities. It does not assume individual Prize events are independent.

## Reproducible exact computation

- [Exact BigInt model](../../../scripts/agent21-hood-mimikyu-dialga-prize-collapse.cjs)
- [Focused tests](../../../tests/2026-11/agent21-hood-mimikyu-dialga-prize-collapse.test.cjs): **6/6 isolated JavaScript tests PASS**, including an independent exhaustive small-deck enumeration.
- Input deck: `results/decks/hood-shadow-rider-v1-mimikyu2-challenger-60.json` (unchanged source).

The code asserts the exact source inventory and 14 Basic count; enumerates Prized counts of Mimikyu, Dialga, Heavy Ball and other Basic/non-Basic cards; weights each possible multiset composition by the product of binomial coefficients; and marks failure when required recovered Pokémon groups (all Dialga Prized and/or both Mimikyu Prized) exceed the available non-Prized Heavy Balls.

For mulligan-conditioned openings, for each possible six-Prize composition it weights by the exact number of seven-card hands from the remaining 54 that contain at least one Basic:
`C(54,7) - C(54 - remaining_Basics,7)`, then divides by all corresponding valid hand and Prize configurations. It does **not** model the opponent's mulligans or extra initial draw cards. No Monte Carlo seed error exists: the stated probabilities are exact combinatorial enumerations under explicitly defined random-deal assumptions.

## Actionability and disconfirming conditions

**What a testable noncosmetic change would be:** preregister a *single, unchanged* alternative 60 with a second Heavy Ball replacing **one specific non-Basic slot**, while keeping the original as control, and evaluate actual line availability across all nine authenticated Regidrago opponent sixties. Before any full games, test true native Item payment/Prized-Basic extraction, availability under opponent Budew Item lock, and the Mimikyu→Apex Dragon→Timeless-GX counter chain. Compare the **slot removed** for its own high-impact tactical value; simply doubling Heavy Ball improves one mathematical failure event but may reduce overall performance if the cut was vital.

**Why this calculation is not a win rate:** it assumes every non-Prized Mimikyu, Dialga and Heavy Ball can be accessed when needed; ignores Stage/energy/attack timing, K0 versus K1 knowledge, needed discard connector, Ability/Item/Supporter locks, Bench capacity, Supporter contention, winning without this line, obtaining Prizes normally, prizes reclaimed later, both player strategies and the nine opponent policies. A card may be physically accessible but unrealistic to deploy. Conversely, a game may still be won when the modeled line collapses.

**Status:** no swap enacted, no decklist changed, no owner/frozen protocol mutation, no CI/native games run, no competitive win-rate claim. This is a quantitative **candidate-slot experiment suggestion** to be considered by the provisional deck owner, not a new nominated deck.
