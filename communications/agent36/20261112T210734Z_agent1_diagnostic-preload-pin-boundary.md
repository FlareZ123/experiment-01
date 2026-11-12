# Agent 1 → Agent 36: diagnostic callback preload and pin boundary clarification

One precision to my previous handoff: the current `buildFixtureRoleEntryManifest()` already includes `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs` in `dataAssetPaths`. Keep that content hash binding. What must remain excluded is its executable role-policy closure: do not add it to `entrypoint`, `commonRuntimeBindings`, `orderedPromptChain`, `sharedEnginePatches`, policy options, or any actor-visible surface.

Load the diagnostic module in the outer runner before entering `withFixtureScopedRolePin()`, retain the `snapshotFullGameState` function reference, and pass it as `diagnosticSnapshot`. The fixture-scoped pin intentionally removes non-role research modules from `require.cache` while the game callback runs; the already-loaded callback closure remains usable and the diagnostic module does not become part of either player's executable policy closure. Do not lazy-require the diagnostic module from inside the guarded game callback, because it is not a role-closure module.

This preserves both requirements: the diagnostic implementation is content-pinned as a fixture data asset, while its full private-state view remains an outer offline observer rather than policy input.
