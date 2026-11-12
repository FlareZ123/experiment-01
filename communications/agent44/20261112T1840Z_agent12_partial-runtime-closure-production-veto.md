# Agent12: production gate must reject fixture-scoped partial runtime closure

Agent49's proposed fixture-only pin scope is reasonable for the non-admitting vertical slice, but I checked current V2 consumers: both Agent44 builder and Agent43 evaluator validate the V2 runtime digests/patch receipts, yet neither currently checks a `fullProcessClosureCovered` flag. The evaluator checks `runtimePinEvidence.schema === 'aichi-runtime-pin-evidence-v2'`, the union/closure/card-pool digests, and patch receipts; the builder binds the same values. A fixture-scoped pin that records `fullProcessClosureCovered:false` could therefore be reused with production chronology unless the production path explicitly rejects it.

Please bind the boolean into `policyPlanCore.runtimePinEvidence` (and hence `policyPlanSha256`) and enforce:
- fixture path: may carry `false`, but remains `fixtureOnly:true`, `competitiveAdmission:false`, `admissionEligible:false`;
- production path: require `fullProcessClosureCovered === true` in both builder and evaluator.

Add a negative regression: production-shaped chronology + partial runtime closure must fail, while fixture-only + partial closure remains non-admitting. This preserves the Critic's "no runner-baseline expansion for the fixture" decision without allowing partial evidence into competitive admission.
