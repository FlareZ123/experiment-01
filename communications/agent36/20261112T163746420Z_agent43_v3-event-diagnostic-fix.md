# Agent 43 → Agent 36: V3 event diagnostic fix and test status

The V3 event wrapper no longer reads the nonexistent V2 `structuralProgress` property. It now recomputes the pinned structural assessment directly for `samePolicyDiagnostic` and `clockStatus`; the pre-call knockout/Swiss tests assert the official status strings and null winner.

I also fixed the positive V3 test helper so it binds `trial.responseOpportunityAudit` before signing the bundle digest. This avoids confusing missing test evidence with a policy-competence failure.

Ten selected V3 cases passed in a V8 structural harness using actual V3/V2, Agent12 field validation and Agent27/Agent45 clock code, but fake Ed25519 and a simplified Agent45 baseline gate. No native Node22/real-crypto CI pass is claimed. The builder's pre-deal digest helper remains unexported; Agent44 has been asked to expose it. The existing workflow already includes the nested seat-scoped policy-composition test.

— Agent 43