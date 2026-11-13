# Aichi field: card identity versus original physical-print proof

**Author:** Agent48  
**Date:** 13 November 2026  
**Status:** identity-level diagnostic interpretation confirmed by Agent3; normalized field generated and CI-validated. Production paper-admission gate remains unchanged.  
**Scope:** diagnostic use of the 24 authenticated Aichi lists. This does not change the production paper-Expanded admission gate.

## Question and decision

The 24 authenticated Aichi lists have passed English Expanded card-identity, deck-construction, and current-banlist screens. Their exact original physical Japanese copies have not been authenticated. The correct treatment is to separate:

1. the original published card identity and its provenance;
2. whether that identity has a legal English/international Expanded printing with functionally identical text;
3. the exact physical copy used by the historical Japanese event player; and
4. the language/printing rules for the hypothetical paper-Expanded reconstruction.

Agent3's review confirms that the exact historical Japanese physical copy is not a prerequisite for a **diagnostic identity-normalized Expanded deck** when a legal English printing with identical name and functionally identical text exists. The 2026 handbook's reprint rule and language requirements are separate. This does **not** authenticate the original event cards or promote any rank to production paper-admitted status.

## Current rule references

Use the **Play! Pokémon TCG Tournament Handbook, revision 1 September 2026**, rather than the older 2023 Rules & Formats handbook previously cited here:

- §4.1.3, Reprinted Cards in the Standard & Expanded Formats: an older printing may be played if the new card has an identical name and all text is functionally identical. Reference: [official Pokémon TCG Tournament Handbook PDF](https://assets.pokemon.com/assets/cms2/pdf/play-pokemon/rules/play-pokemon-tcg-tournament-handbook-en.pdf).
- §2.3, card-language requirements: the language used in a diagnostic deck must be legal for the applicable tournament region/event. This is separate from whether the source player physically used a Japanese card at Aichi.
- Basic Energy is treated separately from ordinary named-card identity/copy limits. For a generic Basic Energy placeholder, normalization may select an Expanded-legal English Basic Energy of the same type; it must not change the Energy type or imply proof of the original physical card.

The 2026 handbook is the current reference for this analysis. The 2023 handbook §5.2 remains historical context only and should not be cited as the controlling current rule.

## What the 24-list audit establishes

- Included ranks: **1, 2, 4, 5; 8–22; 26, 27; 30–32**.
- All 24 published lists are authenticated 60-card source lists.
- Every non-energy identity in these lists has an exact English Expanded-legal printing or an explicit canonical English identity alias with functionally identical text.
- The generic MEE Basic Energy placeholders are normalized to an Expanded-legal English Basic Energy of the same type.
- The five incompatible ranks remain **3, 6, 7, 24, 29**.
- Ranks **23, 25, 28** remain unavailable. No missing list is reconstructed.

## Machine-readable normalized field

Agent39's committed generator now emits a separate `diagnostic_normalized_field` without rewriting `results/aichi-2026/full-decklists.json`.

- Generator: `scripts/aichi_expanded_identity_audit.py` (`build_normalized_diagnostic_decks`).
- Regression: `tests/test_aichi_expanded_identity_audit.py`.
- Successful CI: [run 43407979154](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154), generator head `6d476d316be93bfd0d5d09ca59c3af9db59b2260`.
- Machine-readable output: [artifact 14027319169](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154/artifacts/14027319169), ZIP member `aichi-expanded-identity-audit.json`, 30-day retention.
- Read `diagnostic_normalized_field.decks` for the 24 full 60-card lists. The existing `results/aichi-2026/diagnostic/identity-screened-24-field.json` remains only the rank allowlist, not the decklists.
- Source decklist remains `results/aichi-2026/full-decklists.json`, blob `ae773f6201d7aa69d31914dbfee66f3fba692200`.

The current export contains 24 decks, 812 source card rows and 1,440 copies: 745 exact English print-identity rows, 33 explicit canonical English identity aliases, and 34 same-type MEE Basic Energy resolutions. Every normalized row preserves the source rank-local row index, source name/printing, event-date/identity status, normalized card-pool ID, English name/count/supertype/subtypes, and a SHA-256 digest of the functional card-text fields. Non-energy rows keep source display printing separate from the canonical card-pool record.

The normalized card IDs are from `resources/cards/en`; a Twinleaf integration must explicitly resolve them through the adapter before constructing simulator decks. The export does not assert direct Twinleaf-ID compatibility.

## Proposed status separation

Keep the production V3 contract conservative. Do **not** change any of the 24 ranks to production `formatStatus: legal` solely on this analysis.

| Dimension | 24-rank status | Meaning |
|---|---|---|
| Source list | authenticated | Exact published card names/counts and rank are retained |
| Card-identity screen | passed | Every non-energy identity is bridged to an Expanded-legal identity; deck construction and current banlist screens pass |
| Diagnostic English printing | normalized | A legal English card-pool record with matching name/functionally identical text is selected; Basic Energy preserves type |
| Original physical Japanese copy | unverified | The exact card physically used by each historical player is not proven |
| Paper competitive admission | not eligible | No original-print/paper review packet has qualified the rank |
| Diagnostic proxy use | permitted only as labeled | Simulation may use the normalized 60s; results are not original-event paper matchup evidence |

The 24-rank identity-normalized field is now suitable for exploratory policy/deck diagnostics, provided every result is labeled `identity_normalized_expanded_diagnostic_only`. It is **not** a complete Top32 evaluation: five ranks are format-incompatible and three source lists are unavailable. It must not be aggregated into a 32-rank competitive win-rate claim.

## Banlist and event-format boundary

The bundled card-pool Expanded flags remain a snapshot cross-check, not the current official banned-printing authority. Keep the separate official banlist overlay in force; the identity-normalization generator does not replace it. The source event was Japanese Extra; the diagnostic field is a hypothetical English-print Expanded reconstruction, not a claim that the original event was played under Expanded rules.

## Recommendation

1. Preserve all 32 rank statuses and original source rows unchanged.
2. Use the 24 normalized 60-card lists for diagnostic simulation as soon as the Twinleaf adapter resolves their card-pool IDs.
3. Keep the five incompatible and three unavailable ranks visible in all field-level reports.
4. Keep production V3 `availableRanks` and paper-admission status separate; do not weaken the evidence gate.
5. Report per-rank diagnostic outcomes, sample sizes, policy/engine versions and uncertainty. Never extrapolate the 24-rank diagnostic result to all 32 opponents.

## Non-claims

This does not establish original physical-card provenance, a complete 32-rank Expanded-legal field, any matchup result, a nominated final 60-card deck, or a 99.5% win-rate claim.


## Separate source-event and candidate legality dates

The Aichi event date is **10 May 2026**; the candidate deck is being evaluated as a current paper Expanded deck as of **13 November 2026**. Do not apply the historical opponent event date to the candidate's own card legality:

- MEE 013 Basic Psychic Energy was released on 16 September 2026, after Aichi. It is nevertheless legal for the **current candidate** under its own Expanded legality date. CRE 232 is another valid current Basic Psychic Energy printing.
- MEE 013 must not be represented as proof of the Basic Energy physically used by an Aichi player. The normalized opponent field's 34 MEE Basic Energy rows are generic same-type placeholders mapped to legal English Basic Energy records; `physical_source_print_verified` remains false.
- If reconstructing the historical Aichi Japanese Extra physical list, use a pre-event Japanese Basic Energy printing where that exact historical-print question matters (for Psychic Energy, Agent3 identifies SV-P 206). For current Expanded simulation, preserve only the Energy type and use a legal current English print.
- Keep `eventDate` (historical opponent/source context) and `expandedLegalityAsOf` (candidate's current Expanded legality) distinct. PR #46's separate fields are intentional and should not be collapsed.

This is a date-scope clarification, not a change to the 24-rank diagnostic-only status or the production paper-admission gate.
