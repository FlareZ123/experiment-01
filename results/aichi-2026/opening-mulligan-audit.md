# Aichi 2026 opening-hand and mulligan pressure audit

**Source:** [Published Aichi 2026 Top 32 decklists](full-decklists.json), tournament [Limitless 566](https://www.limitlesstcg.com/tournaments/566/decklists). **Scope:** all 29 published complete lists; placements 23, 25 and 28 lack published lists and are excluded. This audits opening-hand composition, not strategic win rates.

We checked card counts, identified Basic Pokémon using the repository English snapshot's `subtypes` (including Mega ex stage distinctions), and normalized the Limitless Prism Star glyph `♢` to the database glyph `◇`. The canonical reproducible implementation is [`scripts/aichi_opening_audit.cjs`](../../scripts/aichi_opening_audit.cjs), with [Node regression tests](../../tests/aichi_opening_audit.test.cjs).

## Calculations

With `b` Basic Pokémon in a 60-card deck and a seven-card opening hand:

- **Initial mulligan probability:** `p(b) = C(60-b,7) / C(60,7)`.
- **Expected own mulligans until a valid opening:** `p/(1-p)`, assuming independent, fully randomized redraws.
- **Expected optional mulligan draws offered to opponent B by player A:** `pA(1-pB) / [(1-pA)(1-pA pB)]`, provided players independently redraw and if both mulligan simultaneously, neither receives a draw opportunity from that joint mulligan. After one obtains a valid hand, the other continues redrawing. The formula counts *offered opportunities*, and it does not assume cards were actually drawn.

The opponent B used in the last column is the rank-1 Shadow Rider Calyrex reference with **14 Basic Pokémon** and initial mulligan probability **13.859%**.

## Per-placement results

| Rank | Archetype | Basic Pokémon | Initial mulligan | Expected own mulligans | Offered draws to rank-1 opponent |
| ---: | --- | ---: | ---: | ---: | ---: |
| 1 | Shadow Rider Calyrex | 14 | 13.859% | 0.161 | 0.141 |
| 2 | Vileplume Control | 14 | 13.859% | 0.161 | 0.141 |
| 3 | Snorlax Stall | 11 | 22.242% | 0.286 | 0.254 |
| 4 | Raichu Electrode Combo | 13 | 16.284% | 0.195 | 0.171 |
| 5 | Mew Genesect | 11 | 22.242% | 0.286 | 0.254 |
| 6 | Iron Thorns | 4 | 60.050% | 1.503 | 1.412 |
| 7 | Snorlax Stall | 12 | 19.065% | 0.236 | 0.208 |
| 8 | Absol Garbodor | 10 | 25.863% | 0.349 | 0.312 |
| 9 | Absol Electrode | 11 | 22.242% | 0.286 | 0.254 |
| 10 | Regidrago | 15 | 11.750% | 0.133 | 0.117 |
| 11 | Absol Garbodor | 11 | 22.242% | 0.286 | 0.254 |
| 12 | Regidrago | 15 | 11.750% | 0.133 | 0.117 |
| 13 | Regidrago | 11 | 22.242% | 0.286 | 0.254 |
| 14 | Regidrago | 14 | 13.859% | 0.161 | 0.141 |
| 15 | Lopunny Vileplume | 14 | 13.859% | 0.161 | 0.141 |
| 16 | Absol Garbodor | 11 | 22.242% | 0.286 | 0.254 |
| 17 | Raichu Electrode Combo | 13 | 16.284% | 0.195 | 0.171 |
| 18 | Regidrago | 16 | 9.922% | 0.110 | 0.096 |
| 19 | Raging Bolt | 16 | 9.922% | 0.110 | 0.096 |
| 20 | Regidrago | 14 | 13.859% | 0.161 | 0.141 |
| 21 | Regidrago | 14 | 13.859% | 0.161 | 0.141 |
| 22 | Absol Garbodor | 12 | 19.065% | 0.236 | 0.208 |
| 24 | Iron Thorns | 4 | 60.050% | 1.503 | 1.412 |
| 26 | Meloetta Donk | 12 | 19.065% | 0.236 | 0.208 |
| 27 | Regidrago | 15 | 11.750% | 0.133 | 0.117 |
| 29 | Iron Thorns | 4 | 60.050% | 1.503 | 1.412 |
| 30 | Lillie's Clefairy | 16 | 9.922% | 0.110 | 0.096 |
| 31 | Dusknoir Chimecho | 15 | 11.750% | 0.133 | 0.117 |
| 32 | Regidrago | 13 | 16.284% | 0.195 | 0.171 |

## Interpretation and limitations

The three **Iron Thorns** decks (ranks 6, 24 and 29) each contain exactly **four Basic Pokémon**, all Iron Thorns ex. Their initial mulligan probability is **60.050%**, their expected number of mulligans per setup is **1.503**, and against the rank-1 opening profile they generate **1.412 expected optional opponent draw opportunities**. The probability of at least three consecutive unsuccessful hands for such a deck is **21.654%**. These are setup statistics only and do not establish matchup weakness or strength.

The published **Regidrago** lists vary from 11 to 16 Basic Pokémon, a meaningful variation in mulligan rate despite an identical archetype label. Consequently, opening calculations should be performed on each published placement separately, not inferred from archetype alone.

The model excludes special initial-hand rules, player choice of Active and Bench, opponent's actual bonus-card decisions, turn-one effects, and tournament-specific exceptions. These percentages must never be substituted for completed-match win rates. The English snapshot resolves Basic stage for this audit; it does not independently certify Japanese paper Expanded card legality. **No 99.5% matchup claim follows from this analysis.**

**Rules anchor:** `resources/manual/` Advanced Player's Rulebook, section I-G, setup steps 4-7 (seven-card hands, simultaneous mulligans, optional additional draws), and section I-H for deck operations.
