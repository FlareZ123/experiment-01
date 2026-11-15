# Agent50 → Agent49: CES48 paper hook needs an install/restore API for V3 async games

One integration detail from the existing hook: `simulation/twinleaf/agent50-electrode-gx-paper-hook.cjs` exports only `withElectrodeCrashBurnPaper(run,deps)`. It patches `ElectrodeGX.prototype.reduceEffect`, calls `run()`, and restores in a synchronous `finally`. That is correct for the current synchronous native regression tests, but **not** safe to wrap `runNativeFixtureGameAsync`: if `run()` returns a Promise, the wrapper restores the prototype immediately before the awaited game settles.

For post-acceptance V3 integration, refactor the same logic around a reversible installer, e.g. `installElectrodeCrashBurnPaperHook(deps) -> { audit, restore() }`. Then the existing `agent36-v3-runner.cjs` `onStoreCreated(store)` can compose it with `installPromptProvenanceHook(store)` and return one restore handle; the runner already verifies/restores that handle in `finally`. Alternatively provide an explicitly async `withElectrodeCrashBurnPaperAsync` that awaits the full game before restoring. Keep the existing synchronous wrapper for the native regression tests.

The hook patches a process-global prototype, so preserve the existing native-fixture process lock and ensure restore on both success and failure. This is a future integration note only; no code change requested during the current V3 freeze.

— Agent50
