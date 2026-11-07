# Exact Prize-only counterline resilience under multiple Mimikyu, Dialga-GX and Hisuian Heavy Ball copies

**Agent 21 | 7 November 2026 | exact combinatorial sensitivity.** This is a Prize-access model for one counterline, not a deck proposal, native game, matchup estimate or win-rate result. Reproducer: \`scripts/agent21-copycat-prize-access-multiplicity.cjs\`; focused tests: \`tests/agent21-copycat-prize-access-multiplicity.test.cjs\`.

## Question

Agent6's [champion Copycat Prize min-cut](agent6-champion-copycat-two-basic-prize-mincut-20261107.md) models exactly one Mimikyu GRI 58, one Dialga-GX UPR 100 and one Hisuian Heavy Ball ASR 146. How does the Prize-only access obstruction change when a candidate plays additional copies of either required Basic or the recovery Item?

## Paper text and model

The repository card pool entry \`resources/cards/en/swsh10.json\`, ID \`swsh10-146\`, states that a revealed Basic Pokémon from the face-down Prizes is put into hand and Hisuian Heavy Ball is put in its place as a face-down Prize; then the Prizes are shuffled. Each available Heavy Ball can therefore recover one Prized Basic and becomes a Prize itself. A second Heavy Ball can recover a second missing Basic role if it is outside the Prizes.

Let:

- \(m\) = Mimikyu copies;
- \(d\) = Dialga-GX copies;
- \(h\) = Hisuian Heavy Ball copies;
- \(b\) = other Basic Pokémon copies;
- \(o=60-m-d-h-b\) = all remaining non-Basic cards.

The model draws a uniform six-card Prize set, then a uniform seven-card opening from the remaining 54, conditioning on the opening containing at least one Basic. This is distributionally equivalent to the usual draw-seven-then-six-Prizes order for the unordered hand/Prize partition.

For a Prize composition with \(p_m,p_d,p_h,p_b\) copies of the four named groups:

- a Mimikyu role is missing only when \(p_m=m\);
- a Dialga role is missing only when \(p_d=d\);
- \(h-p_h\) Heavy Balls are outside Prizes;
- each missing role requires one Heavy Ball.

The Prize-only cut is therefore:

\[
\mathbf{1}\left[
\mathbf{1}(p_m=m)+\mathbf{1}(p_d=d)>h-p_h
\right].
\]

Each Prize composition is weighted by its multivariate hypergeometric probability and by the probability that the remaining 54 cards yield a legal Basic opening. The resulting cut probability is conditional on a legal initial seven.

The calculation is intentionally optimistic about the Item: every Heavy Ball outside Prizes is treated as available. It does not require the Item to be in the opening hand or actually drawn/searched. A core card outside Prizes is treated as available even if it is in discard or otherwise needs recovery. These assumptions make this a **Prize-zone-only obstruction**, not an executable counterline probability.

## Exact sensitivity with 12 other Basics held constant

Adding a core Basic replaces a non-Basic slot and increases the total Basic count. Adding Heavy Ball replaces a non-Basic slot without changing the Basic count.

| Mimikyu | Dialga-GX | Heavy Ball | Other Basics | Total Basics | Conditional Prize-only cut |
|---:|---:|---:|---:|---:|---:|
| 1 | 1 | 1 | 12 | 14 | **2.36690910%** |
| 2 | 1 | 1 | 12 | 15 | **0.94357297%** |
| 1 | 2 | 1 | 12 | 15 | **0.94357297%** |
| 2 | 2 | 1 | 12 | 16 | **0.11659566%** |
| 1 | 1 | 2 | 12 | 14 | **0.21949187%** |
| 2 | 1 | 2 | 12 | 15 | **0.06666168%** |
| 1 | 2 | 2 | 12 | 15 | **0.06666168%** |
| 2 | 2 | 2 | 12 | 16 | **0.00623487%** |

The 1/1/1 and 1/1/2 rows reproduce Agent6's existing exact outputs. An independent Python \`Fraction\` enumeration gives the exact conditional fractions:

- 1/1/1: \(139744719/5904101632\);
- 1/1/2: \(18690899/8515531200\);
- 2/1/1 with 15 Basics: \(329269864/34896067875\);
- 2/2/1 with 16 Basics: \(1981058708/1709907325875\).

### Fixed-total-Basic alternative

If a second core Basic replaces one of the other Basic Pokémon, the total Basic count stays at 14. The corresponding cuts are:

| Mimikyu | Dialga-GX | Heavy Ball | Other Basics | Total Basics | Conditional Prize-only cut |
|---:|---:|---:|---:|---:|---:|
| 2 | 1 | 1 | 11 | 14 | **0.93989290%** |
| 1 | 2 | 1 | 11 | 14 | **0.93989290%** |
| 2 | 2 | 1 | 10 | 14 | **0.11495458%** |

The difference from the 12-other-Basics table is small for these configurations. It explicitly separates duplicate access from the added-Basic opening consistency effect.

## Implication under the equal-weight 32-opponent target

Agent6's field census counts 11 Regidrago archetypes among the 32 entries (nine authenticated exact 60s and two missing original lists). Under the equal-weight mean, the 99.5% target allows only 0.16 total loss probability across all 32 matchups. Even if every other matchup were a perfect win, the Regidrago group would need at least 98.5455% average wins.

If every occurrence of this specific Prize-only cut were a loss, and the same cut probability applied to all 11 Regidrago opponents, its aggregate field-loss contribution would be:

| Configuration | Conditional cut | Field loss contribution \(11/32 \times cut\) |
|---|---:|---:|
| 1/1/1 | 2.36690910% | **0.81362500 percentage points** |
| 2/1/1 or 1/2/1 | 0.94357297% | **0.32435321 percentage points** |
| 1/1/2 | 0.21949187% | **0.07545033 percentage points** |
| 2/2/1 | 0.11659566% | **0.04007976 percentage points** |
| 2/1/2 or 1/2/2 | 0.06666168% | **0.02291495 percentage points** |

The baseline cut alone would exceed the entire 0.5% aggregate loss budget under that deliberately pessimistic assumption. A second Heavy Ball or one extra core Basic brings this isolated cut below the Regidrago group's 1.4545% maximum loss allowance if every other game is perfect. This is a **necessary-condition sensitivity**, not a prediction that the cut is an automatic loss or that the additional copy improves actual matchups.

Within the narrow model, a second Heavy Ball is the strongest one-slot change to this particular Prize-only obstruction: it reduces the cut by a factor of approximately 10.78. A second Mimikyu or Dialga reduces it by approximately 2.51. Adding both core duplicates reduces it by approximately 20.30, using two slots. The two-card and three-card combinations have even smaller modeled cuts, with correspondingly larger deck-space costs.

## Limitations and next research

- This is a rank1-reference counterline, not a proposed fixed 60. No decklist was changed.
- The model assumes every unprized Heavy Ball is accessible, ignores the exact draw/search path, and treats any core copy outside Prizes as available. It does not model the discard, board, Ability or attack requirements for Mimikyu Copycat and Dialga-GX Timeless-GX.
- It does not include Item lock, opponent counterplay, Prize-taking, mulligan compensation, turn order, Energy attachment, Bench space, or whether the counterline is the correct strategic response.
- Two Top32 Regidrago lists remain unauthenticated, and the other 30/32 opponent matchup interactions are outside scope.
- The card-slot opportunity cost is not evaluated. A second Heavy Ball could be dead, unavailable, blocked, or displace a card with more value against other archetypes.
- No native Twinleaf test, complete game, paper tournament result, or competitive qualification is contained here.

The next meaningful step is a preregistered fixed-60 comparison that treats copy-count changes as whole-deck variants and measures actual access plus competent Regidrago response in both seats. Do not infer the result from the Prize-only model. The broader objective remains unmet: 29/32 authenticated original opponent lists, zero competitively qualified games, no selected final 60, and no demonstrated 99.5% win rate.
