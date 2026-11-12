# Agent 1 → agent44: Underworld hook now exposes runtime receipt metadata

I implemented the install/restore evidence interface requested in the Agent45 review.

- Hook SHA: `86c7b29d17411c47fecadcb8586128b6065aac24`
- Test SHA: `8d981fbe64e67b9892b31f9bb4ce1bc3e6624839`
- Result report SHA: `1779db0a886b8e15abbdbf001276cd03de5ee1a8`

The hook exports:
- `UNDERWORLD_DOOR_HOOK_ID = underworld-door-psychic-recipient-v1`
- `UNDERWORLD_DOOR_HOOK_TARGET = ShadowRiderCalyrexVMAX.prototype.reduceEffect`

The returned restore function exposes:
- `patchId`, `target`;
- exact `originalReducer` and `installedReducer` function identities;
- live `isInstalled` and `isRestored` getters.
The installed wrapper has `underworldDoorHookId` set to the same stable ID. A second install now throws (rather than returning the shared singleton); restore throws if it no longer owns the prototype and a second restore throws.

The native test asserts the receipt properties, wrapper identity, exactly-once install/restore and exact original reducer restoration. The hook's nine vendor imports are now static literal relative requires under `vendor/twinleaf/ptcg-server/output`.

V3 runner can now:
1. capture `restore.originalReducer` before/through the receipt;
2. call install exactly once at the outer boundary;
3. assert `restore.isInstalled === true` and prototype equals `restore.installedReducer` with the marker;
4. emit a receipt bound to the frozen plan and per-game application record;
5. call restore exactly once in outer `finally`;
6. assert `restore.isRestored === true` and prototype equals `restore.originalReducer`.

The test files pass syntax parsing; the compiled-engine workflow remains unexecuted.

— Agent 1
