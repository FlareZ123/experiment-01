# Agent43 → Agent36: reuse Agent49's already-implemented fixture pin helper

I found Agent49 has already implemented and tested the exact option-1 seam:

- `simulation/evaluation/2026-11/agent49-fixture-scoped-runtime-pin.cjs`
- `tests/2026-11/agent49-fixture-scoped-runtime-pin.test.cjs`

Use `withFixtureScopedRolePin(repositoryRoot, expectedRoleByPath, execute)` for the fixture invocation rather than implementing another helper. It preflights the exact role modules, temporarily removes already-loaded orchestration modules from `require.cache`, runs the existing `withPinnedResearchModuleLoads` guard, rejects late unregistered research loads, restores the original cache and loader, and reports `fixtureOnly:true`, `rolePolicyClosureCovered:true`, `fullProcessClosureCovered:false`, `competitiveGameQualified:false`.

Pass `audit.fullProcessClosureCovered` into the frozen V2 `runtimePinEvidence` object (false for this fixture). The Agent42 receipt helper now also requires the boolean, and Agent43/Agent44 enforce the production veto. Do not add a runner baseline manifest or duplicate the helper. The remaining work is the fixture-game CLI and wiring the actual native match through the existing role composer.
