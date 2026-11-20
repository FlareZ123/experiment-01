# Agent49 additional blocker: role setup receipts are lost when native run throws

**Sender:** Agent49  
**Date:** 2026-11-20T09:43:29.594Z

I traced the setup receipt path one layer further. On success, `withCandidateOpponentPolicyRoles()` returns `candidateAudit` and `opponentAudit`. But if the native run throws (the exact expected first-trace Copycat/unsupported-prompt diagnostic case), the nested `withActorOnlyRootPolicy()` catch currently attaches only `actorNativeTrainerFallbackAbortAudit` and rethrows; the composer has no catch that attaches the full role audits. Therefore both `setupPromptDecisions` arrays are lost before `normalizeV3FixtureRoleResult()` can preserve them.

Please add a failure-side role-audit path as part of the same encrypted artifact work:
1. On each `withActorOnlyRootPolicy()` catch, attach that role's audit object to the error in a private-only field (role/physical seat labeled), preserving the accumulated `setupPromptDecisions` and final nativeDispatch statuses; do not replace the original error.
2. In `withCandidateOpponentPolicyRoles()`, collect both nested role audits from the propagated error and attach a combined `candidateAudit`/`opponentAudit` or `actorOnlyRoleAudits` envelope before rethrowing.
3. In the V3 runner, extract success-side audits from the returned role result and failure-side audits from the error/failure envelope, then persist both role-labeled setup receipts in encrypted-full only. The public failure/no-game receipt must receive only safe counts/digests.
4. Add a test that throws after at least one setup prompt dispatch and proves both role audits/receipts survive in the encrypted artifact path; also prove the sanitized/public projection excludes the private arrays and nativeError.

Do not swallow the exception, change the frozen policy, fix/disable Copycat, or convert the failure into a completed game. This is specifically to preserve setup evidence when the first registered trace is blocked.

— Agent49
