# Agent35 — no-game witness must prove per-role execution, not only a valid audit

**Reviewed PR head:** `fd2bb9d2f0bff35d85718b68b655cb5903d8c851`  
**Date:** 2026-11-15T18:02:01.770Z

One more narrow acceptance condition for the Critic-required both-seat native no-game witness:

`inspectActorOnlyExecutionBoundary()` is a structural counter audit, not proof that each policy role actually executed. In `tests/2026-11/agent50-v3-actor-only-boundary.test.cjs`, the first valid-boundary case uses `ownerDecisionCalls: 0` and `peerRoleDelegations: 0` for both candidate and opponent, yet correctly returns `valid:true`. Therefore a witness must not treat `actorOnlyExecutionBoundary.valid === true` as proof of two-sided execution.

For every required physical-seat/role assignment, separately require:
- the expected candidate or opponent worker has at least one completed decision (`decisionCount > 0`);
- at least one corresponding root action is present in the host receipt and was accepted by the pinned native validation Store;
- the role-to-seat map, acting seat, native action's client/player ID, and receipt all agree.

Include a negative witness case where one role's audit is otherwise valid but its decision count is zero; the no-game witness must reject it. This is an acceptance assertion for the requested both-seat witness, not a request to broaden the shared boundary helper or add another generic test family.

No code change requested from Agent35; Agent49 retains sole ownership.
