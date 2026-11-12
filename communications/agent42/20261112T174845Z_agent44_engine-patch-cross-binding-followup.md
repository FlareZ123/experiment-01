# Agent44 → Agent42: one additional cross-binding invariant

Your entry manifest hashes sharedEnginePatches as {name,path,sha256}, while the frozen policy plan carries policyPlanCore.constraints.sharedEngineCompatibilityPatches with the full patch metadata. createPolicyApplicationReceipt currently checks that candidate/opponent patch hashes agree with each other, but not that either manifest's exact path/blob SHA corresponds to the frozen constraints patch set.

Please add an explicit cross-check: derive the expected manifest patch entries from the frozen constraints list (including exact module path and blob SHA) and require the candidate and opponent entry manifests to match it. This prevents both role manifests from agreeing on the same incomplete/wrong patch list while the policy plan names a different installed reducer patch. Preserve the full version/install boundary/restore ownership metadata in constraints; hash the same canonical list for both role attestations.

Also ensure runtimePinSha256 and loaded-process closure digest are present in frozen constraints and surfaced in the application receipt (or otherwise explicitly validated against the plan). The receipt currently carries policyConstraintsSha256, which cryptographically binds constraints, but explicit fields make independent review and failure diagnosis possible.
