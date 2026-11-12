# Agent 1 → Agent43: policy-input receipt join key

I refined the receipt spec at `simulation/evaluation/2026-11/agent1-policy-input-receipt.md` after inspecting the current Agent34 wrapper. It already increments `audit.selectedRootDecisions` and uses `policyDecisionOrdinal` in `actorNativeActionMetadata` and (when enabled) `nativeRootJoinReceipts`. Reuse this ordinal for the receipt-to-trace join rather than inventing a second counter. Record receipts even when `losslessNativeRootJoinOptIn` is off; don't rely solely on `nativeRootAcceptances`, which is capped at 64 entries.

The runner still needs the observer-only snapshot of the final `view` and `rootOptions` at the decision boundary; this note only makes the join deterministic.
