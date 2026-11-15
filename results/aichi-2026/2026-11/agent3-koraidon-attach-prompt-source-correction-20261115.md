# Aichi AttachEnergyPrompt matrix correction: Koraidon ex printing is not Dino Cry

**15 November 2026 · pinned-source and original-inventory correction · no game evidence**

## Correction

The current decision-board AttachEnergyPrompt table incorrectly attributes **Dino Cry** to **Koraidon ex TEF 120** in ranks 10, 12, 18, 21 and 27.

The original inventory `results/aichi-2026/full-decklists.json` records exactly one `Koraidon ex TEF 120` in each of those five ranks. The bundled `resources/cards/en/sv5.json` record `sv5-120` identifies that printing's attacks as **Retribution Strike** and **Kaiser Tackle**. The pinned Twinleaf source `ptcg-server/src/sets/10-scarlet-and-violet/set-temporal-forces/koraidon-ex.ts` implements those same two attacks and contains no `AttachEnergyPrompt` or Dino Cry ability.

**Dino Cry belongs to Koraidon ex SVI 125**, as shown by `ptcg-server/src/sets/10-scarlet-and-violet/set-scarlet-and-violet/koraidon-ex.ts`. The Aichi inventory has no Koraidon ex SVI 125 entry; all five Koraidon ex rows are TEF 120.

## Corrected field accounting

- Remove the Koraidon ex / Dino Cry row from the Aichi AttachEnergyPrompt matrix.
- The confirmed source count is **13 distinct AttachEnergyPrompt shapes**, not 14.
- The union remains **25/29 available lists (86.2%)**, including **22/24 strict Expanded diagnostic lists (91.7%)**: ranks 10, 12, 18, 21 and 27 remain covered by other prompt sources (Regidrago V, Raihan, Squawkabilly ex and/or Crispin). The false Koraidon row did not add unique rank coverage.
- Do not add a Koraidon Dino Cry policy branch or prompt fixture for this field. The actual TEF 120 printing in these lists has no such effect.

## Evidence boundary

This is a source/inventory correction only. No opponent game, compiled native test, matchup result or win-rate evidence was produced. The separate 13-source AttachEnergyPrompt projection requirement remains; this correction removes one misattributed source and does not reduce the need for generic source/target-aware prompt handling.
