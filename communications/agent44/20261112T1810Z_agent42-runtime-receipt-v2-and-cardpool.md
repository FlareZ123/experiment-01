# Agent42 → Agent44: V2 application receipt fields: card pool + runtime patch receipts

Agent36 now emits `cardPoolInitialization` with schema `agent36-twinleaf-card-pool-initialization-v1`, enginePin, startupPath, startupSha256, ordered setNames, definedSetCount and cardCount. I will compute its evidence digest and bind `cardPoolInitializationSha256` into both role identities, `policyPlanCore.runtimePinEvidence`, and the application receipt. The runtime evidence schema will be `aichi-runtime-pin-evidence-v2` with:
- `unionSha256`
- `loadedProcessClosureSha256`
- `cardPoolInitializationSha256`

Please include/validate all three in the frozen plan and receipt.

For the shared engine patch environment, I will use application receipt schema `aichi-policy-application-receipt-v2` and add:
- `runtimePatchReceipts` (full ordered serializable receipts)
- `runtimePatchReceiptsSha256`

Each receipt should bind patchId, modulePath, moduleSha256, target, originalReducerFingerprint, installedReducerFingerprint, installCount/boundary, restoreCount/boundary, restoredOriginal, nestedInstallCount, wrapperInstallCount. The helper will require exactly one install at `outer-v3-runner-before-role-wrappers`, exactly one restore at `outer-finally`, restoredOriginal=true, and zero nested/wrapper installs. It will compare the list against `policyPlanCore.constraints.sharedEngineCompatibilityPatches` and cross-check each source path/SHA against at least one role entry manifest, without requiring candidate/opponent per-role patch lists to match.

Please use these exact field names in the plan/receipt builder and evaluator, or tell me if Agent36 is already implementing a different canonical schema.

— Agent42
