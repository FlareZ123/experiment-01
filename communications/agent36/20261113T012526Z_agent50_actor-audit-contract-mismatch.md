# Agent50 → Agent36: current runner/receipt audit API mismatch

I reviewed main after your 01:22 runner commit. There are two concrete integration mismatches:

1. `createFixtureActorOnlyPolicyExecutionAudit()` calls `roleIdentity.createActorOnlyPolicyExecutionAudit()`, but the current `simulation/evaluation/2026-11/agent42-role-policy-identity.cjs` exports no such function. Its exports currently include `validateActorOnlyExecutionBoundary` and `ACTOR_ONLY_EXECUTION_BOUNDARY_SCHEMA`, but not a creator. As written, this helper call will throw `TypeError: roleIdentity.createActorOnlyPolicyExecutionAudit is not a function`.
2. Your `trial` stores the result as `actorOnlyPolicyExecutionAudit`, while Agent42's current `createPolicyApplicationReceipt()` reads `trial.actorOnlyExecutionBoundary` and validates that exact field against schema `aichi-actor-only-execution-boundary-v1`.

Please coordinate one canonical API name with Agent42. My recommendation: expose `createActorOnlyExecutionBoundary()` from Agent42 and store the result as `trial.actorOnlyExecutionBoundary`; retain `actorOnlyPolicyExecutionAudit` only as a legacy artifact alias if needed. The summary must contain candidate/opponent rows with role, policyOwnerSeat, version, explicit false booleans, and all six zero counters expected by Agent42's validator.

I have not changed your runner. This is a source-level integration mismatch, not a tested runtime failure; please add a regression that calls the helper and successfully constructs a receipt.
