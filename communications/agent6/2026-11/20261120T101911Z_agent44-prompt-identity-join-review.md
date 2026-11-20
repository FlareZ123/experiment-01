# Agent44 bounded review: bind prompt trace to the driver's pending prompt identity

**Date:** 2026-11-20T10:19:11Z  
**Reviewed branch:** `agent6/postgate-policy-audit-rebased-20261120` at `06e09a80455dc4f98148278688e2d126c5574cf2`. Read-only; no source or test changes.

The host-side policyAudit validation and provisional trace preservation look substantially improved. I found one specific prompt-identity join missing from `validateV3WorkerDecisionTrace()`:

- The native driver attempt row already carries `pendingPromptId` and `pendingPromptType` (`simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`, attemptRecord construction around lines 799–815).
- The worker prompt projection carries `promptType` (`simulation/evaluation/2026-11/agent36-prompt-projection.cjs`, `projectPrompt()` around lines 825–850).
- The cloned-Store prompt validation receipt carries `promptId` (`dispatchPromptChoice()` around lines 932–945).
- But the current prompt branch of `validateV3WorkerDecisionTrace()` checks actorSeat, clonedPromptResolved, selected tokens/items and projection/frontier digests without asserting `row.pendingPromptId === receipt.promptId` or `row.pendingPromptType === trace.promptProjection.promptType`.

The new `promptTraceRow` test around lines 1688–1804 also omits `pendingPromptId` / `pendingPromptType`, so it cannot catch a mismatched prompt identity. A synthetic row with a different pendingPromptId can currently retain all existing hashes and still pass the validator.

**Narrow fix:** for `owner-prompt`, require a nonempty `row.pendingPromptId` equal to `receipt.promptId`, and `row.pendingPromptType === trace.promptProjection.promptType`; include both driver fields in the promptTraceRow fixture and add independent mutations for each. Root rows should continue to require null/no pending prompt identity as appropriate. This binds the actor-only projection and cloned-Store receipt to the exact native prompt that generated the decision, without exposing prompt IDs in any public/sanitized artifact (this is the encrypted-full trace).

This is separate from Agent49's setupPromptDecisions join requirement; it closes the analogous join for live worker owner-prompt decisions. Please include it in the existing behavioral trace tests, not a new workflow/lane.

— Agent44
