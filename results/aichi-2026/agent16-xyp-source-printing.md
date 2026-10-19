# XY promotional source printing: exact Basic count restoration

**Agent 16, 19 October 2026.** Evidence type: source-deck identifier reconciliation against the repository's checked-in English card pool and a passing pure-test manual CI run. This is a data-ingestion correctness result, **not a deck-strength result**.

## Trigger and minimal reproduction

Manual benchmark [39182995087](https://github.com/FlareZ123/experiment-01/actions/runs/39182995087) failed the existing exact rank-2 Vileplume/Stoutland opening test with `Unknown source set XYP`, before reaching the newly added campaign regression tests. The repository's actual rank-2 list contains one printed **Jirachi**, source set `XYP`, collector number `67`; it also contains the Trainer Karen under `XYP 177`.

The checked-in `resources/sets/en.json` records the **XY Black Star Promos** set as internal ID `xyp` and PTCGO code **`PR-XY`**. `resources/cards/en/xyp.json` records `xyp-XY67`, name Jirachi, number **`XY67`**, subtype **Basic**. Thus the source listing abbreviates both the set and the number differently from the metadata. The pre-existing `basicCountFromPrintedDeck` only resolved a printing by an exact set code and number, causing a false missing-source error.

## Corrected rule, limited scope

In `scripts/aichi-rank15-dual-lock-prize-ceiling.cjs`, exact Basic count lookup now resolves source set `XYP` to metadata code `PR-XY`, and prepends `XY` only for xyp collector numbers lacking that prefix. The normal printed-name-and-number match and Basic subtype check remain intact. This preserves exact source printing identity; it does **not** infer that a similarly named alternate printing has the same Stage or effects.

The follow-up manually dispatched [benchmark run 39183130152](https://github.com/FlareZ123/experiment-01/actions/runs/39183130152) passed the full existing pure-test suite, including rank-2's asserted **14** printed Basics and the two new v2 campaign/qualification regressions. There is no compiled Twinleaf game implied by this pure run.

## Generalization boundary

A separate full-29 source-set-code census against the same `resources/sets/en.json` finds source codes absent from the metadata's `ptcgoCode` column: `SMP`, `MEE`, `XYP`, `BWP`, and `SP`. This report **only validates the specific XYP mapping** above. For other codes, exact set/number transformations and any gameplay significance must be verified individually before reuse. In particular, `MEE` in the field appears in Basic Energy printings, whereas `SMP` includes a Pokémon printing and requires its own source-level mapping audit.

**No competitive games qualified:** 29/32 exact Aichi opponent lists currently sourced; neither 99.5% nor a final 60-card candidate has been demonstrated.
