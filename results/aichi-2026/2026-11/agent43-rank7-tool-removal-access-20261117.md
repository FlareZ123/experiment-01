# Rank-7 Snorlax: natural access to Tool-removal responses

**Agent 43 · 17 November 2026**

## Decision-relevant result

Agent17's [rank-7 resource-war synthesis](agent17-rank7-snorlax-megaton-blower-hood-resource-war-20261117.md) correctly identifies four named answers to the candidate's Stealthy Hood package: Faba ×2, Field Blower ×1 and Megaton Blower ×1. I quantified how often at least one of those cards is naturally in the opponent's hand by the first turn on which it can respond to an attached Hood.

Conditional on rank 7 having a valid opening seven (12 Basic Pokémon), six Prizes and natural draws only:

| First response window | Faba ×2 in hand | Field Blower ×1 in hand | Megaton Blower ×1 in hand | At least one named remover |
|---|---:|---:|---:|---:|
| Opponent goes second; one normal draw | 23.915589% | 12.659263% | 12.659263% | **42.738824%** |
| Opponent goes first; two normal draws | 26.841912% | 14.338892% | 14.338892% | **47.143530%** |

The component events overlap; the final column is the union. Exact union fractions:

- After one draw: `80458877 / 188257113`
- After two draws: `29583683 / 62752371`

Rank 7's valid-opening probability under the 12-Basic inventory is **80.935331%**.

## Timing and inventory

The original rank-7 60 in `results/aichi-2026/full-decklists.json` contains 12 Pokémon, all Basic, including Snorlax ×2, Wobbuffet ×3 and Mimikyu ×3. Relevant removal counts are Faba ×2, Field Blower ×1 and Megaton Blower ×1. The list also has VS Seeker ×3 and Lusamine ×2, which can extend the Faba resource war after the initial response; recovery is not included in this calculation.

- **Candidate goes first:** it may attach Hood on its first turn. The opponent goes second and can use either Items or Faba on its first turn. The response window is opening seven plus one normal draw.
- **Candidate goes second:** the opponent goes first before Hood is attached. Its first turn is not a response to Hood; after the candidate attaches Hood on its first turn, the opponent's second turn is the first response window. The opponent has seen opening seven plus two normal draws, and Faba is now playable.

All four named removers can affect an attached Pokémon Tool under the stated board conditions: Field Blower discards up to two Tools/Stadiums, Megaton Blower discards all Pokémon Tools and Special Energy attached to the candidate's Pokémon, and Faba can put an attached Tool into the Lost Zone.

## Candidate-side comparison

The candidate's corresponding natural-draw access to Arven + Field Blower + at least one Hood is **13.819413%** by its first own turn when going second and **15.969682%** by its second own turn when going first without Eri interference; see the [rank-3 access calculation](agent43-rank3-hood-access-20261117.md). Rank 7 has no Eri, so the no-Eri candidate figures are the relevant narrow baseline here.

The comparison shows why the rank-7 line should be treated as an immediate escape, not a durable two-Hood lock: the opponent naturally sees at least one named response card substantially more often than the candidate naturally sees the full escape package. These are different resource-access events, not direct matchup odds.

## Limits and operational implication

The model enumerates the opening seven, six Prizes and one or two normal draws exactly, conditioning on at least one Basic in the opening hand. It assumes independent shuffles, no mulligan-bonus cards, no additional draw/search effects, and that any named remover drawn is retained until the candidate's Hood is attached.

It does **not** model whether the opponent spends Field Blower or Megaton Blower on another Tool/Stadium before the Hood appears, whether Faba is used on another target, whether the candidate has actually attached Hood or already escaped, the effect of VS Seeker/Lusamine recovery, or later game decisions. It measures response-card availability, not successful Tool removal, match outcome, or win rate. Because both prior spending and later recovery are omitted, it is not a lower or upper bound on actual removal success.

The practical implication is consistent with Agent17's synthesis: use Arven → Field Blower + Hood to secure the immediate Snorlax/Tool Jammer escape when available, but do not count either Hood as lasting protection against this opponent's four-card removal package. Keep the second Hood as a reserve rather than attaching both without a board-specific reason. No deck, policy, fixture or CI change follows from this result.

## Reproduction

Run:

`python3 results/aichi-2026/2026-11/agent43-rank7-tool-removal-access-20261117.py`

The standard-library enumerator asserts its denominator against

`(C(60,7) - C(48,7)) × C(53,6) × 47 × 46`

and prints the response probabilities, component overlap and exact union fractions. No Monte Carlo sampling or external dependency is used.

**Evidence classification:** deck counts = normalized source-list facts; printed removal effects = card-text facts; percentages = exact combinatorial calculation under stated assumptions; actual removal decisions and matchup performance = untested. No win-rate or 99.5% claim follows.
