# Agent39 memory

## Invocation and durable context
- Claimed this identity at 2026-11-13T06:27:22.218167Z. This invocation's 70-minute release threshold is 07:37:22Z.
- Primary focus: Aichi Open League 2026 Top 32 source recovery, Japanese print chronology bridges, and Expanded normalization/eligibility for the candidate field.
- Do not treat English display set metadata as proof of the exact physical Japanese card used. Keep source decklist, card identity, Japanese pre-event availability, and physical-copy provenance as separate claims.

## Work completed in this incarnation
- Ranks 8–16: screened nine exact 60-card lists against the English card pool, official Expanded banned-printing overlay and Japanese identity constraints. All nine pass four-copy, exactly-one-ACE-SPEC, Prism Star and Radiant construction checks. See `results/aichi-2026/2026-11/agent39-ranks8-16-expanded-eligibility-screen-20261113.md`.
- Created normalized English simulation inputs for ranks 8–16, preserving source rows and only normalizing MEE Basic Energy placeholders to SVE Basic Energy and Battle Compressor PHF 92 to canonical XY4 92. All nine are explicitly not admitted as physically verified field lists. See `agent39-ranks8-16-expanded-normalized-inputs-20261113.json`.
- XYP Japanese-print bridge: Jirachi XYP 67 → 129/XY-P; Regirock XYP 49 → 104/XY-P; Karen XYP 177 → 256/XY-P. Covers 9 rows / 12 copies. See `agent39-xyp-japanese-print-crosswalk-20261113.md/.json`.
- BWP/SMP bridge: Tropical Beach BWP 50 → 050/BW-P (WCS 2012), ranks 3/6/29 (3 rows / 4 copies); Trevenant & Dusknoir-GX SMP 217 → Japanese SM12a 179/173 or 053/173 (released 2019-10-04), rank 1 (1 row / 1 copy). Corrected the source player in JSON to Yasunori Kato. See `agent39-bwp-smp-japanese-print-crosswalk-20261113.md/.json`.
- Combined manual Japanese bridges cover 13 rows / 17 copies. Agent6's raw English-only chronology census remains 57 rows / 151 copies; do not change its English-metadata test. Remaining 44 rows / 134 copies without Japanese print bridge are 35 MEE Basic Energy rows / 120 copies plus 9 rows / 14 copies of three Japanese-only promos: Palace Belt (2/3), Palace Book (3/6), Player's Ceremony (4/5). Those promo rows are confined to the five format-incompatible ranks. No unbridged non-energy promo identity remains in the 24 potentially compatible lists.
- Ranks 1/2/4/5 construction check addendum: all four pass 60 cards, four-copy, exactly one ACE SPEC, Prism Star and Radiant limits. Rank 1 has Radiant Eternatus; rank 4 has Ditto Prism Star. See `agent39-ranks1-2-4-5-deck-construction-check-20261113.md`.
- Added Trubbish CRI 56 → M4 054/083 (2026-03-13) to `scripts/aichi_expanded_identity_audit.py`, with a unit test. This cleared the only failure in the 24-rank Python identity audit.
- CI run #43386479504 passed the 24-rank Python identity audit and all-24 deck-construction Node test; artifact 14018014550. Run URL: https://github.com/FlareZ123/experiment-01/actions/runs/43386479504.
- Added Node tests for normalized ranks 8–16 inputs, XYP crosswalk, BWP/SMP crosswalk, and all-24 construction. The all-24 construction test passed in CI. The manual card-coverage job is skipped on push; the normalized/XYP/BWP/SMP tests are wired there and still need a manual run.
- BWP/SMP test initially failed because the crosswalk JSON used the wrong rank-1 player name; corrected it to Yasunori Kato. The correction was a data-only commit and did not trigger another push run; manual card-coverage run should verify it.
- Updated `results/README.md` with 24/24 identity-screened status, construction checks, normalized input links and combined Japanese-print bridge counts.

## Important caveats
- 24/24 are identity-screened, not physically authenticated. Exact physical copies remain unverified.
- Five lists remain Expanded-incompatible because of Palace Book, Palace Belt and Player's Ceremony; three Top 32 lists (ranks 23, 25, 28) remain missing.
- No matchup simulation or win-rate evidence was produced in this incarnation. Do not claim 99.5%.
- The all-24 Python identity screen does not replace the independent current official banned-printing overlay; keep that evidence separate.

## Next useful actions
1. Run the manual `aichi-card-audit.yml` card-coverage job to execute the normalized-input, XYP, BWP/SMP crosswalk tests after the Yasunori Kato correction.
2. If the BWP/SMP test fails again, inspect only the failed job's step/log tail; do not broaden to full logs.
3. Continue source recovery for ranks 23, 25 and 28. Respect the paywall on the Kume source; do not infer missing 60-card lists.
4. Obtain exact physical-copy evidence only where it could change identity/legality; keep the 24/24 identity result distinct from physical proof.
5. Continue coordination through Agent6 (English chronology), Agent48 (identity audit), and Agent3 (field compatibility/banlist).

---

## 2026-11-13 normal incarnation (roll 1; claimed 10:03:58Z)

### Completed this incarnation

- Extended `scripts/aichi_expanded_identity_audit.py` to emit a separate `diagnostic_normalized_field` without modifying `results/aichi-2026/full-decklists.json` or the 24-rank allowlist. Corrected v2 CI: [run 43407979154](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154), [artifact 14027319169](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154/artifacts/14027319169). Do not consume superseded v1 artifact 14028161314.
- v2 output: 24 ranks, 812 source rows, 1,440 copies; 745 exact English print identities, 33 canonical aliases, 34 MEE Basic Energy source rows / 118 copies. Each row has a resource card-pool ID and functional-text SHA-256.
- Important schema correction: for non-energy rows, `normalized.printing` preserves the source English display set/number, while `normalized.card_pool_printing` carries the canonical resource set ID/number. MEE Basic Energy resolves to same-type SVE/XY print. This prevents loss of source display identity when canonical aliases are used.
- Added human reports:
  - `results/aichi-2026/2026-11/agent39-identity-normalized-expanded-diagnostic-field-20261113.md`
  - `results/aichi-2026/2026-11/agent39-24-rank-diagnostic-field-composition-20261113.md`
- Composition: 9 Regidrago, 4 Absol Garbodor, 2 Raichu Electrode, and 9 singleton archetypes across the 24 diagnostic lists. Top-copy and deck-prevalence counts are in the composition report. This is descriptive only, not matchup evidence.
- Added a fail-closed Twinleaf bridge:
  - `simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs`
  - `tests/2026-11/agent39-aichi-twinleaf-decklist-bridge.test.cjs`
  - `results/aichi-2026/2026-11/agent39-twinleaf-card-identity-bridge-20261113.md`
  The adapter joins on Twinleaf `Card.set + Card.setNumber` using `normalized.printing.set + normalized.printing.number`, then emits 60 actual `Card.fullName` strings as `registered60`, a `decklist_for_seat: {id, cards}` object, and compressed `registered60_counts: [{printing, copies}]`. It merges duplicate source rows, preserves row-level provenance, verifies exact 60-card totals and fails closed on missing/ambiguous matches. Local Node 22 checks/tests: 5/5 passed. Added syntax/test checks to the existing manual-only `.github/workflows/agent5-owner-root-native.yml`; did not dispatch.
- The bridge is **not yet run against compiled Twinleaf**. Pinned submodule remains `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The helper expects `vendor/twinleaf/ptcg-server/output` after the pinned build. No 24-deck Twinleaf coverage result or matchup evidence is claimed.
- Public source recovery leads only (no exact lists recovered): Pokekameshi page 2 identifies a 28th-place Regidrago player handle “Replica” and a Top32 “kume” Electric Rain/Aloha-Raichu entry. The latter's note article is paywalled beyond its preview. Agent3's independent Limitless cross-check now corroborates rank23 Yuki Ueno as Regidrago, rank25 Kazuki Kumegawa as Electric Rain/Alolan Raichu from the public note preview, and rank28 Jo Kato as Regidrago; exact 60-card lists remain unavailable. Pokekameshi's Replica/28th Regidrago handle is a likely but unproven identity join to Jo Kato. An Itoko note/image code has unknown rank and must not be assigned to Yuki Ueno. No source decklist or rank manifest was edited.

### Communications

Sent updates to agents 3, 5, 12, 36, 48, and 50 about the normalized field, v2 printing semantics, field composition, missing-rank leads, and Twinleaf bridge. Agent36 has not replied as of 10:43Z; his lease appears stale, so avoid assuming his review occurred.

### Next actions

1. Ask Agent36/Agent5 to review the bridge and run it only after the owner-authorized pinned Twinleaf build/integration gates. Inspect all unresolved set/setNumber matches before feeding any deck to simulation.
2. Do not treat a complete Twinleaf identity mapping as paper admission: the 24 source lists remain diagnostic-only, physical Japanese source prints unverified, and 5 incompatible + 3 unavailable ranks remain excluded.
3. Continue rank23/25/28 source recovery only if a source provides an exact full list and reliable rank/player mapping. Do not reconstruct a list from archetype or paywalled material.
4. Once owner gates pass, feed all 24 rank-specific `registered60` decks to the diagnostic runner and report every matchup separately; do not optimize only for the 9 Regidrago lists.

### Critical Twinleaf promo-number correction (10:50Z)

An initial bridge implementation incorrectly used `normalized.card_pool_printing.number` as Twinleaf `Card.setNumber`. Source inspection disproved that assumption. The correct key is:

`normalized.printing.set + normalized.printing.number -> Twinleaf Card.set + Card.setNumber -> Card.fullName`.

The resource's canonical number can prefix promo numbers that Twinleaf omits:
- Karen: source XYP 177; card-pool XY177; Twinleaf setNumber 177.
- Jirachi: source XYP 67; card-pool XY67; Twinleaf setNumber 67.
- Trevenant & Dusknoir-GX: source SMP 217; card-pool SM217; Twinleaf setNumber 217.

Updated the bridge script, tests, and report; test cases now prove both XYP and SMP prefix mismatches. Local Node22 tests still pass 5/5. Sent explicit correction messages to agents 3, 5, 12, 36, 48, and 50. Do not reuse the earlier 10:22 message's card-pool-number join suggestion.

### Agent5 decklist interface correction (10:55Z)

Inspected `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs`: Agent5's belief input consumes a 60-element string array of Twinleaf fullName values, and its public decklist provider uses `{id, cards: string[]}`. The bridge initially exposed only compressed `{printing, copies}` rows, which was not directly compatible. Corrected it to emit:
- `registered60`: expanded 60-string array;
- `decklist_for_seat: {id, cards}`: provider-compatible decklist object;
- `registered60_counts`: compressed audit-only rows.

Tests now assert exact string-array length and provider object shape, and assert incomplete mappings emit no partial deck. Corrected report and correction messages sent to agents 3, 5, 12, 36, 48, 50. Local Node22 tests remain 5/5 passing.

### Full Top32 archetype skeleton update (11:00Z)

Agent3 independently joined the published rank/archetype metadata and missing-list labels. Added the full 32-rank skeleton to the field composition report:
- Regidrago 11 (9 screened + missing ranks 23, 28)
- Absol Garbodor 4
- Raichu Electrode Combo 3 (2 screened + missing rank 25)
- Iron Thorns 3 (incompatible ranks 6, 24, 29)
- Snorlax Stall 2 (incompatible ranks 3, 7)
- Nine singleton archetypes 9

This demonstrates the 24-rank diagnostic subset is not representative of the full Top32: it omits all five incompatible Iron Thorns/Snorlax lists and the three missing lists. The composition report also links Agent50's retrospective 24-rank native outcome split (45 matched pairs, 34 both-terminal, bounds [-7,+11]); this is censored native-policy evidence only, not a win-rate estimate. Shared the updated archetype evidence with agents 3, 5, 12, 36, 48, and 50.
