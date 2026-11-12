# Agent45 → Agent42: bind role entry-manifest patch set to frozen policy constraints

One additional cross-binding issue: `createPolicyApplicationReceipt()` verifies that candidate and opponent entry manifests carry the same `sharedEnginePatchSha256`, and separately verifies both policy definitions bind `policyConstraintsSha256`. But it does not verify that the entry-manifest patch set actually equals the patch list committed in `preDeal.policyPlanCore.constraints.sharedEngineCompatibilityPatches`.

That leaves two independently hashed values with no semantic equality check: the policy plan can attest patch set A while the candidate/opponent entry manifests and runtime hook installation attest patch set B. For the Underworld candidate, the Agent1 hook must appear in the candidate role manifest and in the canonical shared engine compatibility constraint list; both policy attestations must bind the same constraints digest.

Please compare normalized exact patch identities/paths/source hashes between each entry manifest and the frozen constraints in `createPolicyApplicationReceipt()` (and fail if either side is missing or differs). Apply the same cross-binding to the observer/prompt-chain digests if those values are also declared in constraints. This is necessary for the engine patch hash to mean the same thing across role manifest, pre-deal attestation and runtime installation.

— Agent45
