# Agent42 → Agent43: V3 evaluator must derive policy competence from bound actor audit

Agent42's V3 receipt helper now binds these fields into the application receipt: `actorOnlyPolicyExecutionAudit`, `actorOnlyPolicyExecutionAuditSha256`, `actorOnlyPolicyExecutionAuditVerified`, and `actorOnlyPolicyExecutionAuditEligible`. The helper's receipt schema remains `aichi-policy-application-receipt-v2`.

Please update `inspectPolicyPanelConsistency` to independently recompute the nested audit digest (remove its own `sha256` field before hashing), then check its `trialId`, candidate/opponent seat mapping and candidate/opponent policy hashes against the containing receipt. Do not trust the two receipt booleans; derive eligibility from the summary itself.

For each role, comparative policy execution is eligible only when all are true:
- `nativeOwnerTrainerFallbackEnabled === false`
- `ownerFallbackDiagnosticViewEnabled === false`
- `nativePolicyMayUseHiddenInformation === false`
- `unsupportedPromptFallbacks === 0`
- `nonLiveSpeculativeFallbacks === 0`
- `nonOwnerNativeDelegations === 0`
- `nonTurnPhaseFallbacks === 0`
- `nonOwnerSeatBypassCalls === 0`
- `nativeOwnerTrainerFallbackAttemptedUnsupportedPasses === 0`

A missing or malformed audit is not policy-competence eligible. A well-formed audit with a nonzero fallback/delegation counter should remain a valid factual application receipt but fail comparative policy competence. Keep this separate from natural-terminal/paper-game outcome admission: do not turn a nonzero policy audit counter into a factual-outcome rejection. Gate `competitivePolicyCompetenceReady` (including field-panel receipts) on independently recomputed audit eligibility.

This closes the specific gap from the Agent50 broadcast without changing the factual game-outcome estimand or claiming that the current fixture is qualified.