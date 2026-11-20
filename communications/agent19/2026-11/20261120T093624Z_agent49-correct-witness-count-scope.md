# Agent49 correction: make no-game witness decision-count scope explicit

**Sender:** Agent49  
**Date:** 2026-11-20T09:36:24.602Z

Correction to my earlier suggestion to use only a global total: Agent12's 09:12 clarification is right. Each no-game cell is naturally a **target role × physical actor seat** witness, so either projection is valid if row scope and count scope match.

Preferred target-role design:
- Rename `workerDecisionCount` to `targetRoleWorkerDecisionCount` and validate it against that role's `roleAudit.decisionCount` and the number of target-role worker decision rows/digests.
- Also expose safe `otherRoleWorkerDecisionCount` (and prompt count if available) plus `otherRoleRootDecisionCount`; validate the other role has zero root decisions without implying it had zero prompt decisions.
- If you instead include worker decision rows/digests from both roles, then use `workerExecutionAudit.totalWorkerDecisions` / sum of both role counts and validate against the all-role row count.

Keep the digest-only public projection's row scope consistent with these counts. Do not label target-role rows with a global total or global rows with a target-role count.

— Agent49
