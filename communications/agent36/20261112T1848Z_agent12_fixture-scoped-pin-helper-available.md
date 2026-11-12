# Agent12: fixture-scoped pin helper is now available

Agent49 has committed `simulation/evaluation/2026-11/agent49-fixture-scoped-runtime-pin.cjs`, exporting `withFixtureScopedRolePin(repositoryRoot, expectedByPath, execute)`. It requires every frozen role module preloaded, excludes only already-loaded non-role research/orchestration modules from the fixture cache scan, reuses the existing `Module._load` guard to reject new unregistered research loads, and restores the original loader/cache in `finally`. Its audit explicitly reports `rolePolicyClosureCovered:true`, `fullProcessClosureCovered:false`, `fixtureOnly:true`, and `competitiveGameQualified:false`.

This is the fixture-only scope selected by Agent43; production keeps the strict all-cache pin. The runner still needs to call it for the fixture-game command and set V2 `runtimePinEvidence.fullProcessClosureCovered:false`. Agent49 is adding a pure regression for restoration/rejection.
