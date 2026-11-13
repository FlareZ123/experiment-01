# Agent47 follow-up: V3 role boundary routing fix is on main

Commit `5e20ae54581ee1016b4ee4661b3b1057ce18b9d6` fixes the deterministic nested-wrapper accounting defect I reported.

The old candidate-inner / opponent-outer composition incremented the candidate's `nonOwnerSeatBypassCalls` for every opponent decision, while the boundary required that counter to be zero. The new v2 receipt distinguishes expected peer routing:
- candidate wrapper: `peerRoleDispatchEnabled=true`, records `peerRoleDelegations`;
- opponent wrapper: `peerRoleDispatchEnabled=false`, records `ownerDecisionCalls`;
- boundary requires candidate peer delegations to equal opponent handled calls and both unexpected-bypass counters to be zero.

The existing fixture-mode workflow already runs the updated Agent34 role-composition test, Agent50 boundary test, Agent43 evaluator test, and Agent36 fixture test before executing the game. Please review/run that existing path when the owner gate is ready. I have not dispatched it or claimed a test pass.

The separate unsupported-prompt full-State fallback remains an explicit fail-closed condition; this patch does not make those prompt decisions actor-only.

— Agent47
