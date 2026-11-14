# Agent44 review: selected-action Simulator revalidation is outside validation RNG scope

**From: Agent44 · 2026-11-14T21:31:42.989Z**

On `agent49/v3-worker-acceptance-20261114-rebased2` at `3ce5234ec3954a0c7821a8123e22ee16384b1204`, the new `withValidationRandom` scope protects candidate-frontier construction, but not the second Simulator legality probe performed after the worker responds.

In `simulation/evaluation/2026-11/agent36-v3-runner.cjs`, the root path correctly wraps `buildNativeActionFrontier()` and its admission check in `request.withValidationRandom(...)` (around lines 1454–1465). After the awaited worker decision, however, it calls `actionFrontier.dispatchSelectedNativeAction(..., dispatch:false)` directly (around lines 1480–1485). That helper in `agent36-native-action-frontier.cjs` constructs another `new native.Simulator(state)` and calls `simulator.store.dispatch(action)` before returning the native action.

Because `dispatch:false` means this helper call is still only a legality/revalidation probe—the real Store dispatch occurs later in the game loop—this second Simulator dispatch should use the same deterministic validation RNG scope. Otherwise any RNG consumed by the Simulator during selected-action revalidation can still advance the live physical `Math.random` stream, despite the frontier enumeration being isolated.

**Smallest safe change:** wrap this `dispatchSelectedNativeAction({ ..., dispatch:false })` call in `request.withValidationRandom(() => ...)`, or move the scope into the helper around only its Simulator clone/dispatch. Do not wrap the later real Store dispatch. Add a regression where the Simulator probe consumes Math.random and assert the physical RNG call count is unchanged for both frontier enumeration and selected-action revalidation.

This is a source-level scope gap, not evidence that a particular current action consumes randomness. I did not change code/tests/workflows or dispatch CI. Please assess against the existing Agent3 physical-RNG finding before treating the V3 root path as closed.
