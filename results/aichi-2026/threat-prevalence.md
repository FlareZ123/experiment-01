# Aichi published-field lock and gust exposure

Agent 5, 15 October 2026. This is a decklist census and a testing hypothesis, not a matchup result.

Source: [29 published Aichi 2026 Top 32 lists](full-decklists.json), transcribed from [Limitless](https://www.limitlesstcg.com/tournaments/566/decklists). Exact lists at ranks 23, 25 and 28 are missing. Copy counts below are summed by card name across published lists; duplicated printing rows are preserved by the [audit implementation](../../scripts/field_threat_audit.cjs). [Regression tests](../../tests/field_threat_audit.test.cjs) passed in [manual CI](https://github.com/FlareZ123/experiment-01/actions/runs/38819765338).

## Observations

| Card | Lists (of 29) | Total copies |
| --- | ---: | ---: |
| Guzma | 25 | 48 |
| Budew | 14 | 19 |
| Dedenne-GX | 18 | 22 |
| Tapu Lele-GX | 18 | 20 |
| Iron Thorns ex | 3 | 12 |
| Garbodor | 4 | 9 |
| Vileplume | 2 | 5 |

All **14 Budew lists** also include Guzma. All **nine published Regidrago** decks have both cards, with the other two Regidrago lists unpublished. Three of four Absol Garbodor decks carry Budew. Fifteen lists carry both Dedenne-GX and Tapu Lele-GX.

The local English card snapshot identifies the event's ASC 16 Budew as `me2pt5-16`. Its zero-Energy Itchy Pollen attack deals 10 damage and restricts Item-card plays from the opponent's hand on their next turn. BUS 115 Guzma (`sm3-115`) provides an opposing Bench-target switch followed by a switch of the player's Active Pokémon. These texts require Japanese Expanded legality and errata verification for any eventual simulation claim.

## High-priority conditional line

`Guzma -> select an opposing Benched target -> promote own Benched Budew -> Itchy Pollen`

This sequence is a **hypothesis for a gust-plus-Item-lock turn** when turn permissions, both Benches and the attack all permit it. Co-occurrence alone does not establish that it is playable in a given state. A playing policy that ignores this conditional line may substantially underrepresent the threat. Test the action ordering and restrictions explicitly in Twinleaf before relying on opponent simulations.

The rulebook distinguishes Items, Supporters and Pokémon Tools. When an Item lock is effective, evaluate actual surviving search and setup lines; do not represent the lock as a generic penalty to deck connectivity.

## Raw-hand combinatorics

For a random seven-card opening hand from 60 cards, the probability of including at least one of a particular singleton Budew is **11.66667%**; with two copies it is **22.14689%**. Nine Budew decks use one copy and five use two. Their equal-deck-weighted average probability is **15.40960%**. Across all 29 published lists, the corresponding average is **7.43912%**.

These are opening hand probabilities, not probabilities of executing the attack. They omit Prize composition, mulligan conditioning, subsequent draws, search, switching and opponent choices.

**Next validation:** reproduce the Budew Item restriction, the possible Guzma-to-Budew attack sequence, and the effects of Ability/Supporter locks in legal game states. Assess candidates using both Item-locked and unrestricted opponent turn simulations.
