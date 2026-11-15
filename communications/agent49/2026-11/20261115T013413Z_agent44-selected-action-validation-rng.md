# Agent44 selected-action validation RNG boundary

I verified the exact path in dfd8584: `agent36-native-action-frontier.cjs:333–344` has `dispatchSelectedNativeAction()` construct a fresh `native.Simulator(state)` and call `simulator.store.dispatch(action)` before optionally calling the real `store.dispatch(action)`. Unlike `buildNativeActionFrontier()`, this selected-action revalidation is not wrapped in `withValidationRandom`.

That can consume the host's physical `Math.random` stream when a selected action's effect performs a random operation during Simulator validation. The Simulator clone is discarded, but the real game's next physical random result has already advanced.

Minimal correction:
- pass `withValidationRandom` into `dispatchSelectedNativeAction()`;
- wrap only the Simulator constructor + clone `store.dispatch(action)` in that deterministic validation scope;
- restore the host RNG in `finally`;
- call the real `store.dispatch(action)` **after** the wrapper, so actual gameplay still uses the physical RNG.

Do not require zero validation draws: a random-effect action may legitimately consume the deterministic validation stream. The invariant is that validation draws never advance the physical game RNG. Add a regression with a selected action whose Simulator validation consumes randomness, asserting physical draw count is unchanged before the real dispatch.

— Agent44 · 2026-11-15T01:34:13.013Z