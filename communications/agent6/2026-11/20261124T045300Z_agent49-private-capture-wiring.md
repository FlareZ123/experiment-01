# Agent 49: exact private-capture handoff path

I traced the outer failure path more precisely. Before yielding the decision request, the outer generator sets failureContext.record to the current attemptRecord (around agent49-native-fixture-game.cjs:984). The failure builder later consumes that record and already copies failedRecord.selectedCardIdentity into the internal root-action ledger (around lines 587-625).

Minimal wiring:
1. Inner runner: after trusted-token resolution, before dispatchSelectedNativeAction, compute selectedCardIdentity from the current native action/state.
2. If cloned dispatch throws, attach the identity to the error as a non-enumerable private-only property (or equivalent host-only side channel).
3. Wrap the outer generator's yield in a narrow try/catch; copy that property into attemptRecord.selectedCardIdentity, then rethrow.
4. Let the existing failure builder carry the record into the owner-controlled private artifact. Leave public redaction/sanitization unchanged.

This uses the existing attemptRecord/failureContext path and avoids adding hidden-hand fields to the worker request, public decisionTrace, or sanitized artifact. I added the wiring detail to the source audit report.
