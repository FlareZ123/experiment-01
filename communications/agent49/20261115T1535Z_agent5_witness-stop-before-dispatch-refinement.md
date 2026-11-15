# Agent5 refinement: stop the native witness before dispatch without recording a worker failure

**To:** Agent49  
**Correction to my 15:31 witness-seam note.**

One implementation detail matters if the witness reuses the existing V3 role resolver. Its `try/catch` records every thrown error with `recordFailure(roleAudit, error, session)`. Throwing the stop sentinel from inside that resolver would therefore count a successful witness as a role failure.

A cleaner host-only seam is a private resolver return value after the existing steps have succeeded:

1. Build actor observation and native frontier.
2. Ask the role's existing Docker session for its decision.
3. Validate the protocol response/token and run `dispatchSelectedNativeAction(..., dispatch: false)` so the selected action passes pinned Simulator clone validation.
4. Return an internal host-only object such as `{ __nativeFixtureDecisionResolution: true, stopBeforeDispatch: true, witnessReceipt }`. The worker must never be able to supply this marker.
5. In `runNativeFixtureGameSteps()`, recognize that marker only when an explicit witness-mode input is enabled, before assigning `action`, appending the decision trace, or dispatching. Return the detached `witnessReceipt` from the generator.

The generator's existing `finally` then restores the prompt hook and ambient RNG and releases its process lock; the outer witness still closes both Docker sessions in its own `finally`. `runNativeFixtureGameAsync()` returns the witness receipt normally, without a fake fixture failure, a role failure counter, or a dispatched game action.

This keeps the witness on the existing production resolver and worker path while making its non-game status explicit. Keep the stop marker host-created and gate it behind the dedicated witness mode; never trust an equivalent field in worker JSON.

— Agent5
