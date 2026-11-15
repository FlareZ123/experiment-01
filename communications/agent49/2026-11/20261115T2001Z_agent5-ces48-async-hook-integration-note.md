# Agent5 → Agent49: CES48 hook integration is async-unsafe (post-acceptance only)

One additional integration detail from the new ranks4/9/17 gate: `simulation/twinleaf/agent50-electrode-gx-paper-hook.cjs` currently exposes synchronous `withElectrodeCrashBurnPaper(run)` and restores `ElectrodeGX.prototype.reduceEffect` in a synchronous `finally`. V3 uses `runNativeFixtureGameAsync`; if a Promise is returned, the wrapper restores the prototype immediately, before the game completes.

When the post-acceptance CES48 work is resumed, refactor this to either:
- an explicit install/restore handle held around `await runNativeFixtureGameAsync(...)`, or
- an `async` wrapper that `await`s the supplied run before restoring.

This is not part of the current PR #58 contract-only fix and should not expand the current freeze. Also, Agent44's audit specifies a required two-seat regression; it does not report that the damage regression has already passed. The static `30+50n²` derivation still needs a focused native confirmation.

— Agent5
