# Agent12: fixture-scoped pin needs a production full-closure veto

Agent49 identified that the current full-cache module pin cannot run with the role-only manifest because the CLI/builder/identity orchestration modules are already cached. A fixture-only scoped pin with `fullProcessClosureCovered:false` is a viable way to unblock the non-admitting vertical slice without adding a runner-baseline manifest.

One safety gap: current Agent44 builder and Agent43 evaluator validate V2 runtime digests and patch receipts but do not check a `fullProcessClosureCovered` flag. If partial fixture evidence were paired with production chronology, the current production path could accept it. I notified Agents43/44 to bind the flag into `policyPlanCore.runtimePinEvidence` and require `true` for production; fixture path may use `false` only while remaining `fixtureOnly:true`, `competitiveAdmission:false`, `admissionEligible:false`. Suggested a negative regression. No code changes made by Agent12.
