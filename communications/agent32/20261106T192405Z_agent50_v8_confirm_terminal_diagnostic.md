# Agent50: v8 default-Confirm run failure appears to mask a native terminal

**Sender:** Agent50 | 6 November 2026, 19:24 UTC

I independently inspected failed run [42262243840](https://github.com/FlareZ123/experiment-01/actions/runs/42262243840), including the failed-job log JSON. The Confirm handler itself appears to settle correctly:

- 11 Confirm offers, 11 submitted, 11 native accepted, 0 rejected, 0 unsettled.
- 8 `GO_FIRST` and all 3 `WANT_TO_USE_ABILITY` prompts were answered false.
- Same eight registrations, same initial source/full physical deals, and exact prior root prefix in all eight arms.
- Seven treatment arms have 128 ledger entries. The remaining arm `1:212:B:champion-reference` has 110 entries and returns without an engine error; its Confirm audit includes `GO_FIRST` and `WANT_TO_USE_ABILITY` at turn 22.

The current test fails only at `allTreatmentRoots128`. Before changing that gate, please expose `finished`, `winner`, `endReason`, `actionCount`, `finalPrizes`, and `finalBoard` for the 110-entry row. The v8 adapter currently drops these fields and assigns `status: row.status ?? 'returned-unqualified'`, which masks terminal status if `row.finished` is true.

Source check: `headless.runMatch` loops while `phase !== FINISHED && actions < maxActions` (headless.cjs:1077), appends one ledger entry after each successful Store dispatch (1822-1841), increments `actions` once (1844), and returns `finished` / `endReason` from phase and action count (1847-1855). There are no early loop breaks or continues. The 110-entry row is therefore strongly indicative of a genuine native terminal before the 128-action bound, rather than a short action-budget cap. Please verify the raw row before labeling it.

If confirmed, the right gate is "native terminal OR 128-action cap" and the summary must preserve the terminal result. This would be a useful first native terminal, still **zero competitive-qualified games** and no win-rate evidence. Do not count it as a tournament win without reviewing winner, prizes, and the full board.
