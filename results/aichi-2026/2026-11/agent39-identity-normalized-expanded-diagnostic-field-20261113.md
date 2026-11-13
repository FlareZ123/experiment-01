# Agent39: identity-normalized Aichi Expanded diagnostic field

**Status:** CI-validated machine-readable export of 24 legal English Expanded normalized diagnostic reconstructions; original physical Japanese copies remain unverified, production paper admission remains 0/32, and no competitive evidence is claimed.  
**Date:** 13 November 2026  
**Scope:** The 24 Aichi source lists that passed the English Expanded card-identity and deck-construction screens.

## Result

The existing Aichi audit now emits a separate `diagnostic_normalized_field` alongside the unchanged source-row audit. The successful [CI run 43407979154](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154) uploaded [artifact 14027319169](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154/artifacts/14027319169). Extract `aichi-expanded-identity-audit.json` and read `diagnostic_normalized_field.decks`.

| Measure | Result |
|---|---:|
| Included ranks | 24 |
| Source card rows preserved | 812 |
| Card copies | 1,440 |
| Exact English print-identity rows | 745 |
| Explicit canonical English identity aliases | 33 |
| Explicit same-type MEE Basic Energy resolutions | 34 |
| Decks with exactly 60 cards | 24/24 |
| Physically verified original Japanese copies | 0 |

Included ranks are 1, 2, 4, 5, 8–22, 26, 27, 30–32. The separate [field manifest](../diagnostic/identity-screened-24-field.json) remains the rank allowlist and still excludes incompatible ranks 3, 6, 7, 24, 29 and unavailable ranks 23, 25, 28.

## Explicit transformations

The normalized output preserves every source row's rank-local row index, source name, source set/number, identity-screen status and event-date status. It does not rewrite `full-decklists.json`.

The 33 canonical aliases are:

- 17 `Battle Compressor` PHF 92 → `xy4-92`, canonical name `Battle Compressor Team Flare Gear`
- 6 Karen XYP 177 → `xyp-XY177`
- 4 Tapu Koko ♢ TEU 51 → `sm9-51`, canonical name Tapu Koko ◇
- 2 Ditto ♢ LOT 154 → `sm8-154`, canonical name Ditto ◇
- 2 Unit Energy LPM UPR 138 → `sm5-138`, canonical name Unit Energy LightningPsychicMetal
- 1 Trevenant & Dusknoir-GX SMP 217 → `smp-SM217`
- 1 Jirachi XYP 67 → `xyp-XY67`

The 34 generic MEE Basic Energy rows are mapped to an Expanded-legal English Basic Energy of the **same type**, without changing Energy type:

| Source identity | Source rows | Copies | Normalized card-pool ID |
|---|---:|---:|---|
| Grass Energy | 11 | 37 | `sve-1` |
| Fire Energy | 9 | 20 | `sve-2` |
| Darkness Energy | 6 | 30 | `sve-7` |
| Lightning Energy | 4 | 10 | `sve-4` |
| Psychic Energy | 3 | 18 | `sve-5` |
| Fighting Energy | 1 | 3 | `sve-6` |
| **Total** | **34** | **118** | — |

Each normalized row contains the source row index/name/source printing, canonical resource card-pool ID, canonical English name/count/supertype/subtypes, and a SHA-256 digest of functional card-text fields. For non-energy rows, the normalized `printing` retains the original English display set/number while `card_pool_printing` separately identifies the canonical resource record. For generic MEE Basic Energy, `printing` is the selected same-type SVE (or XY for Fairy) English printing and `card_pool_printing` identifies that record. The digest binds the normalized English card record used by downstream work; it does **not** prove the exact physical Japanese copy or its text.

### Twinleaf engine proxy (separate from source normalization)

The normalized artifact contains Night Stretcher ASC/196 in ranks 1, 8, 19 and 22 (six copies). For these non-energy rows, `source.printing` and `normalized.printing` intentionally remain ASC/196 and `card_pool_printing` remains `me2pt5/196`. The pinned Twinleaf revision registers only the functionally identical Night Stretcher SFA/61 implementation. The Agent39 bridge therefore uses one exact source-keyed engine-only proxy: `card_id=me2pt5-196`, `name=Night Stretcher`, `normalized.printing=ASC/196` → Twinleaf `SFA/61`. The original source rows, normalized print identity hash, card-pool identity and functional deck hash are not rewritten; the existing row mapping retains source printing/card-pool printing separately from the Twinleaf `set`/`set_number` used for engine registration. This is not a physical-print substitution or a change to the normalized source artifact. The V3 fixture requires its own matching adapter mapping. The bridge code and exact/negative-control regression are committed, but actual pinned CardManager resolution remains pending the owner-dispatched bridge run.

## Admission and interpretation boundary

The field is explicitly marked `diagnostic_only: true`, `physical_source_print_status: unverified`, `paper_admission_eligible: false` and `competitive_admission_eligible: false`. The 24 normalized lists have legal English Expanded identities, deck construction and current-banlist screens, so they are suitable as labeled diagnostic simulation proxies once Twinleaf card resolution succeeds. The false production-admission flags remain intentional: they do not certify the original physical Japanese copies or promote any rank to the production paper field. It is a reproducible English-print proxy for exploratory policy/deck diagnostics, not a newly admitted paper Expanded opponent field.

The bundled card-pool Expanded flags remain a snapshot cross-check, not the current official banned-printing authority. The separate [official banlist overlay](agent3-expanded-banlist-snapshot-discrepancy-20261113.md) reports zero exact banned-print hits across the 29 authenticated source lists, while documenting stale `expanded: Legal` flags for banned prints. Keep that independent overlay in force; this generator does not replace it.

The card IDs are identifiers from `resources/cards/en`. A Twinleaf integration must explicitly resolve them through its adapter before constructing simulator decks; this export does not assert direct Twinleaf-ID compatibility. No matchup games were run, no paper matchup is qualified, and no win-rate or 99.5% claim follows from this work.

## Reproduction

- Generator: `scripts/aichi_expanded_identity_audit.py` (`build_normalized_diagnostic_decks`)
- Regression: `tests/test_aichi_expanded_identity_audit.py`
- CI run: [43407979154](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154), head `6d476d316be93bfd0d5d09ca59c3af9db59b2260` (supersedes run 43407458488; this revision preserves source display printings separately from canonical card-pool IDs)
- Artifact: [14027319169](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154/artifacts/14027319169), 30-day retention
- Source decklist: `results/aichi-2026/full-decklists.json`, blob `ae773f6201d7aa69d31914dbfee66f3fba692200`

The artifact is the machine-readable output for this run; the committed generator and pinned repository card-pool snapshot make it reproducible after artifact expiry.
