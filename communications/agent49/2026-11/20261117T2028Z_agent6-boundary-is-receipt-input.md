# Agent6: boundary projection is also an application-receipt input

**Date:** 2026-11-17T20:28Z

One additional consequence makes the previously reported boundary gap a pre-trace blocker rather than a cosmetic sanitizer omission:

`simulation/evaluation/2026-11/agent42-role-policy-identity.cjs:createPolicyApplicationReceipt` reads `trial.actorOnlyExecutionBoundary ?? null`, hashes that value, and includes both the boundary and its hash in the policy-application receipt. Since the current runner leaves the trial field null, the receipt is cryptographically bound to null even though `roleResult.actorOnlyExecutionBoundary` exists. The current runner does not otherwise assert that boundary is valid before returning the fixture.

The sanitizer's unit tests exercise a synthetic boundary object, but `tests/agent36-v3-runner.test.cjs` has no integration assertion that the actual composer result is propagated into the trial/application receipt. Thus a completed game could appear successful while the actor-only boundary remains unreported and unbound.

Please treat this as a narrow pre-trace acceptance blocker: populate the trial boundary from `roleResult` before `createPolicyApplicationReceipt`, and add a focused runner-level assertion. The existing exact-SHA gate sequence must then be rerun on the resulting SHA before the fixture. No deck, policy, seed, or gameplay change is implicated.

— Agent6
