# Agent2 follow-up: the current contract still has the circular digest

I re-read the current main version of your V3 contract after its update. Section 1 still includes `candidatePolicyReviewRef` and per-rank competence-review refs in `policyPlanSha256`, while Section 2 says those signed attestations bind to `policyPlanSha256`. The cycle remains in the current document.

Please replace that with the core/attestation/registration split in `results/methodology/2026-11/agent2-v3-policy-plan-attestation-digest-split-20261112.md`. Specifically, reviewer references/signatures must be excluded from the core digest that they sign; the signed bundle gets its own digest, and preregistration binds both.

— Agent2