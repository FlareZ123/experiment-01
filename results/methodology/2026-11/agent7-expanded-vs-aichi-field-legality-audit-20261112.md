# Paper Expanded legality audit of the Aichi source field

**Agent 7 · revised 13 November 2026.** This audit resolves the format conflict at the card-pool and official-banlist levels. The governing `prompt.md` scope is paper international Expanded (Black & White onward); the Aichi Open League 2026 source event is Japanese Extra.

## Inputs

- `results/aichi-2026/full-decklists.json`: 29 published Aichi Top 32 card-name/count inventories; ranks 23, 25 and 28 remain unavailable.
- Uploaded `card-list.zip` / repository `resources/cards/en/`: 20,635 English card-printing records with snapshot legality fields.
- `results/aichi-2026/candidate-hood-shadow-rider.json`: the Hood Shield v1 experimental 60.
- Current official Expanded banned-card page: https://www.pokemon.com/es/jcc-pokemon-lista-de-cartas-prohibidas/ (checked 13 November 2026; exact-printing overlay reproduced in `results/aichi-2026/2026-11/agent3-expanded-banlist-snapshot-discrepancy-20261113.md`).

## 1. Official Expanded banned-printing overlay

The original 12 November scan found zero exact hits among the 41 English printings that the bundled snapshot itself marked `Expanded: Banned`. That statement remains true but is not a complete official-banlist audit: eight exact official banned printings are incorrectly marked `Legal` in the bundled snapshot.

The current official list enumerates **27 banned card identities / 49 exact printings**. All 49 printings resolve to records in the bundled English card pool; only 41 of those records carry the expected `Banned` flag. The eight stale flags are:

| Card | Official banned printing | Bundled card ID | Bundled Expanded flag |
| --- | --- | --- | --- |
| Duskull | Cosmic Eclipse 83/236 | `sm12-83` | Legal |
| Flapple | Rebel Clash 22/192 | `swsh2-22` | Legal |
| Flapple | Shining Fates SV013/SV122 | `swsh45sv-SV013` | Legal |
| Flapple | Astral Radiance TG02/TG30 | `swsh10tg-TG02` | Legal |
| Flapple | Sword & Shield Promo SWSH022 | `swshp-SWSH022` | Legal |
| Medicham V | Evolving Skies 83/203 | `swsh7-83` | Legal |
| Medicham V | Evolving Skies 185/203 | `swsh7-185` | Legal |
| Medicham V | Evolving Skies 186/203 | `swsh7-186` | Legal |

An exact set/collector-number comparison of all 49 official printings against all **29 available Aichi source lists** finds **zero banned-printing hits**. The only same-name collision is rank 31 Duskull PRE 35, whose attacks are Come and Get You / Mumble; it is not banned Duskull CEC 83 with Spiritborne Evolution. The rank-31 card is therefore not a banned-printing hit. No Flapple or Medicham V appears in the 29 lists.

The Hood Shield v1 candidate also contains none of the identities responsible for the eight stale flags. Its normalized English-print export is separately audited at `results/decks/hood-shield-shadow-rider-v1-expanded-card-pool-legality-audit-20261113.md`.

**Validation rule:** never use `card.legalities.expanded === "Legal"` alone as proof that a printing is not currently banned. Apply a versioned official exact-printing overlay. Preserve set and collector number; name-only matching would falsely conflate Duskull PRE 35 with Duskull CEC 83.

## 2. Aichi source identities incompatible with international Expanded

A complete name/identity review of the 29 published lists finds three Japanese-only promo identities absent from the English card pool and not legal in international Expanded. They occur in **five** published lists, across **14 copies**:

| Card identity | Japanese printing | Aichi ranks | Copies |
| --- | --- | --- | ---: |
| Player's Ceremony | S-P 127 | 3, 6, 24, 29 | 5 |
| Palace Book | SM-P NAN25 | 6, 7, 24 | 6 |
| Palace Belt | BW-P 153 | 6, 29 | 3 |

Exact per-rank inventory:

| Rank | Player's Ceremony | Palace Book | Palace Belt |
| ---: | ---: | ---: | ---: |
| 3 | 1 | 0 | 0 |
| 6 | 1 | 1 | 1 |
| 7 | 0 | 3 | 0 |
| 24 | 2 | 2 | 0 |
| 29 | 1 | 0 | 2 |

References and event-format evidence:

- Player's Ceremony S-P 127: https://limitlesstcg.com/cards/jp/sp/127?translate=en — no international print; Expanded is not legal and Expanded (JP) is legal.
- Palace Book SM-P NAN25: https://limitlesstcg.com/cards/jp/SMP/NAN25?translate=en — no international print; Expanded is not legal and Expanded (JP) is legal.
- Palace Belt BW-P 153: https://bulbapedia.bulbagarden.net/wiki/Palace_Belt — Japanese BW-P promo with no official English release.
- Official CL Aichi 2026 event page: https://www.pokemon-card.com/info/005445.html — specifies Extra regulation and Japanese-language cards only.

The source JSON's English-translated names and `language: en` metadata are normalization fields, not evidence that the original event cards were English printings. These five lists are valid Japanese Extra source inventories but are not unchanged international Expanded opponents. Do not replace the promo cards with similarly named cards or otherwise rewrite the source 60s to manufacture legality.

The five-rank result and exact copy counts are documented in `results/aichi-2026/2026-11/agent3/format-contract-player-ceremony-20261112.md`. The three missing ranks 23, 25 and 28 may contain further incompatibilities; they cannot be classified from archetype guesses.

## 3. Candidate printing normalization

The original Hood Shield v1 JSON records 11 Basic Psychic Energy entries as `MEE 13`, and its original card composition is retained unchanged for experiment fingerprints. A human-usable Expanded printing-normalized export now exists at `results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md`:

- 18 Pokémon, 31 Trainers, 11 Basic Psychic Energy = 60 cards.
- The 11 Basic Psychic Energy entries are normalized to CRE 232.
- Battle Compressor PHF 92 is written under its full name, Battle Compressor Team Flare Gear.
- The independent construction / card-pool audit confirms 34 printing rows resolve to English printings marked Expanded Legal, one ACE SPEC, one Radiant Pokémon, and no non-Energy copy-limit violation.

This is a printing-normalized experimental candidate, not a selected deck, physical inspection, Twinleaf game, or strength result. See the linked legality audit for the exact print crosswalk and limitations.

## 4. Consequence for the governing objective

The exact Aichi source event is a **Japanese Extra** field. The governing prompt asks for a paper **international Expanded** deck. These formats cannot be silently conflated:

1. The authenticated source inventory is 29/32; ranks 23, 25 and 28 remain missing.
2. Five authenticated ranks (3, 6, 7, 24 and 29) contain 14 copies of Japanese-only promo identities with no international Expanded printing.
3. The other 24 lists pass current identity/card-pool/official-banlist screens as English Expanded diagnostic reconstructions, but original Japanese physical copies have not been authenticated. They are not automatically paper-admitted opponents.
4. The current official banned-printing overlay finds zero exact banned-print hits among the 29 source lists, but the bundled snapshot has eight stale `Legal` flags and must not be treated as the sole banlist authority.
5. The production paper-opponent denominator remains **0/32**; there are no competitively qualified games and no demonstrated 99.5% result.

Therefore preserve the original Japanese Extra lists as source evidence, keep the 24 identity-screened reconstructions explicitly diagnostic, and do not claim a complete Expanded Top 32. If the owner intends the exact Aichi event to remain the benchmark, the governing format must be explicitly changed to Japanese Extra. If international Expanded remains governing, an owner-approved benchmark rule or a different Expanded-legal opponent field is required. No substitution or inferred missing list can resolve this silently.

## Limits

- The official banlist overlay is a current exact-printing screen, not a substitute for future versioned updates.
- The 29 source inventories are incomplete and do not authenticate every original physical printing.
- The five incompatible ranks are preserved as original Japanese Extra lists; the three unavailable ranks are not inferred.
- The 24 diagnostic reconstructions do not establish original physical-card identity or production paper admission.
- No games were run by this audit, no deck was promoted, and no matchup or win-rate inference follows.

**Bottom line:** the prior 41-flag scan was incomplete, but the official overlay still finds zero exact banned-print hits in the 29 source lists. The decisive format incompatibility is unchanged and broader than the original two-rank note: five of 29 available Aichi lists are not unchanged international Expanded decks. The normalized Hood v1 60 has a human-usable Expanded printing export, but neither it nor any other candidate has been selected or competitively qualified.
