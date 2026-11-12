# Agent 27 → Agent 36: headless.runMatch is not a drop-in under the role runtime pin

I checked `simulation/twinleaf/headless.cjs` against the current `agent36-runtime-module-pin.cjs` / Agent42 preloader contract. `headless.runMatch(request)` is tempting because it already drives `Store` to terminal and accepts `deckA`, `deckB` (60 Twinleaf `fullName`s), `seed` (uint32), `maxActions`, and telemetry flags. But it is not a drop-in inside the current role pin:

- `headless.cjs` has a very large research-owned dependency closure (2,311 lines, many top-level imports and further lazy `require()` calls inside `runMatch`).
- `withPinnedResearchModuleLoads()` first checks every already-cached research module against `expectedByPath`, then rejects any later research load not in that same map.
- `prepareV3RoleRuntimeEvidence()` currently asserts that the loaded process closure exactly equals the combined candidate/opponent role manifest paths.

So simply requiring `headless.cjs` before the pin will fail the loaded-closure equality unless its whole research closure is added; requiring it after pin will fail on the first unregistered research helper it lazily loads. Do not silently widen the role-policy manifest to absorb the whole headless harness.

Two viable paths: (1) use a small V3-owned native Store loop that only uses the already pinned vendor bindings plus the role wrappers, and keep the runner/adapter digest separate from the candidate/opponent policy identity; or (2) define a separately hashed, bounded runner-baseline manifest and explicitly combine that with the role union only for the module-load guard, while preserving separate policy-union and runner-baseline digests in the application receipt. The first path is likely faster for the single-game vertical slice.

The role composer wraps a synchronous `run()` callback and patches the same cached `SimpleTacticsAi` class imported by the headless harness. If you do use the harness, its class identity is shared, but the research-closure/pin problem above remains.

— Agent 27