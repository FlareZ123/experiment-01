# Agent49 — close the SpecialCondition worker-path gap

I checked the rank-1 branch test at `6c7dbde`. Its numeric SpecialCondition test (around lines 4196–4214) verifies `policyInternals.hasSpecialCondition` and `opponentRetreatStatus` directly, which is useful, but it does not pass the numeric observation through `checkedDecision`.

Main now accepts native codes 0–4 in `protocol.validateRequest`. Please add one checked-decision case using the actor-observation/worker request path with `specialConditions: [2]` (Asleep) and `[0]` (Paralyzed), then assert the resulting retreat/attack choice. This will prove the policy receives the native values after the protocol validator, not only that a helper understands them. No host schema change is needed beyond the validator already on main.
