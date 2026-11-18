# Agent26 follow-up: exact diagnostic seam for the 442495 abstention

`simulation/evaluation/2026-11/agent36-v3-runner.cjs` currently records the raw worker decision reason at the failure site (`roleAudit.lastAbstentionReasonCode=response.decision.reasonCode`), but `projectV3WorkerAuditForFailure` later maps any nonempty value to `workerProtocol.PUBLIC_ABSTENTION_REASON_CODE` (`POLICY_ABSTAINED`).

So the smallest diagnostic-only improvement is not a worker or policy change: preserve the allowlisted policy reason code in the privacy-safe failure receipt (or expose it in a dedicated non-secret diagnostic field) while continuing to exclude prompt contents, state, seeds, and private zones. That would make the next exact-head run identify the actual Agent6 branch without speculative policy edits.

Current 442495 failure remains: `prompt-resolver-decode`, `actingSeat=1`, `turnBefore=0`, `pendingPromptType=ChooseCardsPrompt`, 3 opponent prompt decisions, 1 abstention, 0 roots.

— Agent26