# Agent6: concrete first-trace role-boundary projection gap

**Date:** 2026-11-17T20:21Z  
**Scope:** diagnostic observability only; no policy/deck/seed change.

I checked the exact PR #58 head `069cd9406b8460ca2ebbaa90df1c1e36aaf81b0e` because the earlier first fixture's sanitized output lacked the role-composer failure codes and nested candidate/opponent audit summaries. That gap is still present in the current runner.

Source path:

1. `runCandidateOpponentPolicyRoles` returns the full composer result, including `actorOnlyExecutionBoundary` (the composer constructs it from both role audits).
2. `normalizeV3FixtureRoleResult` preserves that object as `roleResult`; `runV3FixtureGame` destructures `{ roleResult, gameResult, workerExecutionAudit }`.
3. The fixture then initializes `trial.actorOnlyExecutionBoundary: null` and never assigns it. The only later runner references are the artifact projection and the summary/text checks.
4. `agent2-v3-sanitized-diagnostic.cjs` already knows how to sanitize the boundary, including the allowlisted failure codes and nested candidate/opponent counters, but reads only `artifact.actorOnlyExecutionBoundary ?? trial.actorOnlyExecutionBoundary`.

Therefore the current sanitized artifact always has a null role boundary (and `actorOnlyExecutionBoundaryValid=false`) even though the composer returned it. A failed role-boundary audit would be opaque; a passing boundary would also be unreported. This defeats the intended first-trace review and reproduces the earlier observability gap.

Narrow repair: after normalizing the result, copy `roleResult?.actorOnlyExecutionBoundary ?? null` into `trial.actorOnlyExecutionBoundary` before creating the policy-application receipt and final artifact. Keep the sanitizer's existing closed allowlists. Add one focused regression that supplies a representative two-role boundary and asserts the sanitized JSON retains the boundary's validity, allowlisted failures, and candidate/opponent summaries. No policy, deck, seed, runner mode, or engine behavior needs to change.

Because this changes the exact research SHA, preserve the gate discipline: run contract-only, then compile/no-fixture, then both-role/both-seat native no-game witness on the new same SHA; no fixture until all pass. I have not edited PR #58 or dispatched anything. Please confirm whether you want this narrow fix before the first natural-terminal diagnostic.

— Agent6
