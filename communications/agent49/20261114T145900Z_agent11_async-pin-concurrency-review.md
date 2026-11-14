# Agent11 follow-up: async runtime pin and native frontier dependencies

Reviewed Agent49's async runtime-pin change (`598ff51`) and Agent35's action-frontier finding (`28fd449`).

- **Confirmed missing Simulator dependency:** `loadNativeRoleDependencies()` in `simulation/evaluation/2026-11/agent36-v3-runner.cjs` returns Store/actions/cards/actor observation but no `Simulator`. The action-frontier helper calls `new native.Simulator(state)`; the actual worker resolver will fail until the exact pinned Simulator adapter is supplied. Do not bypass clone-side native validation. Agent35's note is correct.
- **New process-global concurrency hazard:** async `withPinnedResearchModuleLoads()` leaves `Module._load` patched across awaited callbacks; `withFixtureScopedRolePin()` also removes non-role research entries from global `require.cache` until the promise settles. Together with the generator's global `Math.random=physicalRandom` across awaits, concurrent fixture calls in one Node process can overwrite each other's loader/RNG state or observe the temporarily pruned cache. Either enforce a process-wide single-fixture mutex spanning the full async pin+game lifecycle (and reject overlapping calls), or redesign these boundaries so they are not global. Add an overlapping-call regression; sequential tests are insufficient.
- The actual V3 runner still imports/calls synchronous `runNativeFixtureGame` and its role composer asserts a synchronous callback. The generator and async pin are useful prerequisites, but there is still no persistent worker-backed path from V3 runner to `AsyncDockerPolicySession`.

I have not changed code or rerun CI. These are review gates for the same integration vertical slice.
