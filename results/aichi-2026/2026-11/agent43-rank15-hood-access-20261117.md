# Rank-15 Vileplume: natural access to the Hood counterline

**Agent 43 · 17 November 2026**

## Decision-relevant result

Agent17's rank-3/rank-15 cross-field synthesis identifies an important rules distinction: Vileplume AOR3 blocks Item cards from hand, but Pokémon Tools are a separate Trainer type. Stealthy Hood can therefore still be attached after the Item lock is active; Arven is a Supporter and can still be played to search for a Tool. Hood does **not** turn off AOR3's global Item restriction. Its separate role is to protect an attached Pokémon from Ability effects such as Vileplume BUS6's Disgusting Pollen attack restriction on Basic Pokémon.

I quantified the fixed Hood Shield v1 list's natural-draw access to one or both Hoods, using Arven as the only search effect:

| Access event | By first own turn | By second own turn |
|---|---:|---:|
| At least one Hood directly in hand | 24.115761% | 27.034385% |
| Arven in hand and at least one Hood outside Prizes | 12.659160% | 14.321710% |
| **At least one Hood accessible** (union) | **34.051576%** | **37.834840%** |
| Both Hoods accessible (both in hand, or one in hand plus Arven able to search the other) | **3.718283%** | **4.786895%** |

The direct and Arven events overlap. Exact combined fractions:

- At least one Hood by first turn: `10206847619 / 29974669824`
- At least one Hood by second turn: `1890144723 / 4995778304`
- Both Hoods by first turn: `163903397 / 4408039680`
- Both Hoods by second turn: `2391426581 / 49957783040`

The model's valid-opening probability is **86.140932%**, matching the candidate's existing 14-Basic calculation.

## Rules and source-list context

The rank-15 60 in `results/aichi-2026/full-decklists.json` is Lopunny Vileplume and contains Vileplume AOR3 ×2, Vileplume BUS6 ×1, Stealthy Hood ×2, and no Field Blower, Megaton Blower or Faba. The fixed candidate contains Arven ×1, Stealthy Hood ×2 and 14 starting-eligible Basics.

The local Advanced Players' Manual B-02 distinguishes Items from Pokémon Tools, including older Tools that were printed with the word “Item” above their text. C-19 illustrates that an Item-only restriction differs from an effect that explicitly blocks both Item cards and Pokémon Tool cards. Therefore:

- AOR3's “can't play any Item cards from hand” does not prevent attaching Stealthy Hood.
- Arven remains a playable Supporter during AOR3's lock. It can search for a Tool and an Item; the Item may remain unplayable while the lock persists, but the Hood can be attached.
- Hood does not cancel AOR3's global Item restriction. Its Ability protection matters separately against BUS6's Ability-based Basic-Pokémon attack restriction.
- The rank-15 report notes that the candidate gets at least one turn before AOR3 can be established. The second-turn resource figure is still relevant if the candidate has to wait: Arven and Hood remain usable after the Item lock.

## Model

Candidate inventory is grouped as Arven ×1, Hoods ×2, Basics ×14 and other cards ×43. The model enumerates all category compositions for the opening seven, six Prizes and first two normal draws, weighting each state by its multivariate-hypergeometric multiplicity. It conditions on at least one Basic in the opening seven.

At least one Hood is accessible when either:

1. a Hood is already in hand; or
2. Arven is in hand and at least one Hood is not Prized, so Arven can search a Tool from the deck.

Both Hoods are accessible only when both are already in hand, or one is in hand and Arven can search the other from the deck. If both Hoods remain in the deck, one Arven can search only one of them.

## Interpretation and limits

This is a natural-draw resource baseline, not a matchup probability. It omits access through Forest Seal Stone, Tapu Lele-GX, Mysterious Treasure, Fog Crystal, Quick Ball, draw Supporters and other effects. It also does not model whether Mimikyu is in play, the exact turn Vileplume becomes Active, the opponent's own Hoods, or subsequent attack sequencing. It is not a lower or upper bound on actual Hood establishment or game success.

The main practical point is that one Hood is substantially more accessible than two. For the Vileplume line, prioritize a single Hood on the Pokémon that needs protection from BUS6's Ability; do not spend resources trying to establish both Hoods merely because the deck contains two. Arven remains a live route after the Item lock. No deck, policy, fixture or CI change follows from this calculation.

## Reproduction

Run:

`python3 results/aichi-2026/2026-11/agent43-rank15-hood-access-20261117.py`

The standard-library enumerator asserts its denominator against

`(C(60,7) - C(46,7)) × C(53,6) × 47 × 46`

and prints the component probabilities, unions and exact fractions. No Monte Carlo sampling or external dependency is used.

**Evidence classification:** deck counts = normalized source-list facts; Item/Tool distinction = local rulebook fact; Arven/Hood sequence = printed-effect inference; percentages = exact combinatorial calculation under stated assumptions; source-dealt line and matchup performance = untested. No win-rate or 99.5% claim follows.

 
**Correction (Agent17, 17 November 12:11 UTC):** the initial both-Hoods predicate incorrectly counted a state with one Hood in hand and the second Hood in Prizes as searchable by Arven. The one-in-hand + Arven branch now requires zero Hoods in Prizes; at-least-one-Hood access is unchanged. Corrected exact both-Hoods values are **3.71828315756%** by the first own turn and **4.78689492503%** by the second. See the correction handoff at communications/agent43/2026-11/20261117T1210Z_agent17_rank15_two_hoods_prize_guard.md.
