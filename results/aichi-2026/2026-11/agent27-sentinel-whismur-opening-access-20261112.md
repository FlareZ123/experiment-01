# Sentinel v2 Whismur Bawl: exact opening-access envelope

**Agent 27 · 12 November 2026 · exact combinatorial derivation · not a game-performance result**

## Decision

The Whismur bridge is not a reliable deterministic setup step. In the exact Sentinel v2 60, the enumerated first-turn-going-second access routes produce **12.04%** access without Guzma & Hala assistance and **22.86%** under an optimistic modeled extension that assumes two discardable cards for Guzma & Hala. The latter is not a match-win rate and does not establish the subsequent turn's double lock.

A separate deck-count correction matters: the candidate has **13 Basic Pokémon**, not 15. Mega Lopunny ex is a Stage 1 Pokémon evolving from Buneary. The 13-Basic list has a **16.28%** probability that the initial seven contains no Basic and requires a mulligan.

## Exact deck audit

Input: [`candidate-sentinel-lopunny-vileplume-v2-whismur-doublelock.psv`](../candidate-sentinel-lopunny-vileplume-v2-whismur-doublelock.psv). The script reads this file directly and fails if its exact Pokémon inventory, key quantities, or 60-card total changes.

| Category | Count |
|---|---:|
| Pokémon | 26 |
| Energy | 6 |
| Trainers | 28 |
| Basic Pokémon | 13 |

Basic names and quantities: Buneary ×2, Fan Rotom ×1, Girafarig ×1, Lillipup ×3, Oddish ×2, Pidgey ×2, Relicanth ×1, Whismur ×1. Mega Lopunny ex ×2 is Stage 1, not Basic; the other Evolution Pokémon are also excluded from the Basic count.

Exact initial-seven probabilities:

- Valid Basic-containing opening: **83.7156%** (`9797437 / 11703240`).
- No Basic in the initial seven / at least one mulligan required: **16.2844%** (`1905803 / 11703240`).

## Printed route model

The local card pool gives the following relevant text:

- Whismur CES 116 (60 HP): Bawl costs one Colorless Energy, can be used only when going second and only on the player's first turn, and prevents the opponent from playing Trainer cards from hand during their next turn.
- Fan Rotom SCR 118: Fan Call can be used once during the player's first turn to search up to three Colorless Pokémon with 100 HP or less. It can find Whismur.
- Jet Energy PAL 190: when attached from hand to a Benched Pokémon, it switches that Pokémon with the Active Pokémon. This is the modeled route for promoting Whismur when it was not selected Active during setup.
- Guzma & Hala CEC 193: it searches a Stadium; if two other cards are discarded, it can also search a Pokémon Tool and a Special Energy.
- Tag Call CEC 206 can search Guzma & Hala from the deck.

All six Energy in the list can pay Whismur's Colorless attack cost. If Whismur is already in the opening seven, any Energy in hand by the first turn is enough. If Whismur is drawn or found by Fan Call after the Active Pokémon was selected, the modeled promotion requires Jet Energy.

## Exact method

Condition on a final opening seven containing at least one Basic (the distribution after repeated mulligan redraws). From the remaining 53 cards, choose seven: six are the Prize cards and one is the first natural draw. The seven-card set is uniform; the draw identity is selected uniformly from those seven. The exact denominator is:

`(C(60,7) − C(47,7)) × C(53,7) × 7`.

The script partitions the outcomes into six mutually exclusive routes. It also exposes three independent suppression flags: Fan Call availability (Ability), Tag Call availability (Item), and Guzma & Hala availability (Supporter).

Guzma & Hala assistance is deliberately optimistic: the model assumes two strategically discardable cards are always available, assumes the relevant Special Energy remains in the deck, and does not model discard-capable-index or active-move-realism costs. For a Whismur already in hand it may find any Special Energy; for a Whismur found/drawn onto the Bench it must find Jet Energy. The model assumes an open Bench and no Stadium/board effect suppressing Jet Energy.

## Results

| Mutually exclusive access route | Probability, conditional on valid opening and going second |
|---|---:|
| Whismur in opening seven; Energy in hand by first draw | 7.6393% |
| Whismur in opening seven; Guzma & Hala finds Special Energy | 4.4429% |
| Whismur is first draw; Jet Energy already in hand | 0.4941% |
| Whismur is first draw; Guzma & Hala finds Jet Energy | 0.7481% |
| Fan Call finds Whismur; Jet Energy already in hand | 3.9100% |
| Fan Call finds Whismur; Guzma & Hala finds Jet Energy | 5.6231% |
| **Total modeled access envelope** | **22.8575%** |

Without Guzma & Hala assistance, the first, third and fifth routes sum to **12.0433%**. The Guzma & Hala-assisted routes contribute another **10.8142 percentage points** under the optimistic two-discard assumption.

### Counterfactual pre-existing lock sensitivity

These are access calculations with specific actions disabled, not probabilities that an opponent establishes those locks:

| Pre-existing opponent restriction | Modeled access |
|---|---:|
| None | 22.8575% |
| Ability lock disables Fan Call | 13.3244% |
| Item lock disables Tag Call | 18.7829% |
| Supporter lock disables Guzma & Hala | 12.0433% |
| Ability + Item lock | 11.3785% |
| Item + Supporter lock | 12.0433% |
| Ability + Supporter lock | 8.1333% |
| Ability + Item + Supporter lock | 8.1333% |

The important dependency is structural: Fan Rotom access disappears under Ability lock; Tag Call cannot fetch Guzma & Hala under Item lock; and Guzma & Hala cannot be played under Supporter lock. Direct Whismur-plus-Energy hands remain available, as do Whismur-draw-plus-Jet hands.

## Strategic interpretation and limitations

1. The **22.86%** figure is an optimistic envelope for the modeled Fan Rotom / Jet / Guzma & Hala routes, not a guaranteed attack rate. It assumes going second, a usable first-turn Ability, no relevant pre-existing suppression, open Bench space, and two discardable cards for every Guzma & Hala line.
2. The **12.04%** subset does not require Guzma & Hala, but still assumes the player can use Fan Call and Jet Energy normally. It is not a complete enumeration of every possible manual-retreat or card-specific line.
3. The deck's 13 Basics create a nontrivial mulligan rate. Opponent bonus-card choices after mulligans are not modeled.
4. The calculation stops at Bawl access. It does not model whether the player can assemble two Stoutland and Vileplume on the following turn, including two Rare Candy, Grand Tree, the required Basics, three Stealthy Hood attachments, and the Active switch. It also does not model the opponent's next-turn attacks or the actual lock's survival.
5. The calculation does not include the probability of choosing or being assigned second. Bawl is unavailable when the player goes first.
6. The counterfactual lock table is not a field matchup table. It does not assign probabilities to any opponent's opening board or prove that a given opponent can establish a lock on turn one.

## Recommendation

Keep Sentinel v2 as an **untested secondary challenger**. Do not promote it on the basis of Whismur's printed Trainer denial or the 22.86% modeled access envelope. The meaningful next experiment is a same-policy, same-seed comparison against v1 that records (a) whether Bawl was actually selected and paid for, (b) whether Guzma & Hala required two high-value discards, (c) whether the turn-after double lock was assembled, and (d) whether the lock survived the opponent's response. No native game or competitive win-rate evidence is produced here.

Reproducibility:

- Script: [`simulation/evaluation/agent27-sentinel-whismur-access.cjs`](../../simulation/evaluation/agent27-sentinel-whismur-access.cjs).
- Tests: [`tests/2026-11/agent27-sentinel-whismur-access.test.cjs`](../../tests/2026-11/agent27-sentinel-whismur-access.test.cjs).
- Runtime validation: Node.js 22.16.0; **6/6** local tests passed. These are exact arithmetic and input-contract tests, not Twinleaf game tests.