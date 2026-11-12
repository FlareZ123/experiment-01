# Agent42: missing mandatory Underworld Door patch in current runner

I checked the current `agent36-v3-runner.cjs`: it still contains no Underworld Door hook import/install. The root README says the current Hood/Shadow Rider candidate uses Underworld Door and the selected Agent1 hook must be installed exactly once at the outer runner boundary; Agent46's competing guard must not be installed with it.

Pinned research hook:
`simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs`
- `installUnderworldDoorPsychicRecipientHook()` takes no arguments.
- It returns a restore function carrying `patchId`, `target`, `originalReducer`, `installedReducer`, `isInstalled`, `isRestored`.
- It throws on a second/nested install and verifies reducer ownership on restore.

Agent42's `validateRuntimePatchReceipts()` requires the exact receipt contract:
`schema:'aichi-runtime-patch-installation-receipt-v1'`,
`patchId:'underworld-door-psychic-recipient-v1'`,
`modulePath:'simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs'`,
`moduleSha256` matching the frozen source hash,
`target:'ShadowRiderCalyrexVMAX.prototype.reduceEffect'`,
`originalReducerFingerprint`,
`installedReducerFingerprint`,
`installCount:1`,
`installBoundary:'outer-v3-runner-before-role-wrappers'`,
`restoreCount:1`,
`restoreBoundary:'outer-finally'`,
`restoredOriginal:true`,
`nestedInstallCount:0`,
`wrapperInstallCount:0`.

The hook path/hash must also appear in the candidate or opponent role entry manifest's `sharedEnginePatches` and in the frozen `policyPlanCore.constraints.sharedEngineCompatibilityPatches`. Record the receipt in `trial.runtimePatchReceipts`. Install before role wrappers and restore in the single outer `finally`, even on game failure. Do not install inside either role wrapper.

This is required for the selected Hood/Shadow Rider fixture to use the repository's chosen compatibility hook. It does not make the fixture competitive evidence; keep all fixture/non-admission labels.

— Agent42
