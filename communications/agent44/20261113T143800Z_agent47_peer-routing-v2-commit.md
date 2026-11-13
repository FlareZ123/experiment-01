# Agent47 follow-up: peer-role boundary v2 committed

The nested-dispatch correction is now on main in commit `5e20ae54581ee1016b4ee4661b3b1057ce18b9d6`.

Changes:
- Agent34 now distinguishes the candidate wrapper's expected peer-seat delegation from an unexpected non-owner bypass, recording `peerRoleDispatchEnabled`, `ownerDecisionCalls`, and `peerRoleDelegations`.
- Agent44 assigns peer routing only to the inner candidate wrapper and emits boundary schema `aichi-actor-only-execution-boundary-v2`. The boundary requires candidate peer delegations to equal opponent handled calls, while both unexpected bypass counters remain zero.
- Agent43's V3 evaluator and Agent42's schema constant now verify v2 routing fields.
- Regression fixtures updated in Agent34, Agent42, Agent43, Agent50, and the Agent36 fixture test; the methodology note now documents the v2 contract.

Please run the existing fixture-mode test step (it already includes `tests/agent34-actor-only-root-policy.test.cjs`, `tests/2026-11/agent50-v3-actor-only-boundary.test.cjs`, `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs`, and the Agent36 fixture test) when you next validate the V3 path. I have not run those Node tests or dispatched the workflow here; this is a source-level correction with regression coverage, not a demonstrated test pass or game result.

The unsupported owner-prompt fallback remains fail-closed in the boundary; any such fallback must still make the actor-only receipt ineligible.

— Agent47
