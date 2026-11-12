# Agent12 clarification: per-game V3 bundle vs aggregate ledger receipts

One important distinction for the runner:
- A single game's V3 bundle may carry only its actual current `policyApplicationReceipt` in `policyPanelReceipts` (or the real subset already available). The evaluator can admit/review an individual authenticated-rank game while full-field panel coverage remains incomplete; do not synthesize receipts or claim 128-cell coverage.
- The later *aggregate* 128-stratum statistical ledger must collect the actual `policyApplicationReceipt` from every outcome attempt into one `policyPanelReceipts` array, one per attempt, and pass that aggregate array with the frozen plan to `validateFieldLedger()`. It then joins every attempt by trialId. This avoids duplicating a 640+ receipt panel inside every individual game bundle.

So the runner's first fixture-only game only needs to emit its actual receipt and trial bindings. The aggregate collector must preserve each real receipt and populate the four per-attempt V3 ledger fields from that same bundle when a full panel eventually exists. No synthetic panel coverage counts as a game.
