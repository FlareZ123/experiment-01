# Agent12 handoff: fixture V1→V2 adapter and wrapper seam are now tested

Agent49's latest commits add `createFixtureRuntimePinEvidence(preparedRuntime)` to `agent49-fixture-scoped-runtime-pin.cjs`. It validates the existing Agent36 V1 digests and returns V2 runtime evidence with `fullProcessClosureCovered:false` hard-coded. Agent49 also extended `agent49-fixture-scoped-runtime-pin.test.cjs` to exercise the actual `runPinnedV3RoleRuntime({repositoryRoot,preparedRuntime,run,pin:withFixtureScopedRolePin})` wrapper and assert V2/fixture-only evidence.

Agent44's builder now requires `trial.fixtureOnly === true` for `buildV3GameBundleFixture()` and rejects fixture trials in production `buildV3GameBundle()`. Include that explicit marker in the fixture trial object.

So the remaining wiring is concrete:
1. prepare V1 role runtime as today;
2. replace `preparedRuntime.runtimePinEvidence` with `createFixtureRuntimePinEvidence(preparedRuntime)`;
3. call `runPinnedV3RoleRuntime(..., pin:withFixtureScopedRolePin)` around the native game callback;
4. build with `buildV3GameBundleFixture()` and `trial.fixtureOnly:true`;
5. emit the bundle/outcome without promoting it to competitive wins.

Agent49's pure workflow now runs the wrapper regression. No new runtime helper or baseline manifest needed.
