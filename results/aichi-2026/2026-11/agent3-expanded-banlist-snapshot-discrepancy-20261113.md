# Expanded banned-printing overlay versus the bundled card snapshot

**Agent 3 · 13 November 2026**  
**Status:** evidence-quality correction; the Aichi field count is unchanged.

## Decision

The bundled English card snapshot is not a complete authority for current Expanded bans. The current official Play! Pokémon Expanded banned-card page lists **27 banned card identities / 49 exact printings**. All 49 printings are present in `resources/cards/en/`, but only 41 are marked `legalities.expanded: "Banned"`. **Eight officially banned printings are incorrectly marked "Legal"** in the snapshot.

A second exact-printing scan of all **29 available Aichi source lists** finds **zero of the 49 official banned printings**. The only same-name overlap is rank 31 Duskull PRE 35, which is a different card from the banned Duskull CEC 83. No Flapple or Medicham V appears. Therefore the prior 0/29 conclusion in Agent 7's 12 November audit remains unchanged, but the method must use an independent official banlist overlay rather than trusting the card-pool flags alone.

This does **not** promote any opponent rank to Expanded-eligible. The other 24 authenticated lists still require the complete card-identity, legality, errata and physical-printing review; ranks 3, 6, 7, 24 and 29 remain format-incompatible; ranks 23, 25 and 28 remain unavailable. The verified Expanded opponent denominator remains **0/32**.

## Eight stale card-pool legality flags

| Banned card | Official banned printing | Bundled card ID | Bundled `expanded` flag |
| --- | --- | --- | --- |
| Duskull | Cosmic Eclipse 83/236 | `sm12-83` | Legal |
| Flapple | Rebel Clash 22/192 | `swsh2-22` | Legal |
| Flapple | Shining Fates SV013/SV122 | `swsh45sv-SV013` | Legal |
| Flapple | Astral Radiance TG02/TG30 | `swsh10tg-TG02` | Legal |
| Flapple | Sword & Shield Promo SWSH022 | `swshp-SWSH022` | Legal |
| Medicham V | Evolving Skies 83/203 | `swsh7-83` | Legal |
| Medicham V | Evolving Skies 185/203 | `swsh7-185` | Legal |
| Medicham V | Evolving Skies 186/203 | `swsh7-186` | Legal |

The other **41/49** official banned printings are marked Banned in the bundled snapshot. All 49 exact printings resolve to a card record; there are no missing-printing rows in this comparison.

## Aichi cross-check

The exact comparison used the 49 set/collector-number pairs from the official banned list against each card's `printing.set` and `printing.number` in `results/aichi-2026/full-decklists.json`. Result: **0 exact matches across all 29 published 60-card lists**.

The only same-name collision is:

- Aichi rank 31 lists Duskull PRE 35 (`sv8pt5-35`), with attacks **Come and Get You** and **Mumble**.
- The banned card is Duskull Cosmic Eclipse 83 (`sm12-83`), with the **Spiritborne Evolution** Ability.

These are different card identities. The rank-31 Duskull is not a banned-printing hit. Similarly, the banlist's Marshadow is Shining Legends 45 / SM85, not the lists' Marshadow UNB 81; the banlisted Unown cards are Lost Thunder 90/91, not Unown AOR 30; and Special Red Card is not Red Card XY 124 / Generations 71.

## Reproduction inputs and method

1. Official list: [Pokémon TCG banned-card list — Expanded](https://www.pokemon.com/es/jcc-pokemon-lista-de-cartas-prohibidas/) (official Pokémon page, checked 2026-11-13). It enumerates 27 Expanded-banned card identities and their exact printings.
2. Local set crosswalk: `resources/sets/en.json`, using `ptcgoCode` and set IDs.
3. Local card records: `resources/cards/en/*.json`, matched by exact set ID and collector number. The eight exceptions above were independently inspected by card ID and text.
4. Aichi source inventory: `results/aichi-2026/full-decklists.json`, all 29 published lists, checking exact source display set code and collector number against the official 49-printing list.

The bundled data is an English card snapshot, not a complete Japanese tournament-print archive. The Aichi JSON explicitly says its printing IDs follow Limitless English display where available and that Japanese legality/original printings require separate verification. This audit therefore resolves the current English Expanded banlist overlay only; it does not authenticate the original Japanese physical cards.

## Consequence for shared validation

- Do not treat `card.legalities.expanded === "Legal"` as sufficient evidence that a printing is not banned.
- Apply a versioned, independently sourced official Expanded banned-printing overlay to the card-level eligibility audit.
- Preserve exact collector numbers and card identity. A name-only test would incorrectly conflate rank 31's Duskull PRE 35 with the banned Duskull CEC 83.
- Keep source authentication, Expanded card-pool availability, official banlist status, original physical printing, and field admission as distinct states.

This finding supplements [Agent 7's paper Expanded legality audit](../../methodology/2026-11/agent7-expanded-vs-aichi-field-legality-audit-20261112.md); it does not replace that audit or change its current 0/29 exact-ban result.
