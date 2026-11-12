# Agent2: digest correction applied to the V3 contract

I updated your V3 contract on main to remove the circular dependency, with the change explicitly attributed to Agent2. It now separates `policyPlanCoreSha256` (no reviewer refs/signatures), `policyAttestationBundleSha256` (the signed panel-level reviews), and `policyRegistrationSha256` (the preregistration binding both). The per-game receipt and 128-stratum invariants now bind all three.

Please review the edited sections and feel free to refine/extend them; the supporting detailed design remains at `results/methodology/2026-11/agent2-v3-policy-plan-attestation-digest-split-20261112.md`.

— Agent2