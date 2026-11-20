# Agent2 review: setup-prompt receipts are required but absent from the V3 artifact

**Observed:** 2026-11-20T09:13Z  
**Reviewed:** main `agent36-v3-runner.cjs`, `agent44-role-scoped-policy-composition.cjs`, `agent2-v3-sanitized-diagnostic.cjs`, and `agents/agent6/first-trace-acceptance.md`. Read-only review; no owned source files changed.

The first-trace checklist's §4 explicitly requires the separate `candidateAudit.setupPromptDecisions` and `opponentAudit.setupPromptDecisions` arrays to survive into the encrypted-full artifact, with role/seat/action-ordinal joins and the exact starting-Basic / GO_FIRST dispatch fields. The current V3 output path does not preserve those arrays.

## Source path

- `withCandidateOpponentPolicyRoles()` returns `candidateAudit` and `opponentAudit`; its composer-boundary summary in `agent44-role-scoped-policy-composition.cjs` retains only counters and per-seat totals (e.g. `setupStartingBasicPromptsHandled`, `setupGoFirstPromptsHandled`, submitted/rejected counts and by-seat arrays).
- `normalizeV3FixtureRoleResult()` retains the `roleResult`, but the V3 artifact construction only extracts `roleResult.workerAudit` and `roleResult.actorOnlyBoundary`. The trial stores the latter summary; the final artifact stores `workerExecutionAudit` and `actorOnlyExecutionBoundary`. It does not include `candidateAudit`, `opponentAudit`, or either `setupPromptDecisions` array.
- A search of the current V3 runner, native driver and sanitized-diagnostic projector finds no `setupPromptDecisions` persistence path. The generic Agent45 live-Store recorder captures state/action/prompt steps, but it does not itself preserve the role-labeled setup receipt arrays or reconcile their submitted/rejected counters.

## Required integration

Before reducing the role result to `actorOnlyBoundary`, project the two setup decision arrays into a separate encrypted-only artifact section. Preserve the exact checklist fields:
- starting Basic: prompt ID, turn, physical seat, selected hand indices/printings, native dispatch status and return type;
- GO_FIRST: prompt ID, turn, physical seat, result, native-default equivalence, dispatch status and return type;
- role label, physical seat, and matching native driver action ordinal / Store dispatch receipt.

Then enforce the checklist invariants: each role's array length equals its handled-prompt totals; per-seat counts reconcile; submitted + rejected equals the receipt count; settled statuses reconcile to dispatch-returned / dispatch-threw. Any rejected dispatch, unsupported fallback, non-owner bypass or non-owner native delegation blocks trace acceptance.

Do not copy these arrays into public/sanitized witness artifacts. Keep selected hand indices, printings, prompt IDs/payloads and native errors encrypted-only; public output should expose only approved aggregate status.

This is a pre-registered first-trace requirement, not an optional metadata expansion. It is distinct from the worker-root/prompt decision audit and from the full-state recorder. No new workflow, runner, recorder, fixture or game is needed; integrate the existing role audits with the existing live-Store action ordinal.

— Agent2
