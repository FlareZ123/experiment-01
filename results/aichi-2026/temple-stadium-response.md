# How quickly the three Iron Thorns lists can replace Temple of Sinnoh

**Agent 11, 15 October 2026.** This is an exact restricted opening-access model, with [source-code enumeration](../../scripts/aichi_stadium_response.py), [unittests](../../tests/test_aichi_stadium_response.py), and [successful manual CI 38821770822](https://github.com/FlareZ123/experiment-01/actions/runs/38821770822).

## Source and motivation

The [published full-decklist manifest](full-decklists.json) contains three Iron Thorns ex decks at ranks 6, 24 and 29. Each contains exactly four Basic Iron Thorns ex, two Tag Call, and two Guzma & Hala. Their Stadium inventories, as printed in the source, are:

| Rank | Stadium inventory | Total Stadiums |
| --- | --- | ---: |
| 6 | 1 Tropical Beach, 1 Player's Ceremony, 1 Thunder Mountain Prism Star, 1 Wondrous Labyrinth Prism Star | 4 |
| 24 | 2 Player's Ceremony, 1 Thunder Mountain Prism Star, 1 Wondrous Labyrinth Prism Star | 4 |
| 29 | 2 Tropical Beach, 1 Player's Ceremony, 1 Thunder Mountain Prism Star, 1 Wondrous Labyrinth Prism Star | 5 |

A player can play a different-name Stadium to replace Temple of Sinnoh. Guzma & Hala searches the deck for a Stadium without requiring its optional two-card discard; Tag Call searches for a TAG TEAM card, including Guzma & Hala. These card texts appear in the bundled English card database. Stadium replacement is governed by the advanced player's rulebook, section B-04.

## Exactly counted conditional opening access

The enumeration uniformly samples an initial seven-card hand, then six facedown Prize cards, then the first turn draw, all without replacement. It conditions on the starting hand containing at least one of the four Iron Thorns ex, consistent with a playable starting hand. The model checks whether a Stadium is directly in hand or whether the player can play Guzma & Hala from hand, or obtain it with Tag Call, and then retrieve an unprized Stadium from the deck.

| Access route | Ranks 6, 24 (four Stadiums) | Rank 29 (five Stadiums) |
| --- | ---: | ---: |
| Stadium in valid seven-card opening hand | 36.3970% | 43.5136% |
| Stadium in hand after first turn draw | 41.1972% | 48.8425% |
| Additional Guzma & Hala-from-hand route | 14.4214% | 12.7690% |
| Additional Tag Call to Guzma & Hala route | 11.1488% | 9.8209% |
| **Any modeled Stadium replacement route** | **66.7674%** | **71.4324%** |
| No modeled route | 33.2326% | 28.5676% |

Routes are deliberately disjoint in the table: a direct Stadium takes precedence, then a direct Guzma & Hala, then Tag Call. The six Prize cards are modeled jointly with the opening hand and turn draw, so a connector does not count as a successful search if its target is entirely Prized.

The starting-hand validity probability itself is 39.94996%, because four Basic Pokémon are present in a 60-card list. The conditional percentages above do not include potential bonus cards taken from opponent mulligans.

## Interpretation

**A Temple of Sinnoh inclusion is unlikely to be a self-sufficient, enduring offensive lock against Iron Thorns.** All three lists have multiple ways to replace it. Under the restricted card-access model, roughly two-thirds or more of valid openings offer a Stadium replacement path by the first turn draw when the opponent may use a Supporter and Items. Whether that path is actually optimal or executable in a match depends on the game state.

This is **not** a measured rate of successfully replacing Temple. The model excludes draw effects, Trainers' Mail, other search connectors, prior card use, hand disruption, Item lock, Supporter lock, Stadium protection, the opponent's actions, and stadiums that may already have been spent. It assumes the player has its usual Stadium play available and has not used a Supporter, and that all permitted routes can be sequenced. No win-rate inference is supported.

The conditional timing matters. A player acting on their first turn going first ordinarily cannot use a Supporter; the direct Stadium-in-hand row is the relevant included route in that case. Tag Call access by itself cannot bypass that restriction. A first-turn opponent acting second may use the modeled Guzma & Hala routes if not locked.

One especially relevant limitation: rank 7 Snorlax Stall is also Special-Energy-only, but a control deck may progress through Abilities and Trainer effects without attacking. Source-list Energy composition alone cannot classify practical vulnerability.

## Follow-up experiments

- Verify Temple's effects on Speed Lightning Energy and Iron Thorns's Lightning attack requirements under exact Twinleaf game states.
- Test Stadium replacement and the Item/Supporter access channels independently, including cases where a Stadium or Guzma & Hala is Prized.
- Sample realistic opening and opponent-response traces with the actual lists and competent policies. Record the fraction of turns Temple stays in play and the resulting actual attack availability.
- Compare a fixed candidate with and without Temple against all 29 published opponents in both seats, including Basic-only lists, to test opportunity cost. Preserve unobserved ranks 23, 25 and 28.

**Evidence status:** mathematically exact under the explicitly limited opening-search model, checked against source deck counts and deterministic tests. This neither certifies a competitive policy nor advances a measured 99.5% game-win claim.
