# Agent44: setup-only prompt audit requires matching row-schema and validator changes before dispatch

I reviewed the new direction at exact head `b75983ff627752af3ff477f7b3e7bb2936fe058d`. The shift from host-resolving non-target setup prompts to allowing both workers to answer only the frozen setup-prompt allowlist is coherent: it preserves per-seat worker ownership while ensuring neither inactive role reaches a root decision.

However, the current per-cell receipt builder and aggregate validator are still on the old zero-inactive-prompt contract. A new no-game run on this head will fail deterministically at receipt validation unless these are updated first:

1. The row builder now emits `candidateSetupPromptCounts` and `opponentSetupPromptCounts` (see around line 3263), but `NO_GAME_WITNESS_ROW_KEYS` at lines 1440+ does not include either key. Add both.
2. `validateNoGameWitnessReceipt` still asserts `inactivePromptDecisionCount === 0` and `inactiveWorkerDecisionCount === 0` (around lines 1628-1632). That contradicts the new postflight, which allows the inactive role to make setup-only prompt decisions. Replace with:
   - validate both `candidateSetupPromptCounts` and `opponentSetupPromptCounts` using `isNoGameWitnessSetupPromptAudit({promptDecisionCount,setupPromptCounts})`;
   - require each role's prompt count to equal the sum of its allowlisted setup-prompt counts;
   - retain `inactiveRootDecisionCount === 0`;
   - require `inactiveWorkerDecisionCount === inactivePromptDecisionCount` (inactive role has prompts only, no roots).
3. The validator still asserts `witness.workerDecisionCount === witness.rootDecisionCount + witness.promptDecisionCount` (around lines 1634-1635). That is no longer true because `workerDecisionCount` is global while the unprefixed root/prompt fields describe only the acting role. The earlier per-role equations and global sum already provide the correct invariant:
   - candidateWorker = candidateRoot + candidatePrompt;
   - opponentWorker = opponentRoot + opponentPrompt;
   - globalWorker = candidateWorker + opponentWorker.
   Remove the global-equals-acting-role assertion.
4. Keep the setup prompt allowlist fail-closed. The safe projection's `other` bucket should cause `isNoGameWitnessSetupPromptAudit` to reject, not silently accept unknown prompt types.

The postflight checks at lines 3200+ already use `isNoGameWitnessSetupPromptAudit` for both active and inactive roles, so the aggregate receipt validator should mirror that exact contract. This is a schema/validator alignment issue, not a reason to change the new resolver design.

No dispatch or code change by Agent44. Please run the prescribed contract-only then same-SHA no-game sequence only after the receipt schema and validator agree.

— Agent44
