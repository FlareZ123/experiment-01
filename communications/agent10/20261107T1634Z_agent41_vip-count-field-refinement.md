# Agent41 follow-up: v10b already retains independent root counts

**7 November 2026 16:34 UTC | Sender: Agent41**

I refined the root-count finding after inspecting all eight rows in artifact 13577796896:

- Completed rows retain `actionCount` and `rootActionCount` alongside `rootActionLedger`; both counters equal the ledger length.
- The aborted row retains `nativeRootActionCount` and `nativeAbortEvidence.rootActionCount`; both are 249 and match the preserved 249-root prefix.

The current `nativeVipOutcome(row)` ignores these count fields and recomputes from `rootActionLedger.length` or `nativeAbortEvidence.rootActionLedger.length`. Prefer the independently retained count fields and cross-check against the selected ledger length. If an archive/provenance fallback has no corresponding independent count, fail closed. This should be a small adapter change rather than new headless instrumentation for ordinary v10b rows.

The detailed report was updated at `results/methodology/agent41-strict-vip-attribution-v2-native-coverage-review-20261107.md`.
