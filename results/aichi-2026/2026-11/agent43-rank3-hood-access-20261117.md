# Rank-3 Hood escape: exact natural-draw resource access

**Agent 43 · 17 November 2026**

## Decision-relevant result

The published rank-3 Snorlax Block line in Agent17's [escape synthesis](agent17-rank3-arven-fieldblower-hood-escape-20261117.md) has a mechanically valid Arven → Field Blower + Stealthy Hood route, but the prior report correctly left source-dealt access unquantified. This note fills that narrow gap with an exact, reproducible draw-zone enumeration.

For the fixed Hood Shield Shadow Rider v1 60, conditional on a valid opening seven (at least one Basic):

| Candidate's timing | Direct Field Blower + Hood in hand | Arven available with targets outside Prizes | Combined route-resource access |
|---|---:|---:|---:|
| First own turn, going second; opponent cannot yet play a Supporter | 2.723344% | 11.358399% | **13.819413%** |
| Second own turn, no Eri interference | 3.521256% | 12.850318% | **15.969682%** |
| Second own turn, Eri worst-case | 0.411393% | 11.217479% | **11.581545%** |

The component columns overlap; the final column is their union. Exact combined conditional fractions:

- First own turn: `103558087507 / 749366745600`
- Second own turn, no Eri: `59835742837 / 374683372800`
- Second own turn, Eri worst-case: `86788245547 / 749366745600`

The model's valid-opening probability is **86.140932%**, matching the candidate's existing opening-hand analysis.

## Model and timing

Candidate inventory, from the fixed v1 list:

- Arven SVI 166 ×1
- Field Blower GRI 125 ×1
- Stealthy Hood UNB 186 ×2
- Starting-eligible Basic Pokémon ×14
- Other cards ×42

The exact 60 is partitioned into those five categories. The model enumerates all category compositions for the opening seven, six Prizes, and the first two normal draws, weighting each state by its multivariate-hypergeometric multiplicity. It conditions on at least one Basic in the opening seven.

The escape-resource event is true when:

1. Field Blower is not Prized;
2. at least one Hood is not Prized; and
3. either Arven is in hand (so it can search whichever target remains in the deck) or Field Blower and a Hood are both already in hand and can be played directly.

This treats Arven's Item-plus-Tool search as a source-text fact. It does not require Arven to find a target already in hand.

**First own turn, going second:** the opponent went first and cannot play a Supporter on that first turn, so Eri cannot yet have been used. The candidate has seen its opening seven plus one normal draw and may play Arven.

**Second own turn, going first:** the opponent goes second and may play Eri on its first turn before the candidate's second turn. The conservative Eri case assumes Eri resolves and discards Field Blower if it is in the candidate's hand at that moment. Arven (a Supporter) and Hood (a Pokémon Tool) are not legal Eri discards. Field Blower survives this model only if it remained in the deck through Eri or is drawn on the candidate's second turn. The model then tests whether Arven is in hand or whether the newly drawn Field Blower and a Hood are directly in hand.

## Interpretation

These percentages measure only the availability of the named resource package under the stated randomization model. They are **not** probabilities of completing the retreat, attacking, winning a game, or winning the matchup. They do not change the fixed 60 or qualify any game.

The model omits access through Mysterious Treasure, Fog Crystal, Quick Ball, Tapu Lele-GX's Wonder Tag, Forest Seal Stone, draw Supporters, and other draw/search effects. It also omits whether Arven is otherwise consumed, whether the retreat cost is payable, the opponent's actual Eri access/choice, later Faba recovery, Plumeria/Team Flare Grunt Energy denial, Tool removal, attack sequencing, and the rest of the game. Because helpful search and adverse board/response constraints are both omitted, the numbers are not a lower or upper bound on real escape success.

The Eri-worst-case figure is conditional on Eri resolving before the candidate's second turn; it is not weighted by the opponent's probability of drawing or choosing Eri. The no-Eri second-turn figure is a comparison case, not an estimate of the opponent's behavior.

## Actionable policy implication

The resource ordering already identified in Agent17's synthesis is numerically important: when anticipating Eri, keep the single Field Blower in the deck rather than exposing it in hand before the opponent's Eri turn; Arven can then fetch Field Blower and Hood together after Eri. A Hood already in hand is safe from Eri, but Arven can search it only while a copy remains in the deck. This is a resource-preservation rule, not a new policy implementation or a guarantee that the line is reachable.

## Reproduction

Run the standard-library script:

`python3 results/aichi-2026/2026-11/agent43-rank3-hood-access-20261117.py`

It asserts the exact denominator against

`(C(60,7) - C(46,7)) × C(53,6) × 47 × 46`

and prints the conditional probabilities, component overlap, and exact fractions. The computation is exhaustive over category allocations; it uses no Monte Carlo sampling or external dependencies.

**Evidence classification:** deck counts and printed card types = source facts; route logic = printed-effect inference; probabilities = exact combinatorial calculation under the stated assumptions; actual source-dealt escape and matchup performance = untested. No win-rate or 99.5% claim follows.
