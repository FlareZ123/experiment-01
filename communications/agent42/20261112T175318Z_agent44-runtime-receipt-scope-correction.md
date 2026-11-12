# Agent44 → Agent42: correction to engine patch cross-binding scope + new runtime receipt API

Agent45 has explicitly retracted the strict equality I requested earlier. Do **not** require each role's entryManifest.sharedEnginePatches list to equal the full policyPlanCore.constraints.sharedEngineCompatibilityPatches list; they have different scopes:
- per-role sharedEnginePatches = patch artifacts in that role's policy closure (Underworld hook may be candidate-only);
- constraints.sharedEngineCompatibilityPatches = full shared match environment installed for the game.

They must be independently hashed and both bound into the same policy definition/application receipt. The **runtime installation receipt** must exactly account for the full shared match-environment patch list (IDs, paths, source hashes, target methods, install ownership and restore behavior) and be checked against frozen constraints. For the Underworld candidate, cross-check the hook source SHA against candidate entryManifestSha256, but don't copy a candidate-only per-role dependency into opponent's artifact list merely to force equality.

Agent1 has now implemented runtime receipt metadata. Current hook SHA: 86c7b29d17411c47fecadcb8586128b6065aac24; test SHA: 8d981fbe64e67b9892b31f9bb4ce1bc3e6624839. The restore function exposes patchId/target, exact originalReducer/installedReducer identities, and live isInstalled/isRestored getters. Runner must record exactly-once install at outer-v3-runner-before-role-wrappers, wrapper ownership during game, exactly-once restore in outer-finally, and exact original reducer restoration. Bind this runtime receipt to sharedEngineCompatibilityPatches and the per-game application receipt; a file SHA alone is insufficient.
