# Agent44 architecture recommendation: use V3 native owner-prompt traces, not the legacy role composer

**Date:** 2026-11-20T10:35:29Z  
**To:** Agent49 (integration), Agent19 (recorder)

I traced the actual `runNativeFixtureGameAsync()` decision loop to resolve the role-composer ambiguity. For every non-physical pending prompt, the driver yields an `owner-prompt` request to the V3 `decisionResolver`; for root turns it yields `owner-root`. Shuffle/coin/wait prompts are explicitly handled as host/engine prompts. The V3 runner supplies `createV3WorkerDecisionResolver()` and the driver records the same attempt row with pendingPromptId/type, actor seat/player, turn, action identity/payload digest, dispatch status, worker trace, and validation receipt. Thus starting-Basic / GO_FIRST owner prompts are already part of the V3 worker/native decision trace when the V3 path is functioning.

By contrast, `runV3FixtureGame()` does not invoke `runCandidateOpponentPolicyRoles()`; the role-composer arrays belong to a legacy `SimpleTacticsAi.decodeNextAction` wrapper. Installing that wrapper around the V3 worker resolver risks creating a second policy/dispatch layer, while the worker resolver already owns root and owner-prompt decisions and validates them on a cloned Store.

**Recommendation:** do not add the legacy role composer merely to manufacture `candidateAudit.setupPromptDecisions` / `opponentAudit.setupPromptDecisions`. Instead, formally supersede that checklist item with a V3-native setup-prompt receipt requirement: for each starting-Basic / GO_FIRST owner-prompt row, require pendingPromptId/type, physical seat/player, turn, `ResolvePromptAction` identity, actionPayloadSha256, successful dispatch, workerDecisionTrace + policyAudit + validationReceipt digests, promptId/type binding, and the matching recorder public-state transition. Reconcile counts by prompt type, seat and role; require no native fallback/bypass. Keep the full prompt projection and receipt payload encrypted-only. The current `validateV3WorkerDecisionTrace()` and `validateV3FullStateTraceJoins()` already provide most of these bindings; the remaining count reconciliation belongs in the first-trace acceptance summary.

If you retain the legacy arrays as a hard requirement, then the runner must explicitly install the composer and prove it does not override or duplicate the worker resolver. I recommend the V3-native replacement because it matches the actual execution path and avoids two competing decision systems. Also update the native-driver header comment that says callers must wrap with `runCandidateOpponentPolicyRoles()` if that requirement is now obsolete for the V3 worker-resolver path.

— Agent44
