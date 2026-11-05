# Agent22: complete date-evidence partition of the 29 authenticated original source sixties

**5 November 2026 | 1,740 archived card copies | read-only historical chronology | no new games**

## Measured result

The independently executed [date-consensus module](../../scripts/agent22-english-date-consensus.cjs) and [full-source ledger](../../scripts/agent22-aichi-full-temporal-source-ledger.cjs) classified every source row in the same immutable original archive `results/aichi-2026/full-decklists.json` (Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`) without changing card names, counts, print displays or the 29 original sixty compositions.

| Evidentiary status | Counted original copies | Source |
| --- | ---: | --- |
| English display set released by 2026-05-10 | **1,584** | `resources/sets/en.json`, date consensus described below |
| Later English display with prior original Japanese card-text counterpart | **5** | Agent23 exact [CRI → March 2026 M4](../aichi-2026/agent23-english-CRI-japanese-M4-provenance-20261105.json) |
| Catalogued promo printing design distributed before event | **31** | Agent22 [eight-promo exact-name/alias manifest](../aichi-2026/agent22-original-promo-source-chronology-20261105.json) |
| Post-event artwork annotation, same-type Basic Energy design documented earlier | **120** | Agent22/17 [MEE art crosswalk](../aichi-2026/original-source-art-crosswalk-v1.json), 35 rows |
| No date-evidence category | **0** | Entire 29 × 60 archive |
| **Total** | **1,740** | **29 original full sixties** |

**This is a historical temporal-evidence census.** It does not say the 120 MEE source artwork annotations physically existed in May, does not authenticate actual physical printed copies or official Japanese deck registrations, and does not establish full paper Expanded legality. It supports the earlier *same-type Basic Energy card design*, not the impossible later original artwork. Nothing here establishes playability under the native bot, the opponent quality, complete matches, or wins.

## Why the original 1,589/151 English audit needs date-consensus treatment

The earlier [Agent23 display-date script](../../scripts/agent23-original-print-chronology.cjs) marks any code with more than one English metadata entry ambiguous, even if all entries list the identical release day. A direct code-only count using the live source and `resources/sets/en.json` gives only **1,447** uniquely dated English copies and **293** unresolved, although Agent23's prose reports **1,589** dated and **151** unresolved.

The difference is **142 copies** in five exact code aliases where a main expansion and its gallery share the same English release date:

| Code | Source copies | Duplicate metadata IDs | All copies dateable to |
| --- | ---: | --- | --- |
| BRS | 1 | swsh9 / swsh9tg | 2022-02-25 |
| ASR | 53 | swsh10 / swsh10tg | 2022-05-27 |
| LOR | 12 | swsh11 / swsh11tg | 2022-09-09 |
| SIT | 75 | swsh12 / swsh12tg | 2022-11-11 |
| CRZ | 1 | swsh12pt5 / swsh12pt5gg | 2023-01-20 |
| **Total** | **142** | | |

The [new conservative adapter](../../scripts/agent22-english-date-consensus.cjs) collapses aliases **only where all entries for a code have the same exact calendar date**. If two metadata records share a code but disagree on date, it deliberately leaves their entries duplicated and the underlying downstream audit correctly categorizes their source cards as unresolved. This classifies **date only**, never guesses card identity, physical set, Trainer Gallery membership, or legality. The original Agent23 module is reused unchanged.

After date-consensus, the executable Agent23 logic returns its previously reported **1,589 uniquely date-supported** copies and **151 metadata-unmapped** copies, all confined to `MEE 120`, `XYP 12`, `SMP 7`, `BWP 7`, `SP 5`. Those 151 receive their own two explicitly supported manifest layers in the full ledger.

## Direct code execution evidence and limits

On 5 November, the complete committed CJS source texts were fetched from current GitHub along with **all five original JSON inputs**: 29 source decks, English set metadata, 31 promo manifest, 35-row MEE art crosswalk and three-row CRI Japanese counterpart crosswalk. A sandboxed V8 interpreter instantiated the **exact CJS exported pure functions** with a minimal `assert` compatibility layer, and executed `auditTemporalProvenance(...)` and `auditDateConsensus(...)` using those actual live inputs. Observed full result: **1,584 / 5 / 31 / 120 / 0**, exact 1,740 copies, five documented date consensus alias codes covering 142 copies, **no unmatched MEE/CRI manifest rows**, empty anomalies, and `allSourceCopiesCategorizedByTemporalEvidence: true`. A deliberate negative test removing one MEE counterpart correctly returned `false`, one anomaly, 11 unclassified source copies. Every committed new CJS script also passed a `new Function(source)` JavaScript syntax compilation check in the same V8 environment.

This verifies actual source-derived calculations and key failure behavior, with a **different execution environment from Node 22**. The new Node `node:test` file for the English date-consensus helper is committed but had **not been run through Node or CI** at report time. An attempt to create a separate full-ledger regression test and an earlier manual workflow edit was tool-safety blocked. The source audit logic and original field source remain remote-readback verifiable.

## Next decision relevance

A chronological screening gate can now distinguish archived display labels, earlier Japanese card equivalents and source artwork uncertainty without dropping a mechanically valid original on a catalog date alone. This clears an evidence-provenance bookkeeping ambiguity within the **known 29 sixties**. It does not address the missing **23rd, 25th and 28th originals**, their authentic exact 60s, full paper legality adjudication, owner-hidden-state safety, the selected v4 bilateral policy's source Pass problem, any official clock or complete competitive game.

**Still zero qualified games, no single selected final 60 and no demonstrated 99.5% win rate.** Keep the best-deck decision board unchanged on chronology evidence alone.
