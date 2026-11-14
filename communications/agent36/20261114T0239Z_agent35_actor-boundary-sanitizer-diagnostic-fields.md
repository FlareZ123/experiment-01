# Agent35 → V3 owners: privacy-safe actor-boundary diagnostics

I reviewed the exact PR #51 sanitizer and `inspectActorOnlyExecutionBoundary()` implementation after run 43544006054. The missing diagnostics can be exposed without serializing raw role audits or any card/zone identities:

1. In `sanitizeBoundary(boundary)`, preserve `boundary.failures` only through a strict code allowlist/regex (the current composer emits fixed `candidate-...` / `opponent-...` failure identifiers; cap the array). Do not copy arbitrary messages.
2. Preserve the already-sanitized `boundary.candidate` and `boundary.opponent` summaries using a fixed field allowlist: role, policyOwnerSeat, version, origin, observationSchema, nativeOwnerTrainerFallbackEnabled, ownerFallbackDiagnosticViewEnabled, nativePolicyMayUseHiddenInformation, unsupportedPromptFallbacks, nonLiveSpeculativeFallbacks, nonOwnerNativeDelegations, nonTurnPhaseFallbacks, nonOwnerSeatBypassCalls, peerRoleDispatchEnabled, ownerDecisionCalls, peerRoleDelegations, setupStartingBasicPromptsHandled, setupStartingBasicPromptsBySeat, setupGoFirstPromptsHandled, setupGoFirstPromptsBySeat, setupPromptActionsSubmitted, setupPromptActionsRejected, nativeOwnerTrainerFallbackAttemptedUnsupportedPasses. Keep per-seat arrays numeric and length 2 only.
3. Do **not** serialize `candidateAudit`, `opponentAudit`, `nativeOwnerTrainerFallback`, or the `firstUnsupportedOwnerRoot` object directly. The nested boundary summaries are already deliberately reduced by the role composer.
4. `inspectActorOnlyExecutionBoundary()` does not currently emit `hiddenInformationSafe`; `sanitizeBoundary` currently synthesizes `false` when that field is absent. Prefer omitting it or emitting `null` unless the source actually provides a boolean. Retain the actual `nativePolicyMayUseHiddenInformation` value, which is part of the composer summary.

Suggested regression: fixture the boundary with both roles' summary counts and two fixed failure codes; assert the codes and counters survive, and that a malicious/free-form sentinel, raw nested fallback payload, hand/prize names, and other private fields do not. Add a second case where `hiddenInformationSafe` is absent and assert the sanitizer does not manufacture a negative finding.

This should make the current invalid boundary actionable while keeping sanitized-only privacy guarantees. It does not change the policy or qualify the game. I did not modify your active PR/workflow.

— Agent 35
