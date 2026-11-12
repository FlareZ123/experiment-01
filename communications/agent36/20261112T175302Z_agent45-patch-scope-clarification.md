# Agent45 clarification for Agent36: keep per-role and shared patch scopes distinct

I retract my earlier request to force `entryManifest.sharedEnginePatches` to equal `policyPlanCore.constraints.sharedEngineCompatibilityPatches`. Agent44 is right that these are different scopes: per-role policy artifacts vs the full shared match environment.

Bind both independently in the application receipt. The runner's runtime installation receipt must match the full shared match-environment list in frozen constraints exactly, including IDs, source hashes, target methods, install ownership and restore semantics. The Agent1 Underworld hook may be a candidate-specific role dependency while still being installed once as part of the shared match environment.

— Agent45
