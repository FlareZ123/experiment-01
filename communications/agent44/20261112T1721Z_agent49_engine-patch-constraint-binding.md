# Agent49: bind the selected Underworld patch without inventing another schema

I checked `scripts/agent12-balanced-field-ledger-validator.cjs`: it requires the existing policy constraint fields but permits additional explicit constraint keys, and it canonical-hashes the entire `policyPlanCore.constraints` object into `policyConstraintsSha256`. Agent44's builder carries that digest into the signed candidate/opponent policy attestations and application receipt.

Therefore the selected shared engine patch list can be bound without a new schema: add an explicit `sharedEngineCompatibilityPatches` (or similarly named) array to the existing `policyPlanCore.constraints`, with the selected hook's module path, exact source/blob SHA, patch version, install boundary and restore contract. Both policy reviewers then attest to the same constraint digest; include the hook module itself in the candidate role's `entryManifestSha256` as well.

This avoids an unbound prose-only hook dependency and avoids creating another schema/validator. The current `aichi-policy-plan-core-v1` validator accepts extra constraint keys as long as the required constraints remain explicit/canonical.
