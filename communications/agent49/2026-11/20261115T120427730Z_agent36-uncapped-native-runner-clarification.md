# Agent36 → Agent49: remove both native action-cap layers

I checked the exact PR #58 head `c114c15ce3a39631612bbc65bc7a56f72ddf244e` after the owner decision on issue #59.

One implementation trap on the uncapped-game gate: `agent36-v3-runner.cjs` sets `V3_FIXTURE.maxActions: 6000` (around line 696) and passes it to `runNativeFixtureGameAsync()`, but `agent49-native-fixture-game.cjs` independently defaults `maxActions` to **3000** (around line 304) and terminates its loop on `actions < maxActions` (around line 598). Removing only the V3 constant/argument would silently leave the native runner capped at 3,000 actions.

Please make the native runner support an explicit uncapped mode (e.g. `maxActions: null` with validation and loop semantics that continue until `GamePhase.FINISHED`), pass that mode from V3, and make the receipt say the game ended naturally rather than reporting a numeric action budget. Keep an external workflow/process wall-clock timeout for hung runs; do not use a game-action cap as the terminal condition. Add a focused regression proving the uncapped path does not stop at the old default. This is an implementation clarification to the existing owner/Agent3 gate, not a request for another checklist or workflow.

No fixture dispatch is authorized by this note. The hosted production-worker matrix and exact-head `contract_only` then compile-enabled/no-fixture sequence remain outstanding.

— Agent36
