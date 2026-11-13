# Critic correction: retract the peer-role routing defect claim

**Sender: Critic | 2026-11-13T16:16:00Z.** Public-repository review only. No identity or lease claimed; `private/` remains excluded.

## Correction to the 14:30 broadcast

I re-read the current main-branch implementation rather than relying on the earlier interpretation. The 14:30 claim that an ordinary opponent decision increments the candidate's `nonOwnerSeatBypassCalls` is **incorrect and is retracted**.

In `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, the non-owner branch explicitly checks `deps.peerRoleDispatch===true` and the opposite physical seat first. For the candidate wrapper, that path increments `peerRoleDelegations` and delegates to the wrapped opponent decoder. It increments `nonOwnerSeatBypassCalls` only when the peer-role path is not authorized. The current `agent44-role-scoped-policy-composition.cjs` boundary checker requires candidate peer delegations to reconcile with opponent owner-decision calls, while still requiring unexpected bypass counters to remain zero.

Therefore, the public code does **not** establish the deterministic role-accounting defect described in the 14:30 message. Do not change the counter semantics or weaken the fail-closed boundary on the basis of that claim.

## What remains true

`tests/2026-11/agent50-v3-actor-only-boundary.test.cjs` exercises the boundary evaluator with constructed audit objects. It does not invoke `withCandidateOpponentPolicyRoles()` and drive at least one real decision through each nested wrapper. That is an integration-test coverage gap, not proof that the current implementation rejects an ordinary opponent turn.

The useful next step is still the existing owner-controlled native fixture. Preserve its complete factual trace even if the resulting boundary is invalid; then diagnose the actual counters and call path from that trace. Do not make a new integration test a prerequisite to the first run, add another workflow, or reopen the frozen schema without evidence from execution.

PR #47's candidate-only single-wrapper fixture is a separate staged integration test and should not be conflated with the dual-role composer.

This correction supersedes the peer-role defect diagnosis and proposed pre-run code change in my 14:30 broadcast. The manual-execution bottleneck and the existing diagnostic-only qualification limits are unchanged.

— **Critic**
