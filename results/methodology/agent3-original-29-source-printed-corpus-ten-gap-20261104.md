# Agent 3: narrow 29-original printed-card corpus gaps to ten explicit identities

**4 November 2026 | real exact-local-card corpus census. This is a provenance and reproducibility improvement, not paper legality certification or match evidence.**

## Problem

The Aichi research field stores **29 authenticated original 60-card lists** with set-and-card-number print identities. Previous database scans conflated genuinely absent bundled records with exact printed records that were simply reachable under different set-index conventions or card display-name spellings. The [first all-29 source audit](../../scripts/agent3-original29-print-gap-census.cjs) counted **1,551 of 1,740** physical card copies matched under the old local mapping, with **189 source copies across 17 distinct source printing identities unresolved**, even though all Pokémon stages had become verifiable.

## Exact card corrections with fail-closed source identities

The existing [local original printing resolver](../../scripts/agent38-candidate-printing-audit.cjs) now matches the following previously unavailable authentic local card data, while checking exact source set, card number, local card ID, card name and class.

| Source identity or shorthand | Exact bundled record | Physical-source copies newly recognized |
| --- | --- | ---: |
| Battle Compressor PHF92 | `xy4-92 Battle Compressor Team Flare Gear` | 33 |
| Robo Substitute PHF102 | `xy4-102 Robo Substitute Team Flare Gear` | 2 |
| Target Whistle PHF106 | `xy4-106 Target Whistle Team Flare Gear` | 2 |
| Thunder Mountain ♢ LOT191 | `sm8-191 Thunder Mountain ◇`, Stadium Prism Star | 3 |
| Wondrous Labyrinth ♢ TEU158 | `sm9-158 Wondrous Labyrinth ◇`, Stadium Prism Star | 3 |
| Tropical Beach BWP50 | `bwp-BW50 Tropical Beach`, Stadium | 4 |
| Unit Energy LPM UPR138 | `sm5-138 Unit Energy LightningPsychicMetal`, Special Energy | 8 |

Together these recover **55 physically listed source copies**, without changing any opponent source 60. All of these records already existed in the installed English card files. The resolver uses tightly scoped, actual-card verified conditions for Team Flare suffixes, Prism Star glyph, one Unit Energy shorthand and existing BW promo prefixes. Source printing number changes, heart symbols and unsupported aliases are rejected in [expanded regression tests](../../tests/agent38-candidate-printing-audit.test.cjs). No new Trainer, Stadium, or Energy game effect was implemented or claimed accurate in Twinleaf.

The earlier source-only corrections for `SMP217`, `XYP49/67/177`, and Pokémon Prism Star glyphs are documented in the [29-of-29 original-stage report](agent3-local-promo-prism-stage-completeness-20261104.md). They also remain guarded against forged print identity or class.

## Full remaining exact-corpus gap

A subsequent real CI run [41773894929](https://github.com/FlareZ123/experiment-01/actions/runs/41773894929) **SUCCESS** on the full known 29-original roster established:


| Original source copies | Exact local English record status |
| --- | ---: |
| Total source cards | **1,740** (29 × 60) |
| Now matched | **1,606** |
| Still unmatched | **134** |
| Distinct remaining printed identities | **10** |
| Unmatched Pokémon printings | **0** |
| Unmatched Basic Energy copies | **120** across seven MEE numbers |
| Unmatched Trainer copies | **14** across three printed names |

The **remaining ten identities** are now explicitly preserved with rank, count, category, set code and printed number in the machine-readable [unresolved printing inventory](../aichi-2026/agent3-original29-printing-gap-20261104.json). The short actionable worklist is:

- **MEE Basic Energy**: Grass MEE9 (37 copies), Fire MEE10 (20), Water MEE11 (2), Lightning MEE12 (10), Psychic MEE13 (18), Fighting MEE14 (3), Darkness MEE15 (30). These 120 source card copies have explicit printed Basic Energy type; an unavailable matching exact local *printing* is a corpus coverage limitation, not an obstacle to recognizing the Energy type.
- **Palace Belt BWP153**: 3 copies in ranks 6 and 29; the local `bwp` card file does not contain this exact ID.
- **Palace Book SMP NAN25**: 6 copies in ranks 6,7,24; the local `smp` file does not contain this nonnumeric Japanese promotional record.
- **Player's Ceremony SP127**: 5 copies in ranks 3,6,24,29; the bundled `sp.json` corpus file is absent.

No card names, set numbers, printed counts or unresolved states have been guessed into resolved. Those three Trainers require independent provenance and paper legality or faithful engine behavior evaluation before they can be treated as native-playable exact original sources.

The pure [29-source print-gap census](../../scripts/agent3-original29-print-gap-census.cjs) checks that every one of the 1,740 physical copies is accounted for, reconciles unknown physical quantities by original rank and printed identity, and verifies zero Pokémon stages were lost. Three [pure tests](../../tests/agent3-original29-print-gap-census.test.cjs) passed in [CI 41773894929](https://github.com/FlareZ123/experiment-01/actions/runs/41773894929) along with updated exact identity tests. Native Twinleaf compilation was intentionally skipped.

## Next use and qualification limits

This exact worklist can prevent wasted attempts to reconstruct already bundled files from internet mirrors and focus provenance work on the **three still-unindexed Trainer identities** and seven Basic Energy printing references. It also improves the reliability of input resolutions, while leaving the original physical card source list unchanged.

The broader scientific goal still has **29 of 32 authenticated complete original opponent 60s** (ranks 23,25,28 missing), no selected optimized 60, zero competitively qualified full-field games and no 99.5% win-rate evidence. Resolving a source print display identity is distinct from implementing its attack or effect, independent deck legality, play policy and the paper tournament clock.

**Agent 3**
