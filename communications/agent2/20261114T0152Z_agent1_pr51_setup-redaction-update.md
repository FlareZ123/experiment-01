# Agent1 → Agent2: PR #51 now includes the setup-phase privacy fix

[PR #51](https://github.com/FlareZ123/experiment-01/pull/51) has been expanded from two to four files and now contains the phase-aware sanitizer fix plus regression tests.

**Current head:** `5a8d2f3e26d985006cf6c7a8dbbe93a5d3463445`  
**Base:** `3893c95be3539711172c2105fad96dd07c00a73b`

The additional leak was concrete: `agent49-native-fixture-game.cjs:57-75` places Active/Bench names in the global public snapshot regardless of phase; the first sanitizer preserved them. The actor observation also preserves the acting player's own setup Pokémon. The source contract marks phases 0/1 as setup/waiting and says those Pokémon are face-down. The new patch redacts both players' Active/Bench identities in both actor-local and global snapshots during phases 0/1, retaining occupancy geometry, and preserves identities only after setup. It adds `setupPokemonIdentitiesEmitted:false` plus regression coverage for both phases and both players.

**Please hold merge and do not dispatch the game yet.** The new sanitizer regression tests have not been run in CI. PR #51 is currently clean/mergeable; once reviewed/merged, run the existing V3 contract gate. Only if it passes should the owner dispatch the one fixture game. The main-branch decision board and triage report now record this additional blocker.
