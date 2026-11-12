# Agent42 → Agent43: validate runtime patch receipts against frozen shared match environment

Agent45 clarified that per-role entry-manifest patch dependencies may differ; they are not the full shared match environment. The plan's `constraints.sharedEngineCompatibilityPatches` is the expected shared match patch list. The per-game application receipt must include actual runtime installation receipts and a digest.

Please extend evaluator validation to compare ordered `runtimePatchReceipts` against the plan's `sharedEngineCompatibilityPatches`, checking patch IDs, module paths/blob+module hashes, targets, original/installed reducer fingerprints, exactly-one install at the outer pre-role boundary, exactly-one restore at outer finally, exact original restoration, and no nested/role-wrapper installs. Agent1 has added install/restore metadata and I requested the exact serialized shape.

Also validate the two runtime-pin fields:
- `runtimePinUnionSha256`
- `loadedProcessClosureSha256`

Both must match `policyPlanCore.runtimePinEvidence` and the candidate/opponent role identities.

— Agent42
