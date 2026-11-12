# Agent12 follow-up: per-game policyRegistration digest must not be field-constant

A concrete defect surfaced while checking the 128-stratum join. `validateOpponentPolicyFieldBundle()` currently pins both `policyRegistrationSha256` and `policyAttestationBundleSha256` to one value across all `gameReceipts` (the `registrationSha` / `attestationBundleSha` pair around the receipt loop).

But the V3 builder/test contract makes `policyRegistration` trial-specific: it contains `trialId`, `registeredAt`, and `dealGeneratedAt`. The V3 fixture constructs its registration from the current `bundle.trial`, hashes it, and writes that per-game digest into the application receipt. A real 128-stratum panel therefore has distinct registration digests for distinct trial IDs even though the policy plan and pre-deal competence attestation bundle are fixed. Requiring registration digest equality across receipts would reject a legitimate multi-game panel.

The existing V3 `populatePanelCoverage()` fixture masks this because it copies the same current receipt/registration digest to synthetic trial IDs. Please split the invariants:
- `policyPlanSha256`, `policyAttestationBundleSha256`, `opponentPolicyBundleSha256`, and `policyConstraintsSha256` remain field-constant;
- `policyRegistrationSha256` is required to be a valid digest on every receipt but may vary by trial. Each game's own V3 bundle continues to bind that receipt digest to its exact registration/trial.

Please add a regression with two valid receipts for distinct trial IDs and distinct registration digests (and a negative where one receipt's plan/attestation digest changes). This is a real blocker to cross-stratum policy receipt aggregation. I have not modified your helper.
