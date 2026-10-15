# Exact Radiant Eternatus opening and Prize access

**Agent 7, 15 October 2026.** Mathematical availability analysis on the 60-card [rank-1 Shadow Rider Calyrex reference](benchmark-shadow-rider.md), with independently executable [source](../../scripts/prize_opening_exact.py) and [exhaustive small-deck tests](../../tests/test_prize_opening_exact.py). These are exact finite-population probabilities, **not** simulations or win-rate estimates.

## Tactical line

Radiant Eternatus's *Climactic Gate* is triggered when played **from hand onto the Bench during the turn**; its effect can put up to two Pokémon VMAX from the deck onto the Bench and ends that player's turn when used. A Radiant Eternatus already put into play during setup, or forced into the Active Spot as the only opening Basic, cannot perform that immediate Bench-entry line. For the narrow direct line here, at least one of the **other 13 ordinary Basics** must occur among the original seven cards, and Radiant Eternatus must be in those seven or the normal first-turn draw.

In the reference list there are **14 Basic Pokémon total**, including exactly one Radiant Eternatus, and **4 Shadow Rider Calyrex VMAX**. We additionally require at least **two VMAX still in the deck** after the opening hand, normal first-turn draw, and six Prize cards are removed. We assume the player chooses a different Basic as Active, can hold Radiant Eternatus in hand through setup, and leaves two Bench spaces free. These are availability conditions; using the Ability ends the turn and may be strategically inferior to another line.

## Exact results

| Event | Unconditional shuffled setup | Conditional on accepted seven-card opening |
| --- | ---: | ---: |
| Seven-card opener contains any Basic | 86.140932% | 100% |
| Radiant in opening seven or normal first draw, with another opening Basic | 10.646505% | 12.359403% |
| Above, with at least two VMAX in the post-Prize deck | 10.352279% | **12.017840%** |

A direct Bench-entry opportunity is consequently present in about 12.36% of accepted openers; 12.02% have two VMAX targets physically searchable at that moment. A missed opportunity says nothing about drawing or searching Radiant later in the turn.

### VMAX-count sensitivity

Keeping all **13 non-Radiant Basics** and the rest of the 60 cards as undifferentiated fillers, and conditioning on a legal opener:

| Shadow Rider VMAX copies | Direct two-VMAX Gate probability |
| ---: | ---: |
| 2 | 7.599754% |
| 3 | 10.969951% |
| 4 | 12.017840% |

The fourth VMAX increases this narrow event by about **1.047889 percentage points** relative to three. The opportunity cost of its deck slot, attacks, Prize risk and matchups must be investigated before inferring an optimal copy count. The deck-construction maximum for that name is four.

## Method and correctness

Let `B=13` be the other Basic count, `V=4` the VMAX count, and `R=1` the unique Radiant. Sample the eight unordered seen cards (seven-card opener plus one normal draw), conditioned on containing `R`. If `b` other Basics and `v` VMAX are in those eight, their exact hypergeometric weight is

`C(B,b) * C(V,v) * C(59-B-V, 7-b-v) / C(60,8)`.

The probability at least one of the `b` other Basics was among the **first seven** is `7/8` for `b=1`, and `1` for `b>=2`. All `b=0` cases fail this direct line. For each case, sum a second hypergeometric probability over target VMAX Prized from the 52 cards remaining after those eight are set aside; require `V - v - prized >= 2`. By random permutation exchangeability, drawing the turn card before sampling the Prize subset gives the same joint distribution as real play, where Prizes are set first. Finally divide by `1 - C(46,7)/C(60,7)` for the valid-seven-card-opener condition. Calculation uses exact `fractions.Fraction`, not Monte Carlo rounding.

Tests independently enumerate all opening, Prize and first-draw combinations for a ten-card miniature deck. The resulting three probabilities agree **exactly as rational numbers** with the hypergeometric implementation. A separate exhaustive test verifies the singleton/prize formula.

## Co-Prizing a singleton and all designated rescue cards

An independent static bottleneck: for a unique critical card and `g` distinct designated rescue copies in a 60-card deck with six Prizes, the chance **all `g+1` cards** are Prized is

`C(59-g, 5-g) / C(60,6)`.

| Rescue copies `g` | All critical and rescue copies Prized |
| ---: | ---: |
| 0 | 10.000000% |
| 1 | 0.847458% |
| 2 | 0.058445% |
| 3 | 0.003076% |

This abstract example speaks to the *Gladion*-style singleton-rescue discussion in `resources/human_concepts.md`. It **does not** mean a rescue card is always reachable or playable, or that a Prized critical card inevitably costs the match. More complicated multi-Prized failures need to include the connecting cards, effects, Supporter contention, prizes taken and opposing disruption.

## Scope and next uses

- Accounts for finite-deck sampling, order of the first seven versus eighth card, mulligan acceptance, and jointly occupied Prize and hand zones.
- Excludes opponent mulligans/bonus draws, additional first-turn draw or search, cards played before Gate, evolution, tactical choices, opponent turn-one locks, and tournament rule differences. It is not the probability of actually resolving Gate successfully against all opponents.
- Does not certify the Japanese printing, legal status, or exact engine implementation of a named card. The source is the event reference and the bundled English card snapshot; Japanese rulings require separate verification.
- The reusable exact machinery should inform deck-slot tradeoffs and provide unit-test oracles for full-game simulation, where gameplay strength can eventually be measured.
