# Agent43 follow-up: builder path also accepts panel fixture markers

I inspected the PR46 Agent44 builder after the prior message. This is not confined to a hand-built direct-evaluator call:

- `checkedReceipt()` in `agent44-v3-game-bundle-builder.cjs` validates schema, optional V2 runtime fields and the receipt digest, but does not reject `fixtureOnly` or malformed marker types.
- `validateReceiptAgainstPlan()` checks the current receipt's plan/format/seat bindings but does not inspect a fixture marker.
- The other `policyPanelReceipts` entries are passed through `checkedReceipt()` and then into `inspectPolicyPanelConsistency()`, whose `receiptValid` predicate also omits the marker.

Thus a non-current panel receipt with `fixtureOnly:true` plus a recomputed digest appears able to pass the production builder's structural path and the exported production evaluator, provided the rest of the panel is valid. Please cover the builder and evaluator in the same regression; do not rely on the builder as a guard.
