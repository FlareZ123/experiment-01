# Independent Aichi 2026 source-ingestion comparison

**Agent 3, 15 October 2026.** Evidence: independent live-source ingester `scripts/ingest_aichi.py` validated by [manual CI 38818521367](https://github.com/FlareZ123/experiment-01/actions/runs/38818521367), compared against Agent 1's separate DOM/printing-aware `scripts/aichi_import.py` output at `results/aichi-2026/full-decklists.json`.

## Exact structural comparison

Both independently parsed sources contain the same **29 published decks and 989 card rows**, each with **60 cards**, and the same unpublished ranks **23, 25, 28**. The rank/category/count/name rows are in identical order after normalizing **the one text-rendering difference:** twelve card lines in the simpler text extractor omit the printed Prism Star suffix ` ♢`.

Prism Star rows where the suffix was missing from the independently extracted strings:

| Rank | Source label in the printing-aware importer |
| --- | --- |
| 4, 17 | Ditto ♢ |
| 6, 24, 29 | Thunder Mountain ♢ |
| 6, 24, 29 | Wondrous Labyrinth ♢ |
| 8, 19, 22, 26 | Tapu Koko ♢ |

Reproducibility: concatenate each row in the order stored as `{rank}|{category}|{count}|{name}\n`, normalize only ` ♢` to empty in the primary importer, and compare UTF-16-code-unit FNV-1a 64-bit digests. Both sources produce **0x4b50348e8847497c** with **25,069 characters**. Without this normalization, the printing-aware source hash is `0xa7ab60ea391fca1c` because it correctly preserves Prism Star. All 989 rows otherwise agree; agreement is conditioned on the source display and independent parser choices rather than external card-text accuracy.

**Source precedence:** Agent 1's [full-decklists.json](full-decklists.json) is preferred for engine intake because it preserves source-displayed printing `set`, `number`, and `language` for **every 989 rows** and retains the Prism Star suffix. Agent 3's [compact name-level archive](published-name-level.json.gz.b64) is only a cross-check, not an exact-printing source, and `simulation/twinleaf/aichi-source.cjs` must not be used to claim exact printings.

## Special Japanese-print verification

Three published source printings whose exact set/number appear in Agent 1's manifest are confirmed on independent Japanese card records:

- Palace Book: `SMP NAN25`, an Item that draws three cards and ends the turn; [Limitless JP card record](https://limitlesstcg.com/cards/jp/SMP/NAN25?translate=en).
- Palace Belt: `BWP 153`, a Tool modifying the start-of-turn draw while Active; [Limitless JP card record](https://limitlesstcg.com/cards/jp/BWP/153?translate=en).
- Player's Ceremony: `SP 127`, a Stadium offering draw two at the cost of ending the turn; [Limitless JP card record](https://limitlesstcg.com/cards/jp/sp/127?translate=en).

All three are listed as legal in *Japanese* Expanded and unreleased internationally on the linked card pages. Their translated text is unofficial, requiring further primary-rule verification for engine implementation.

Examples showing the value of printing identification: rank 1 Mimikyu is `GRI 58`; rank 8 Garbodor is `LTR 68`; rank 22 Garbodor is `BKP 57` with two Trubbish printings `FST 168` and `NVI 48`. Name-only imports discard these distinctions.

## Caveats and next priority

The English-snapshot audit in `results/aichi-2026/card-coverage.json` reports **923 matched rows, 22 name disagreements, 39 absent-set rows and 5 absent-card-number rows** among 989 original rows. Many absent-set rows refer to `MEE` printings of ordinary Basic Energy, and some name disagreements are Trainer naming differences. These categories measure bundled English-data coverage, not Japanese card legality or implemented engine semantics. Reconcile display IDs against the actual pinned Twinleaf set catalogue before treating a deck as playable in the engine.

No controlled matchup games were completed by this investigation. The 99.5% field target is not verified.
