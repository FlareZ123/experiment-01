# Rank-1 Battle Compressor → VS Seeker response-access extension

**Agent 35 · 17 November 2026**

## Decision

The existing rank-1 first-turn-KO access calculation omits a real Supporter-recovery route. Rank 1's published 60 contains Battle Compressor ×1, VS Seeker ×3, Teammates ×1, Raihan ×1, and Field Blower ×1. If the candidate goes second and Knocks Out one of rank 1's Pokémon on its first turn, rank 1 can use Teammates or Raihan on its next turn. Battle Compressor can put a Supporter into the discard pile and VS Seeker can return it to hand.

The exact paired-mulligan calculation raises the existing direct Field Blower / direct Teammates-Raihan response-access baseline from **35.668392889%** to **38.389926013%** when adding the Battle Compressor → VS Seeker → Teammates route. If the same recovery route can instead retrieve Raihan and its Basic-Energy attachment requirement is payable, the optimistic union is **38.724342683%**.

This is an omitted access route, not a new matchup result. It does not change the Hood 60, either frozen policy, or the V3 acceptance/first-trace stopline.

## Source facts

The published rank-1 champion list in [benchmark-shadow-rider.md](../benchmark-shadow-rider.md) contains:

| Card | Copies |
|---|---:|
| Field Blower | 1 |
| Battle Compressor | 1 |
| VS Seeker | 3 |
| Teammates | 1 |
| Raihan | 1 |
| Basic Pokémon | 14 |

The repository card database confirms the relevant effects:

- xy4-92 Battle Compressor: search the deck for up to three cards and discard them.
- xy4-109 VS Seeker: put a Supporter card from the discard pile into the hand.
- xy5-141 Teammates: playable only if one of the player's Pokémon was Knocked Out during the opponent's last turn; search the deck for up to two cards.
- swsh7-152 Raihan: playable only if one of the player's Pokémon was Knocked Out during the opponent's last turn; attach a Basic Energy from the discard pile, and if that happens search the deck for a card.

Sources: [rank-1 list](../benchmark-shadow-rider.md), [XY4 card data](../../../resources/cards/en/xy4.json), [XY5 card data](../../../resources/cards/en/xy5.json), and [Evolving Skies card data](../../../resources/cards/en/swsh7.json).

## Scenario and estimand

This calculation is conditional on the specific branch already used in Agent43's report:

1. The candidate is the 14-Basic Hood Shield list and goes second.
2. Rank 1 takes its first turn.
3. The candidate takes its first turn and Knocks Out one of rank 1's Pokémon.
4. Rank 1 takes its second turn. The KO from the immediately preceding turn now enables Teammates and Raihan.
5. Rank 1 has taken two normal draws, plus any optional mulligan-bonus cards awarded under the paired-opening model.

The output is the probability that the named resources can be accessed by rank 1's response turn, conditional on both players having valid opening sevens and on the first-turn-KO branch. It is **not** the probability of the KO itself, a successful Field Blower play, a Hood removal, or a game win.

## Exact enumeration

The standard-library script [agent35-rank1-battle-compressor-vs-seeker-response-access-20261117.py](agent35-rank1-battle-compressor-vs-seeker-response-access-20261117.py) enumerates the seven distinguished non-Basic cards (Field Blower, Battle Compressor, three individual VS Seeker copies, Teammates and Raihan) across opening hand, six Prizes, response-turn draws and the remaining deck.

For each assignment, the remaining 53 cards comprise 14 Basics and 39 other non-Basics. The number of valid opening completions is:

\[
\binom{53}{7-o}-\binom{39}{7-o},
\]

where \(o\) is the number of distinguished cards assigned to the opening hand. Prize and draw completions are then counted with exact binomial coefficients. The full zone-assignment weights are asserted to equal the sample-space denominator for every draw count.

The script reuses the paired-mulligan distribution with 14 Basics in both lists, integrates the opponent's optional bonus cards through \(K_{\max}=10\), and reports the remaining tail as a rigorous interval. The tail mass is only \(3.182047713\times10^{-10}\). The baseline is regression-checked against Agent43's existing 35.668392889% result.

### Event definitions

- **Baseline:** Field Blower is directly seen, or Field Blower is not Prized and Teammates/Raihan is directly seen. The Raihan branch retains the existing report's condition that its Basic-Energy attachment requirement is payable.
- **BC/VS → Teammates:** Field Blower and Teammates are not Prized, and at least one Battle Compressor and one VS Seeker are seen by the response turn. If Teammates remains in the deck, Battle Compressor can discard it; VS Seeker can recover it. If Teammates is already in the discard pile, VS Seeker can recover it; if it is in hand, the direct baseline already covers it.
- **BC/VS → either Supporter:** the same route may recover Teammates or Raihan. The Raihan-inclusive event is conditional on its Basic-Energy attachment requirement being payable at resolution.

The opponent can hold Battle Compressor until the response turn, or use it earlier to place the relevant Supporter in the discard pile and recover it later. Battle Compressor can discard up to three cards, so the Teammates route requires one discard target; the Raihan route can require Raihan plus a Basic Energy. VS Seeker must be available by the time the Supporter is needed.

The model assumes the opponent preserves Field Blower in hand/deck rather than spending or discarding it for another purpose, and can reserve BC/VS Seeker for this response. It does not model competing uses, a prior expenditure of all VS Seekers, or the exact Energy-zone sequence for Raihan.

## Results

All values are conditional on the scenario above and both valid opening sevens. Intervals include the unenumerated paired-mulligan tail.

| Access event | Probability |
|---|---:|
| Existing direct Field Blower or direct Teammates/Raihan baseline | 35.668392889–35.668392921% |
| BC/VS enabling condition for Teammates (overlaps baseline) | 4.131461082–4.131461114% |
| BC/VS enabling condition for either Supporter (Raihan payable; overlaps baseline) | 4.576994464–4.576994496% |
| **Union: baseline plus BC/VS → Teammates** | **38.389926013–38.389926045%** |
| **Union: baseline plus BC/VS → either Supporter (Raihan payable)** | **38.724342683–38.724342714%** |

The net increase beyond the existing baseline is **2.721533124 percentage points** for the Teammates-only extension, or **3.055949793 percentage points** if the Raihan recovery condition is also payable. The BC/VS enabling-event rows overlap the baseline and must not be added directly to it.

The result is an exact combinatorial calculation for the stated access events, not a confidence interval or Monte Carlo estimate. The tiny displayed interval is solely the residual mulligan-tail bound.

## Strategic interpretation

1. The existing 35.668393% direct/Supporter figure is not the complete rank-1 response envelope after a candidate first-turn KO. The opponent's Battle Compressor and three VS Seekers create a recoverable Teammates line even when Teammates was not naturally drawn.
2. The opponent's first turn does not need to use its Supporter. It can use Item cards such as Battle Compressor and VS Seeker, recover Teammates to hand, and play the Supporter on its next turn once the KO condition is met.
3. This makes Battle Compressor a deliberate Supporter-enabling action, not merely generic deck thinning. A rank-1 policy should consider BC/VS/Teammates and the conditional Raihan line when evaluating whether a Field Blower response remains available.
4. This does not invalidate the one-Hood-at-a-time reserve heuristic. Rank 1 still has one Field Blower; the new route raises access to that copy, not the number of removal copies. The candidate should not expose both Hoods to the same Field Blower unless the board state requires it.
5. Do not avoid a favorable first-turn Knock Out solely because it enables Teammates/Raihan. Prize value, tempo, board state and the opponent's actual access must be evaluated together in a competent policy.

The separate Forest Seal Stone + Shadow Rider V route in [Agent43's paired-mulligan access report](agent43-paired-mulligan-adjusted-hood-access-20261117.md) is not added to these figures. The route probabilities overlap, and this report does not estimate a combined union with Star Alchemy, prior use, or other competing actions.

## Limitations and disposition

- The calculation is conditional on a candidate first-turn KO; it does not estimate how often that branch occurs.
- It assumes Field Blower is retained, and Battle Compressor/VS Seeker are not spent on competing lines.
- The Teammates-only extension does not require Raihan's Energy effect. The Raihan-inclusive extension is conditional on a payable Basic-Energy attachment from the discard pile; this script does not enumerate Energy zones.
- It does not establish that rank 1 will choose or successfully execute the line, remove a Hood, or win a game.
- It does not model the opponent's actual policy, candidate policy, board state, Tool attachment timing, or any other response route.
- It does not include the separate Forest Seal Stone route in the same union.

**Disposition:** add BC/VS recovery to the rank-1 opponent response-access model and to future policy requirements. Preserve the fixed 60 and all V3 freezes. No candidate, policy, fixture, workflow or CI change follows from this result.
