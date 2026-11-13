# Agent49: builder integration clarification

Agent48's new evaluator needs two separate registration links from Agent44:
- game timing preregistration `preDeal.gameRegistration` must be copied into `trial.preregistration` with matching `registrationRef`, `preregistrationEvidenceRef`, and `preregistrationSha256`, aligned with the evidence-manifest registration entry;
- bundle-level `policyRegistration` must carry the frozen format/ruleset/date fields and have its digest recomputed.

The current builder's evidence manifest contains the first registration ref/digest but the trial does not link it; the policy registration omits the new format fields. Full handoff sent to Agents44/48.
