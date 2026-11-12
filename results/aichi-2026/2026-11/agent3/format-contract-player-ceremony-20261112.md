# Agent 3 — Aichi / international Expanded format incompatibility

**Date:** 2026-11-12  
**Status:** Three Japanese-only card identities confirmed in five of the 29 published Aichi lists; owner format decision still required.

## Finding

A name-level audit of all 29 published card-name/count inventories found three genuine card identities absent from the English card pool and identified by card databases as Japanese-only promos:

| Card identity | Japanese printing in manifest | Aichi ranks | Total copies |
|---|---|---:|---:|
| Player's Ceremony | S-P 127 | 3, 6, 24, 29 | 5 |
| Palace Book | SM-P NAN25 | 6, 7, 24 | 6 |
| Palace Belt | BW-P 153 | 6, 29 | 3 |

Thus **five of the 29 published opponents** (ranks 3, 6, 7, 24 and 29) contain at least one Japanese-only card with no international print. There are **14 such copies** across those five lists.

The individual card references are explicit:

- **Player's Ceremony S-P 127:** Limitless says no international prints; Expanded is not legal and Expanded (JP) is legal. https://limitlesstcg.com/cards/jp/sp/127?translate=en
- **Palace Book SM-P NAN25:** Limitless says no international prints; Expanded is not legal and Expanded (JP) is legal. Its page also independently lists the Aichi appearances at ranks 6, 7 and 24. https://limitlesstcg.com/cards/jp/SMP/NAN25?translate=en
- **Palace Belt BW-P 153:** Bulbapedia identifies it as a Japanese BW-P promo and explicitly notes it has not been officially released in English. https://bulbapedia.bulbagarden.net/wiki/Palace_Belt

The official CL Aichi 2026 event page specifies an **Extra-regulation Open League** and says only Japanese-language cards may be used:
- https://www.pokemon-card.com/info/005445.html

These are actual cards in the source lists, not hypothetical pool concerns. The five affected lists are legal in their Japanese-card environment but are not unchanged international paper Expanded lists. Therefore, a strict intersection between the original Aichi Top 32 field and international Expanded is already impossible unless the source lists are altered or the format definition changes.

## Reproduction against repository data

Input: `results/aichi-2026/full-decklists.json` (29 published card-name/count inventories).

1. Extract the 238 unique card names across the 29 lists.
2. Compare against the supplied English card-pool archive's `cards/en` data (176 set files, 4,451 distinct English card names).
3. Eleven raw string misses remain. Eight are naming aliases/normalization differences (for example, the Team Flare Gear suffix, prism-star glyph, and `Unit Energy LPM` abbreviation). The three genuine absent identities are exactly Player's Ceremony, Palace Book and Palace Belt.
4. Match the three identities back to `full-decklists.json` to obtain the rank/player/copy counts above.

Exact affected rows:

| Rank | Player | Player's Ceremony | Palace Book | Palace Belt |
|---:|---|---:|---:|---:|
| 3 | Haruto Miki | 1 | 0 | 0 |
| 6 | Kazuma Kashi | 1 | 1 | 1 |
| 7 | Hiroto Fuji | 0 | 3 | 0 |
| 24 | Ryoya Fujii | 2 | 2 | 0 |
| 29 | Kohei Hamamichi | 1 | 0 | 2 |

The manifest's `printing.language: "en"` field is a normalized English-name representation, not reliable evidence of physical event-card language. The Japanese promo set codes and external card records are the relevant print evidence.

This is a **complete English-card-name coverage check for the current 29 manifests**, not a complete physical-printing audit of every card. It cannot classify the missing ranks 23, 25 and 28, which may contain further Japanese-only cards. Exact physical print provenance for the other cards also remains incomplete.

## Decision impact

The exact Aichi field is a Japanese Extra field, not an international Expanded-legal field. The owner must explicitly choose the governing contract, as requested in the Critic's 2026-11-12 format-contract broadcast:

1. Keep international paper Expanded as the candidate/game format and label the Aichi lists as historical Japanese Extra opponents, explicitly marking the five known incompatible lists (and any further incompatibilities found).
2. Change the project to event-date Japanese Extra, with Japanese card legality/printings and a matching game-rules implementation.
3. Define a narrower explicit intersection, accepting that the unchanged full Aichi Top 32 is not the field.

Do not select a final deck or admit a competitive game under an unstated cross-format assumption. This audit is a scope/legality gate only; it provides **no matchup or win-rate evidence**. The 29/32 source-coverage count is unchanged; ranks 23, 25 and 28 remain missing.
