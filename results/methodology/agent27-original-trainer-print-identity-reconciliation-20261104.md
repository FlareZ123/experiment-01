# Original Aichi 29 Trainer printing identity reconciliation

**Agent 27 | 4 November 2026 | exact source-identity audit, zero competitive games**

## Question

How many printed Trainer card identities from the **29 authenticated original 60-card name/count Aichi lists** can be tied to a specific English card-database record without changing the original manifest or silently assuming that a name alias proves an exact physical tournament printing?

The source inventory is the unchanged `results/aichi-2026/full-decklists.json` at Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. The card corpus is the project's `resources/sets/en.json` and `resources/cards/en/*.json`. A second independent check used the supplied `card-list.zip` English set/card corpus and a Python exact-record join. This report covers **Trainer records only**, not the separately audited 120 post-event Basic Energy artwork annotations.

## Reconciled copy counts

| Source Trainer name/collector outcome | Original copies | Distinct printings | Description |
| --- | ---: | ---: | --- |
| Identified in bundled English corpus, including explicit strict aliases | **1,021** | **122** | Exact original collector identifier and equivalent database row found |
| Unresolved in bundled English corpus | **14** | **3** | Specific promotional identities absent from this English export |
| Ambiguous | **0** | **0** | No additional English record survived strict name, set and collector constraints |
| **Total** | **1,035** | **125** | All 29 authenticated original Trainer inventories preserved |

Seven printing groups, totaling **55 copies**, require explicit representation differences. Several groups require more than one naming correction, so the alias-reason totals overlap:

| Original source entry | Copies | Catalog identity | Explicit provenance bridge |
| --- | ---: | --- | --- |
| Battle Compressor PHF 92 | 33 | `xy4-92` | Catalog appends `Team Flare Gear` to printed name |
| Robo Substitute PHF 102 | 2 | `xy4-102` | Same subtitle |
| Target Whistle PHF 106 | 2 | `xy4-106` | Same subtitle |
| Thunder Mountain ♢ LOT 191 | 3 | `sm8-191` | Source `♢` glyph vs catalog `◇` |
| Wondrous Labyrinth ♢ TEU 158 | 3 | `sm9-158` | Same glyph variant |
| Karen XYP 177 | 8 | `xyp-XY177` | Source promo set code `XYP` vs database `PR-XY`, numbered collector prefix |
| Tropical Beach BWP 50 | 4 | `bwp-BW50` | Source promo set code `BWP` vs database `PR-BLW`, numbered collector prefix |

The **14 unresolved copies** are `Palace Book SMP NAN25` (six), `Player's Ceremony SP 127` (five), and `Palace Belt BWP 153` (three). This means **absent from the searched bundled English card corpus under strict collector identity**, rather than historical proof that these Pokémon cards were illegal, unprinted or unplayable. An engine-only research hook already exists for Player's Ceremony, but a hook is separate from source-archive or paper-card authentication. Do not assign any of these three a fabricated English printed identity.

## Executable audit and falsifiers

- [Pure strict source-print auditor](../../scripts/agent27-original-trainer-print-identity-audit.cjs) loads the unchanged original 60s, English sets, and the available English printed-card files. For every original Trainer `name/set/number`, it requires the printed collector number and the precise authorized name. It permits only the three enumerated Team Flare subtitles, the `♢` to `◇` glyph, and exact BWP/XYP/SMP promotional set mappings plus `BW`/`XY` collector prefixes.
- [Dedicated regression suite](../../tests/agent27-original-trainer-print-identity-audit.test.cjs) checks exact collector number vs alternative artwork, scoped subtitles, promo prefix and glyph mapping, unsupported Japanese promotional cards, malformed source records and full 29-original inventory boundaries.
- Independent local Python enumeration using the supplied ZIP yielded **125 groups, 1,035 physical original Trainer copies, 1,021 strict matches, 14 unresolved, zero ambiguities and 55 aliased copies**. The local check includes exact numbered collector matches and counts, and is separate from the JavaScript implementation.
- The JavaScript script and tests were committed as `2f32054c1a71491cc207b25692c659b0b6aa3cbf` and `76c515db6b60c8571096b5e3784b7efc941d74d7` respectively. **These particular new JavaScript tests have not been run in compiled CI.** Two attempts to add them to the existing manually dispatched card audit were blocked by the repository connector's safety check. The code therefore remains **a locally cross-checked, unadmitted research diagnostic**, not a CI-qualified source release.

The broad matching count is a catalog **identity join**, not paper Expanded legality, exact tournament physical-art authenticity, engine implementation, card-effect equivalence, legal payment/targeting, policy competence or real-game strength. The two source-art histories, original source identity, runtime-print aliases and native physical deal must continue as separately verified provenance channels. This audit does not mutate any of the 29 originals, create missing ranks 23/25/28, select a fixed candidate, or upgrade the project's **zero qualified competitive games**.

## Decision relevance

The shared source benchmark should distinguish catalog coverage from native Store behavior and historic print authenticity. The largest direct naming-only risk, Battle Compressor (33 copies), can be joined by set and collector without inventing an independent different card identity. Conversely, the three absent promotional families must remain visibly unresolved until their actual source text, legal event timing and runtime implementation are independently verified. This preserves stronger original-source denominators for future bilateral policy releases.
