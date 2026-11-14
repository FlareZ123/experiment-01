# Expanded objective versus Aichi source-field compatibility

**Date:** 13 November 2026  
**Status:** Scope and admission blocker; no deck or matchup result is promoted.

## Decision

The governing research prompt defines the deliverable as one legal, playable paper **Expanded** deck (Black & White onward). The Aichi Open League 2026 lists are authentic source inventories from a Japanese Extra event. Preserve those lists exactly, but do not silently treat the event's Japanese Extra card pool as the project's Expanded opponent field.

The repository has authenticated 29 of the 32 original name/count 60-card inventories. Five of those 29 are known to contain Japanese-only promo identities with no international Expanded printing; three more original lists remain missing. Therefore, the source-authentication count is not an Expanded-field-eligibility count, and the unchanged full Aichi Top 32 is not currently a valid 32-deck international Expanded field.

## Source compatibility

Agent3's complete name-coverage audit, `results/aichi-2026/2026-11/agent3/format-contract-player-ceremony-20261112.md`, identifies:

| Japanese-only identity | Printing | Aichi ranks | Copies |
| --- | --- | --- | ---: |
| Player's Ceremony | S-P 127 | 3, 6, 24, 29 | 5 |
| Palace Book | SM-P NAN25 | 6, 7, 24 | 6 |
| Palace Belt | BW-P 153 | 6, 29 | 3 |

These are **14 copies across five lists: ranks 3, 6, 7, 24 and 29**. The cited card records distinguish Japanese Expanded legality from international Expanded legality. Those five source lists cannot be admitted unchanged as international Expanded opponents.

Ranks **23, 25 and 28** remain unauthenticated. The other 24 authenticated lists have no conflict identified by this particular three-identity audit, but still require complete Expanded legality, banlist, errata and physical-printing review. Do not infer that they are fully qualified merely because their names appear in the English card archive.

Hood Shield Shadow Rider v1 has a separate Expanded-normalized 60 at `results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md`. Agent14's Japanese Extra print manifest is a useful event-source print crosswalk, not the governing Expanded legality certificate for this project.

## V3 admission contract mismatch

The current V3 evaluator hardcodes Japanese-printing requirements in both paper-review paths:

- `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs`, `untimedPaperAttestationValid()` (around line 266), requires `exactJapanesePrinted60sVerified === true` and `eventDateLegalityVerified === true`.
- The event-mode paper gate (around line 714) requires those same Japanese-printing and event-date fields.

The primary objective is an untimed game-level matchup win rate under **Expanded**, so its independent paper review must verify the exact Expanded-legal printed 60s and the applicable Expanded legality at the preregistered date. It must not require Japanese-language event printings. Conversely, the `aichi-event-match` path may retain Japanese Extra/event-date attestations as a separately labelled event-format estimand; it is not a substitute for the Expanded objective.

Recommended correction for Agent43/44/12:

1. Bind an explicit game ruleset and candidate format in the preregistration, policy plan and per-game receipt (for example, `gameRuleset: "expanded"` for the primary path).
2. Use format-specific signed paper-review fields: exact Expanded printing/60 and Expanded legality for untimed Expanded games; Japanese printing and event-date Extra legality only for Japanese Extra event matches.
3. Keep candidate legality and opponent legality separate. A source list with a known incompatible identity must be recorded as `FORMAT_INCOMPATIBLE` / not evaluable, not silently rewritten.
4. Keep the V2 historical contract immutable. Add the format-aware behavior prospectively in V3 and its tests; do not weaken the independent paper-review requirement.
5. Keep the field panel incomplete while ranks 23/25/28 are missing and the five known incompatible source lists are unresolved under the governing Expanded ruleset.

## Fixture and performance boundary

The current Agent36/Agent49 fixture is an international Expanded engineering diagnostic. It is not a physical paper match, does not establish rank-1 paper legality, and contributes zero competitive matchup observations. It cannot repair the five source-field incompatibilities or qualify the missing ranks.

Current decision remains: **no final fixed 60 selected, zero competitively paper-qualified games, and no demonstrated 99.5% field win rate**. Preserve all original source evidence and all Japanese Extra research; do not promote a cross-format result as Expanded performance.

## 14 November clarification: core ruleset alignment and diagnostic field closure

The format distinction should not be overstated as a broad card-pool or banned-list mismatch.

- The official Japanese Extra page (updated 19 February 2026) defines Extra as the BW series through the latest series and lists 27 banned card entries: https://www.pokemon-card.com/rules/regulation/
- The Play! Pokémon TCG Tournament Handbook (revision 1 September 2026) defines Expanded using BW series expansions plus later regulation marks, and permits older printings when the name is identical and the card text is functionally identical (§4.1.3): https://assets.pokemon.com/assets/cms2/pdf/play-pokemon/rules/play-pokemon-tcg-tournament-handbook-en.pdf
- The Japanese Extra and current English Expanded banned-card identity-name sets align at 27 entries in the current references. Keep the independently sourced English Expanded exact-printing overlay authoritative for international Expanded; do not infer that the Japanese and English printing/errata scopes are identical merely from matching names. The English overlay and its eight stale bundled-card flags are documented in `results/aichi-2026/2026-11/agent3-expanded-banlist-snapshot-discrepancy-20261113.md`.
- The official Aichi event source still controls its local conditions: Open League used Japanese Extra and required Japanese-language cards, 60 cards and six Prizes. See `results/aichi-2026/2026-11/agent12-official-format-rules-and-mulligan-20261107.md`.

The remaining substantive unchanged-list incompatibility is therefore not a general Extra-vs-Expanded banlist divergence: ranks **3, 6, 7, 24 and 29** contain Player's Ceremony, Palace Book and/or Palace Belt, Japanese-only identities without international Expanded printings. Ranks **23, 25 and 28** remain missing. The event's Japanese-language/physical-print contract also remains distinct from an international Expanded paper reconstruction.

The 24 other authenticated lists have since passed an **identity-level English Expanded diagnostic screen**: card identity, deck construction and the current banlist overlay pass, with 24 normalized 60-card diagnostic lists emitted by Agent39's generator. See `results/aichi-2026/2026-11/agent48-reprint-rule-identity-vs-print-diagnostic-proposal-20261113.md`. This supersedes the earlier statement above that those 24 still require the complete identity/banlist review. Their exact original physical Japanese copies remain unverified, so these lists remain `identity_normalized_expanded_diagnostic_only`, not original-source paper-admitted opponents.

This clarification does not decide the owner-controlled estimand choice between strict Expanded-vs-Expanded and candidate-only Expanded versus unchanged Japanese Extra opponents. It changes neither the 5 incompatible ranks nor the 3 missing ranks, and it supplies no matchup or win-rate evidence.

