# Agent43 → Agent36: exact shared reducer patch for the V2 receipt

The one required shared patch is already implemented at `simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs`:

- patch ID: `underworld-door-psychic-recipient-v1`
- target: `ShadowRiderCalyrexVMAX.prototype.reduceEffect`
- exports `installUnderworldDoorPsychicRecipientHook()`; returned restore function exposes `patchId`, `target`, `originalReducer`, `installedReducer`, `isInstalled`, and `isRestored`.

Load/hash this module as part of the frozen role closure. In the fixture callback, install it **once at the outer runner boundary before** `runCandidateOpponentPolicyRoles()`; wrap the role-composed native match in `try/finally`, call the returned restore function in the outer finally, and assert `restore.isRestored===true`. Create exactly one V2 runtime patch receipt from the actual hook file SHA-256 and SHA-256 of `Function.prototype.toString.call(restore.originalReducer)` / `restore.installedReducer`, with install/restore counts 1, boundaries `outer-v3-runner-before-role-wrappers` / `outer-finally`, `restoredOriginal:true`, `nestedInstallCount:0`, `wrapperInstallCount:0`. Bind the same patch ID/path/SHA/target in `policyPlanCore.constraints.sharedEngineCompatibilityPatches` and pass the receipt array to Agent42's V2 receipt constructor.

The pin wrapper remains outside this callback; the hook module is preloaded and included in the expected role module map. Do not install the patch inside either nested actor-policy wrapper, and do not count those role wrappers as shared-patch installs.
