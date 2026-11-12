# Agent 3 — Aichi / international Expanded format incompatibility: Player's Ceremony

**Date:** 2026-11-12  
**Status:** Concrete incompatibility found; owner format decision still required.

## Finding

The authenticated 29-list manifest contains **Player's Ceremony (Japanese S-P promo 127)** in four original Aichi Open League opponent lists:

| Aichi rank | Player | Copies |
|---:|---|---:|
| 3 | Haruto Miki | 1 |
| 6 | Kazuma Kashi | 1 |
| 24 | Ryoya Fujii | 2 |
| 29 | Kohei Hamamichi | 1 |

The card's Limitless entry identifies it as a Japanese-only printing, says it has **no international prints**, and distinguishes **Expanded: not legal** from **Expanded (JP): legal**:
- https://limitlesstcg.com/cards/jp/sp/127?translate=en

The official CL Aichi 2026 event page specifies an **Extra-regulation Open League** and says only Japanese-language cards may be used:
- https://www.pokemon-card.com/info/005445.html

This is not a theoretical card-pool concern: the four listed opponent 60s actually contain the Japanese-only SP 127 card. Therefore, the original 29-list field is **not wholly legal under international paper Expanded unchanged**. At minimum, ranks 3, 6, 24 and 29 fail a strict international-Expanded intersection test. The same card is legal in Japanese Expanded, consistent with the source event's Japanese-card environment.

## Reproduction against the repository manifest

Input: `results/aichi-2026/full-decklists.json` (29 published card-name/count inventories).

Filter: `card.name === "Player's Ceremony"` and `card.printing.set === "SP"` and `card.printing.number === "127"`.

Output: the four rank/player/count rows above. Total: **5 copies across 4 of 29 published lists**.

The manifest's `printing.language: "en"` field is a normalized English-name representation, not reliable evidence that the physical event cards were English. SP 127 is specifically a Japanese promo and the event required Japanese cards. Do not infer physical print language from that normalized field.

This is a **minimum incompatibility finding**, not a complete legality audit of every card in every list. It does not change the 29/32 source-coverage count; ranks 23, 25 and 28 remain missing.

## Decision impact

A strict intersection of the exact Aichi opponent lists with international paper Expanded is impossible without altering at least these four original lists. Replacing Player's Ceremony or silently treating Expanded (JP) as international Expanded would change the historical source field or the format definition.

The owner therefore needs to choose and record the governing contract, as requested in the Critic's 2026-11-12 format-contract broadcast:

1. Keep international paper Expanded as the candidate/game format and label the Aichi lists as Japanese Extra historical opponents, explicitly marking the four known incompatible lists (and any further incompatibilities found).
2. Change the project to event-date Japanese Extra, with Japanese card legality/printings and a matching game-rules implementation.
3. Define a narrower explicit intersection, accepting that the unchanged full Aichi Top 32 is not the field.

Do not select a final deck or admit a competitive game under an unstated cross-format assumption. This audit is a scope/legality gate only; it provides **no matchup or win-rate evidence**.
