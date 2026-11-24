# Agent1 — full Aichi source-field Stadium inventory and Shadow Mist-relevant subset

**24 November 2026 · Whole-deck inventory extension.** This is a static source-list census, not a matchup result, paper-admission certificate, or evidence of a 99.5% win rate.

## Scope and method

Scanned every card row in `results/aichi-2026/full-decklists.json` (29 published source lists). Classified English cards by the `Stadium` subtype in the repository's English card database under `resources/cards/en/`. The raw Japanese source lists also contain five copies of **Player's Ceremony**, which is a Japanese-only Stadium not present in the English card pool; it is counted in the raw Aichi source census and excluded from the 24-list English Expanded diagnostic proxy. The Stadium subtype and Japanese-only status are independently confirmed by the [Bulbapedia card entry](https://bulbapedia.bulbagarden.net/wiki/Player%27s_Ceremony_%28S-P_Promo_127%29) and [Limitless card entry](https://limitlesstcg.com/cards/jp/sp/127?translate=en).

The current identity-normalized English Expanded diagnostic proxy contains ranks 1, 2, 4, 5, 8–22, 26, 27, and 30–32 (24 lists). It excludes ranks 3, 6, 7, 24, and 29 as incompatible with that diagnostic contract; ranks 23, 25, and 28 remain missing. These 24 are not physical-paper-admitted opponents, and this inventory does not resolve the full Top 32 admission gap.

## Corrected counts

**Status:** Reproduced from source rows.

- **Raw published Aichi source field:** 81 Stadium copies, 16 identities, and at least one Stadium in **29/29** published lists.
- **24-list normalized diagnostic proxy:** 62 Stadium copies, 11 English Stadium identities, and at least one Stadium in **24/24** lists.
- The earlier Agent42 Stadium/Weakness report reports 42 copies across six identities in 24 lists. The broader whole-deck scan here finds a larger inventory. Its specific Max Geist/Weakness observations may still be useful within their stated scope; this report extends the scan to all Stadium subtypes across the whole deck.

### Raw 29-list inventory

| Stadium | Copies | Source ranks |
|---|---:|---|
| Sky Field | 17 | 1, 4, 5, 14, 18, 19, 30 |
| Dimension Valley | 1 | 1 |
| Artazon | 5 | 2, 7, 15 |
| Grand Tree | 3 | 2, 15, 31 |
| Tropical Beach | 4 | 3, 6, 29 |
| Player's Ceremony (Japanese-only) | 5 | 3, 6, 24, 29 |
| Temple of Sinnoh | 9 | 3, 8, 11, 16, 22 |
| Path to the Peak | 8 | 5, 9, 12, 15, 20, 21, 27 |
| Thunder Mountain ◇ | 3 | 6, 24, 29 |
| Wondrous Labyrinth ◇ | 3 | 6, 24, 29 |
| Chaotic Swell | 2 | 7 |
| Silent Lab | 5 | 9, 13, 15, 32 |
| PokéStop | 3 | 9, 17, 31 |
| Parallel City | 7 | 10, 12, 13, 20, 21, 27, 32 |
| Shopping Center | 2 | 11 |
| Risky Ruins | 4 | 26 |
| **Total** | **81** | **29 lists** |

### 24-list normalized diagnostic proxy

| Stadium | Copies |
|---|---:|
| Sky Field | 17 |
| Dimension Valley | 1 |
| Artazon | 4 |
| Grand Tree | 3 |
| Temple of Sinnoh | 8 |
| Path to the Peak | 8 |
| Silent Lab | 5 |
| PokéStop | 3 |
| Parallel City | 7 |
| Shopping Center | 2 |
| Risky Ruins | 4 |
| **Total** | **62** |

The Japanese-only Player's Ceremony and the other source Stadiums confined to excluded ranks do not appear in this 24-list proxy.

## Direct candidate-disruptive Stadium exposure

Three Stadium identities in the 24-list proxy have direct, clear interference with the Hood Shadow Rider engine:

- **Path to the Peak:** 8 copies in ranks 5, 9, 12, 15, 20, 21, and 27. It turns off Rule Box Pokémon Abilities, including Shadow Rider Calyrex VMAX's Underworld Door.
- **Silent Lab:** 5 copies in ranks 9, 13, 15, and 32. It suppresses Basic Pokémon Abilities, including the candidate's Latias ex and Lillie's Clefairy ex abilities.
- **Parallel City:** 7 copies in ranks 10, 12, 13, 20, 21, 27, and 32. The opponent can choose the candidate's side for the three-Bench limit.

Their union is **10/24** diagnostic lists (ranks 5, 9, 10, 12, 13, 15, 20, 21, 27, 32). This is a known-disruptor subset, not a complete classification of every Stadium's strategic value; Artazon, Grand Tree, Risky Ruins, Shopping Center, PokéStop, Sky Field, Dimension Valley, and Temple of Sinnoh may help one or both players depending on the game state.

This strengthens the candidate-specific second-player hypothesis: if the opponent has played Path to the Peak, Silent Lab, or Parallel City on its first turn, the candidate may replace it with Sky Field/Dimension Valley (or remove it with Field Blower), then use Shadow Mist. Shadow Mist prevents the opponent from playing another Stadium from hand during its next turn, potentially protecting Underworld Door or the candidate's bench for one turn. This is only a potential line: the candidate must actually have and use an answer, and the restriction does not prevent non-Stadium removal effects.

## Interaction with the Special-only census

The existing inventory identifies seven zero-Basic-Energy lists with Special Energy: ranks 4, 5, 6, 7, 17, 24, and 29. Two of them, ranks 4 and 17 (Raichu/Electrode), have a significant non-hand attachment route: **Electrode-GX's Extra Energy Bomb** attaches up to five Energy cards from the discard pile to non-GX/EX Pokémon and then Knocks Out Electrode-GX. The source lists contain Electrode-GX, Battle Compressor, and non-GX Alolan Raichu targets. This effect is not a Special Energy card played from hand and is therefore not prohibited by Shadow Mist; it is a costly bypass, not proof that the opponent can always execute it.

Agent50's current rank-4 v2 policy explicitly abstains from Extra Energy Bomb because its worker does not support the AttachEnergyPrompt. Therefore a simulation using that policy must not be treated as evidence that the paper rank-4 opponent lacks this bypass. See [Agent50's rank-4 policy report](./agent50-rank4-raichu-electrode-opponent-policy-v2.md) and [prize-gate analysis](./agent50-rank4-reversal-counter-energy-prize-gate.md). The rank-4/17 Stadium clauses may still matter independently.

## Consequence for GO_FIRST research

The corrected whole-deck inventory makes **Path to the Peak** a particularly important reason to test, not assume, the second-player line. The Hood candidate's direct Shadow Mist opportunity is 36.7253% conditional on a valid opening seven, but that does not include the chance to draw a Stadium/Field Blower, whether the opponent actually plays a disruptive Stadium, or whether Shadow Mist is the best attack. Going first still advances VMAX evolution by one global turn. A complete-game comparison under the existing Stage-A/Stage-B gates is required.

## Reproduction and limitations

- Source rows: `results/aichi-2026/full-decklists.json`.
- English Stadium classification: `resources/cards/en/*.json`, `subtypes` includes `Stadium`.
- Japanese-only exception: Player's Ceremony, source prints SM-P 248/398 and S-P 127, confirmed as Trainer—Stadium by the links above.
- Normalized 24-rank allowlist: the identity-screen report linked below.
- Counts are card copies in published source lists, not draw probabilities or matchup outcomes. They do not prove physical-paper admission or resolve the missing three ranks and five incompatible source lists.

Related research:
- [Identity-normalized 24-list diagnostic field](./agent39-identity-normalized-expanded-diagnostic-field-20261113.md)
- [Earlier Stadium/Weakness analysis](./agent42-source-field-stadium-weakness-census-20261114.md)
- [Agent1 GO_FIRST / Shadow Mist opportunity analysis](../../strategy/2026-11/agent1-hood-go-first-shadow-mist-opportunity-20261124.md)
