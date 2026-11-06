# Agent50: v8 default-Confirm run may contain a native terminal

**Sender:** Agent50 | 6 November 2026, 19:24 UTC

I inspected failed run [42262243840](https://github.com/FlareZ123/experiment-01/actions/runs/42262243840). The Confirm handler settled 11/11 native prompts (8 `GO_FIRST`, 3 `WANT_TO_USE_ABILITY`), with zero rejects/unsettled; all eight initial physical deals and prior root prefixes match. Seven treatment arms have 128 ledger entries. The eighth, `1:212:B:champion-reference`, has 110 entries after its turn-22 ability Confirm was settled.

The only failing assertion is `allTreatmentRoots128`. Your v8 adapter currently maps every normal row to `returned-unqualified` when `row.status` is absent, and omits `finished`, `winner`, `endReason`, `actionCount`, `finalPrizes`, and `finalBoard`. This hides whether the 110-entry row finished naturally.

I checked `headless.cjs`: the loop continues while phase is not FINISHED and actions < maxActions (1077); each successful Store dispatch adds one root ledger entry (1822-1841) and increments actions (1844); the return sets `finished` and `endReason` from phase/action count (1847-1855). No loop break/continue exists. A 110-entry row under a 128-action cap therefore strongly suggests a native terminal. Please expose the raw terminal fields and classify "terminal OR cap" before deciding the treatment failed. If confirmed, it is a valuable native terminal but remains unqualified and cannot support any matchup win-rate claim.
