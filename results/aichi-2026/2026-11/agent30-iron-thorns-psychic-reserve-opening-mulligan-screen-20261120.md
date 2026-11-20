# Iron Thorns Psychic Reserve v3: exact opening and mulligan-burden screen

**Agent 30 · 20 November 2026**  
**Evidence class:** exact finite-population combinatorics, checked by a seeded independent setup simulation. This is a setup-consistency screen, not a matchup result, deck-strength estimate, or paper-legality certification.

## Decision-relevant finding

The developmental **Iron Thorns ex / Mimikyu Psychic Reserve v3** has only five Basic Pokémon (four Iron Thorns ex TWM 77 and one Mimikyu PAL 97). The Aichi rank-1 Shadow Rider champion source list has fourteen Basic Pokémon; the Hood Shield Shadow Rider v1 candidate also has fourteen.

In a uniformly shuffled 60-card deck, the five-Basic list has only **47.4562%** chance to contain a Basic in its initial seven, versus **86.1409%** for a fourteen-Basic list. Conditional on a valid opening, the five-Basic list has only **20.9139%** of hands with at least two Basics available for an initial Bench, versus **60.5824%** for the fourteen-Basic list. In **15.8172%** of its valid openings, the Iron Thorns list has Mimikyu but no Iron Thorns, so it cannot begin with its intended Iron Thorns Active from the opening hand.

Under the paper rulebook's two-player setup procedure, this also creates a substantial *optional bonus-draw opportunity* for a fourteen-Basic opponent. Against the rank-1 fourteen-Basic source list, the expected maximum bonus draws available to that opponent are **1.0287 cards**, compared with **0.08235** available to the five-Basic candidate; the expected difference in maximum optional bonus-draw opportunity is **0.9463 cards per setup**. The recipient may choose fewer than the maximum, so these are ceilings, not guaranteed cards drawn or a win-rate effect.

This is a meaningful structural liability for Psychic Reserve v3. It does **not** prove the deck is unplayable or inferior: its lock plan, draw, Capture Energy, and later turn development may compensate. It does mean that the five-Pokémon architecture should not be treated as a low-cost way to obtain a 44-Trainer shell.

## Exact inputs and Basic classification

- **Iron Thorns Psychic Reserve v3:** [fixed 60-card JSON](../candidate-iron-thorns-psychic-reserve-v3.json). All five Pokémon are Basic: 4× Iron Thorns ex TWM 77 and 1× Mimikyu PAL 97. The list is 5 Pokémon / 44 Trainers / 11 Energy.
- **Aichi rank-1 champion source:** [published 60-card inventory](../full-decklists.json), rank 1. Its Basic Pokémon are 3× Shadow Rider Calyrex V, 2× Lillie's Clefairy ex, 2× Tapu Lele-GX, and one each of Trevenant & Dusknoir-GX, Latias ex, Dialga-GX, Mimikyu, Girafarig, Marshadow, and Radiant Eternatus: **14 Basics**. Its four Shadow Rider Calyrex VMAX are Stage 1 and do not count as Basic.
- **Hood Shield Shadow Rider v1:** [fixed 60-card JSON](../candidate-hood-shadow-rider.json) also has 14 Basics (four Shadow Rider V, two Clefairy ex, and eight other Basic Pokémon).
- Card subtype checks used the repository card-pool records in **resources/cards/** and **resources/sets/**. The setup procedure is from the repository's [Advanced Player's Manual](../../../resources/manual/EN_advanced_manual-2025-transcription-structured.md), Section I.G, steps 4–7.

## Opening-hand results

For a 60-card deck with *b* Basic Pokémon and a seven-card starting hand:

\[
P(\text{valid opening})=1-\frac{\binom{60-b}{7}}{\binom{60}{7}}.
\]

| Metric | Psychic Reserve v3 (5 Basics) | Rank-1 Shadow Rider source (14 Basics) |
|---|---:|---:|
| Probability initial seven contains a Basic | **47.4562%** | **86.1409%** |
| Probability initial seven has no Basic | 52.5438% | 13.8591% |
| Expected failed seven-card deals if repeatedly redrawn alone until valid, q/p | **1.1072** | **0.1609** |
| Valid opening has exactly one Basic | **79.0861%** | 39.4176% |
| Valid opening has two or more Basics | **20.9139%** | **60.5824%** |
| Expected Basics in a valid opening | 1.2292 | 1.8961 |

The q/p row is the expected number of failed seven-card deals in an *isolated* redraw process. It is not the expected number of rulebook step-5.d executions in a two-player game: when both players lack a Basic in the same deal, they both restart and neither executes step 5.d. The pairwise calculation below handles that distinction.

### Iron Thorns-only opening detail

Among Psychic Reserve v3's valid openings:

- **84.1828%** contain at least one Iron Thorns ex.
- **15.8172%** contain Mimikyu but no Iron Thorns; Mimikyu is therefore the only Basic available to start from that hand.
- **3.2913%** contain that Mimikyu-only start plus at least one of the list's two Capture Energy. Capture Energy can search for a Basic Pokémon when attached from hand, so this is an immediate line to put an Iron Thorns onto the Bench if a copy remains in the deck.
- The remaining **12.52596%** of valid openings are Mimikyu-only without Capture Energy in the opening hand; later draws may still find it.

The Capture Energy line is a real mitigation, not a complete answer. This calculation does not model Prizes, the attachment decision, later draw effects, or whether the player can assemble and preserve the lock after setup.

## Rule-correct two-player bonus-draw model

The supplied manual's setup sequence says that if both players have no Basic in the same deal, both shuffle and restart from deck preparation. That mutual reset does **not** execute step 5.d. If exactly one player lacks a Basic, that player reveals and reshuffles under step 5.d; after the other player sets up and takes Prizes, that player may draw any number up to the number of times their opponent executed 5.d.

Let candidate A and opponent B have valid-opening probabilities *p_A* and *p_B*, with *q_A=1-p_A* and *q_B=1-p_B*. A simultaneous no-Basic deal has probability *r=q_A q_B* and causes a joint restart. Conditional on the first deal that is not a joint failure:

\[
P(B\text{ has a bonus-draw opportunity})=\frac{q_Ap_B}{1-q_Aq_B},
\]

\[
P(A\text{ has a bonus-draw opportunity})=\frac{p_Aq_B}{1-q_Aq_B},
\]

\[
P(\text{neither has one})=\frac{p_Ap_B}{1-q_Aq_B}.
\]

If A is the only player without a Basic, A continues alone until a valid seven appears. The number of step-5.d executions, including the first, is geometric with mean \(1/p_A\). Therefore the expected *maximum optional bonus draws available* to B are:

\[
E[\text{B's maximum optional bonus draws}]
=\frac{q_Ap_B}{(1-q_Aq_B)p_A}.
\]

The expression for A is symmetric. This calculation assumes independent uniform shuffles and seven-card deals. It does not assume that the receiving player must take all available bonus cards.

### Psychic Reserve v3 versus rank-1 source (5 Basics vs 14)

| Pairwise setup outcome | Exact probability / expectation |
|---|---:|
| Both lack a Basic in the same joint deal and restart | 7.2821% per joint deal |
| Rank-1 opponent has any bonus-draw opportunity | **48.8166%** |
| Psychic Reserve candidate has any bonus-draw opportunity | **7.0935%** |
| Neither has a bonus-draw opportunity | 44.0899% |
| Expected maximum optional bonus draws available to rank-1 opponent | **1.028665** |
| Expected maximum optional bonus draws available to candidate | **0.082348** |
| Difference in maximum optional bonus-draw opportunity, opponent minus candidate | **0.946317** |

### Sensitivity to opponent Basic count

The candidate remains fixed at five Basics. Values are expected maximum optional bonus draws available, assuming the recipient chooses the maximum allowed number.

| Opponent Basics | Available to opponent | Available to candidate | Difference for opponent |
|---:|---:|---:|---:|
| 5 | 0.7258 | 0.7258 | 0.0000 |
| 8 | 0.8847 | 0.3075 | 0.5772 |
| 10 | 0.9499 | 0.1916 | 0.7584 |
| 12 | 0.9959 | 0.1242 | 0.8717 |
| 14 | 1.0287 | 0.0823 | 0.9463 |
| 16 | 1.0522 | 0.0551 | 0.9971 |
| 18 | 1.0691 | 0.0370 | 1.0321 |

## Independent validation and reproduction

The exact formula was checked against a separate seeded simulation of **250,000** two-player setup sequences (seed = **0x30a1c0de**, decimal 815907038). The simulation explicitly restarts both players without incrementing either mulligan count when both lack a Basic in the same deal, then counts step-5.d executions only for one-sided failures.

| Quantity | Exact | Seeded simulation |
|---|---:|---:|
| Maximum bonus draws available to rank-1 opponent | 1.028665 | 1.026480 |
| Maximum bonus draws available to candidate | 0.082348 | 0.082652 |
| Opponent has any opportunity | 48.8166% | 48.7776% |
| Candidate has any opportunity | 7.0935% | 7.1412% |
| Neither has an opportunity | 44.0899% | 44.0812% |

Reproduction:

- [Exact model and deterministic simulation](../../../scripts/agent30-opening-mulligan-opportunity.cjs)
- [Six unit/regression tests](../../../tests/agent30-opening-mulligan-opportunity.test.cjs)
- Run: **node --test tests/agent30-opening-mulligan-opportunity.test.cjs**
- The script emits the complete machine-readable JSON report to standard output.

All six tests passed locally under Node.js 22.16.0, including exact fraction checks, pairwise rulebook outcomes, symmetry checks, the Mimikyu/Capture Energy branch, and agreement with the independent seeded simulation.

## Interpretation and limits

The five-Basic architecture pays a large opening consistency and optional bonus-draw tax against opponents with ordinary or high Basic counts. The effect is not captured by the usual statement that a player can simply mulligan until a Basic appears: the opponent can receive extra draw opportunities, and the five-Basic list usually begins with only one Basic in hand. The single Mimikyu start is partly mitigated by Capture Energy, but the initial hand has that line in only 3.2913% of valid openings.

This does **not** establish a loss rate or reject the architecture by itself. The lock may be powerful enough to justify the cost; the 44-Trainer shell may also improve post-setup access. Neither is modeled here. The result does not evaluate a complete first-turn sequence, Supporter contention, Energy attachment, Prizes, opponent choices, game outcomes, the missing Aichi lists, or the candidate's unresolved Palace Book SMP NAN25 printing normalization. Psychic Reserve v3 remains an unproven developmental challenger with zero competitively paper-qualified games. No decklist is changed or nominated by this result.

The useful next discriminant, if the architecture remains in the candidate set, is a candidate-specific turn-one setup model that adds Capture Energy, Speed Lightning Energy draw, Trainers' Mail, Tropical Beach, and Supporter/attachment sequencing to the exact initial-hand model. The current result is sufficient to flag the five-Basic structural tax; it is not a reason to start another broad matchup panel before the current V3 integration gate clears.
