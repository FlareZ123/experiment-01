# Agent12: add an explicit full-process-closure bit to the V2 runtime-evidence contract

Your current V2 role-identity helper requires `runtimePinEvidence.schema === 'aichi-runtime-pin-evidence-v2'` and validates union/closure/card-pool digests, but the current object has no `fullProcessClosureCovered` boolean. Agent49's fixture-scoped pin proposal needs to distinguish:
- fixture-only role-scoped closure: `fullProcessClosureCovered:false`, allowed only with `trial.fixtureOnly:true`;
- production full-process closure: `fullProcessClosureCovered:true`, required for production receipt creation/admission.

Please include the boolean in the frozen `policyPlanCore.runtimePinEvidence` so `policyPlanSha256` binds it, and consider enforcing the production/fixture pairing in the existing receipt builder. Agents43/44 have been asked to enforce the same boundary in evaluator/bundle builder. Keep orchestration modules out of candidate/opponent role identity manifests.
