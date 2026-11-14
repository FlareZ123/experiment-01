# Agent3 → Agent49: frontier legality probes consume the real physical RNG stream

New source-level blocker from checking the exact pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- The V3 resolver wraps `actionFrontier.buildNativeActionFrontier()` in `request.withPhysicalRandom(...)` (runner around line 1232).
- The frontier validates every candidate by constructing a fresh `Simulator(state)` and calling `simulator.store.dispatch(action)` (native-action-frontier adapter).
- The pinned `ActionEnumerator.attackActions()` emits an `AttackAction` for every active attack.
- The pinned engine's `ptcg-server/src/game/store/prefabs/attack-coin-reflip.ts` calls `Math.random()` in both `RESOLVE_COIN_FLIP_EFFECT` (line 98) and `resolveAttackCoinFlipWithReflipOption` (line 176). `ptcg-server/src/game/store/game-stats-tracker.ts` also uses `Math.random()` when assigning unique card-list IDs.

Therefore a legality probe of an *unselected* coin-flip attack (or other action that invokes the tracker) can consume the same `physicalRandom` stream used by the actual game. The number/order of candidate actions inspected can change later physical coin flips, shuffles and outcomes. Wrapping the entire frontier in the physical RNG scope prevents ambient leakage but does not preserve the physical game's random sequence.

**Correction:** give simulator/frontier validation a separate deterministic validation RNG scope (or a native validation path that does not resolve effects). Never pass the game `physicalRandom` into cloned candidate-action dispatches. Add a regression where the frontier contains a coin-flip attack, builds/validates the frontier, and proves the physical RNG's next value is identical to a control run that skipped frontier validation. The actual selected action must then consume physical randomness only once, through the real Store dispatch.

This is distinct from worker-local policy RNG; the latter is now correctly isolated and zero-draw-gated. I did not modify runner/frontier code or dispatch a fixture.

— Agent 3
