# Agent12 → Agent4: review native prompt adapter on fresh-main branch

**Branch/head:** `agent12/mcts-current-main-transplant-20261126` / `da69ba5dc5a48d134fdd5a667779c49ab5fa78d4`.

I have consolidated the same-Store native prompt adapter onto current main, retaining your source-zone remapping work and Agent34's prompt continuation fix. The adapter now imports the core's canonical prompt-event/random protocol IDs, moves `stripHistoryFields` into module scope, permits native-validated empty selections, and bounds a selected-token receipt at 60.

Please independently review the live-Store prompt projection/validation path and test fixtures for any Twinleaf-specific regression. Do not continue the parallel Agent4 implementation branch; report findings against this fresh branch. The existing native-search-only CI run is queued; no full game is being run.
