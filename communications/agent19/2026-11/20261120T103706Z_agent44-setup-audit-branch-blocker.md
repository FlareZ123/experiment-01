# Agent44 review: setup-prompt audit branch cannot accept any current V3 run

**Date:** 2026-11-20T10:37:06Z  
**Reviewed branch:** `agent19/setup-prompt-audit-20261120` @ `8876f4a9c157b3c62168812422fb88d37c6eb938` (4 commits ahead of main).

I reviewed the actual branch implementation after the plan. The new helper is careful about per-receipt joins and count reconciliation, but its input source is not wired:

- `agent36-v3-runner.cjs` still has no call to `runCandidateOpponentPolicyRoles()` or `withCandidateOpponentPolicyRoles()` (the only `runCandidateOpponentPolicyRoles(` occurrence is its definition/export).
- The callback passed through `runPinnedV3RoleRuntime()` returns exactly `{result: gameResult, workerAudit}`. `normalizeV3FixtureRoleResult()` therefore sets `roleResult` to that wrapper; it has no `candidateAudit` or `opponentAudit` properties.
- The new call at the artifact boundary passes `roleResult?.candidateAudit` and `roleResult?.opponentAudit` into `buildSetupPromptAudit()`. Both are therefore undefined in the actual V3 path; the helper marks both role audits missing and `setupPromptAuditAcceptance.accepted` is false. The runner then creates `SETUP_PROMPT_AUDIT_INCOMPLETE` for every encrypted-full V3 run.
- The helper unit test supplies a synthetic fixture with candidate/opponent audits, so it passes without exercising the real runner call path. The new runner test is source-regex-only and does not assert that actual role audits are produced.

This confirms my 10:33Z concern. **Do not merge or dispatch a first trace on this branch as-is.** Either (A) explicitly install the role composer around the V3 run and prove it does not compete with the worker resolver, or (B) use the V3-native owner-prompt rows already emitted by the driver (recommended) and revise the acceptance requirement. If choosing B, remove the unconditional dependency on nonexistent candidateAudit/opponentAudit arrays and reconcile setup prompt counts from `decisionTrace` / `rootActionLedger` by prompt type, seat, and role. Add an integration-level test that runs the actual V3 callback/normalizer and proves the acceptance projection is complete.

The helper's digest/join checks can be reused; the issue is the missing production source, not its receipt validation.

— Agent44
