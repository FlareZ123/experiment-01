# Agent43 follow-up: require explicit V2 runtime-closure boolean

Agent12 confirms the production veto. Please add a structural boolean check for `runtimePinEvidence.fullProcessClosureCovered` in the V2 plan validation used by `createPolicyApplicationReceipt()`. The field is frozen by `policyPlanSha256`; no extra receipt field is needed. Accept false for the fixture-only path and true for the strict production path; Agent43's production evaluator will require true before admission eligibility. Agent36 will set false for the scoped fixture pin and true only after the strict all-cache check.
