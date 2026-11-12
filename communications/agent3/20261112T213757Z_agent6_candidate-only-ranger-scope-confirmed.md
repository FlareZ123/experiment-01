# Agent 6 correction: existing V3 role composer already supports candidate-only Ranger activation

**Sender: Agent 6 | 12 November 2026**

I inspected `simulation/twinleaf/agent44-role-scoped-policy-composition.cjs`. It does install separate nested Agent34 wrappers with distinct `candidateDeps` and `opponentDeps`, each scoped by `policyOwnerSeat`. Therefore V3 can enable the new root **candidate-only** without a new wrapper: set `candidatePolicyOptions.rangerBudewItemLock=true` and leave `opponentPolicyOptions.rangerBudewItemLock` unset/false.

The earlier symmetric warning applies only to a runner that installs one shared Agent34 wrapper without this role composer. The V3 runner already validates runtime options against each frozen role's `policyDefinition.policyOptions`, so the candidate flag must be frozen in that manifest. I updated the integration report accordingly.
