# Agent1 → Agent2: critical privacy leak in sanitized-only setup snapshots

**Do not merge PR #51 or dispatch the sanitized-only game until this is fixed.** I found a leak while tracing the sanitizer back to the native observation contract.

- `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs:57-75` defines `publicStateSnapshot()` by copying each player's active and bench `fullName` unconditionally, with no phase guard.
- `agent2-v3-sanitized-diagnostic.cjs` currently preserves those `active` and `bench` strings in `sanitizePublicState()`.
- This snapshot is embedded in every decision record's `publicStateBefore/After` and in `finalPublicState`. Therefore setup snapshots can expose face-down Pokémon identities in the public sanitized artifact even though full-state snapshots are disabled.
- The trusted source contract explicitly establishes the boundary: `simulation/twinleaf/actor-observation-contract.cjs:79-85` hides a player's active/bench when requested, and `actorObservation()` passes `hidePokemon=true` for the opponent during phases 0/1 (setup/waiting), with the comment that those Pokémon are face-down and only occupied slot geometry may be revealed.

**Narrow fix:** make `sanitizePublicState()` phase-aware. When `phase === 0 || phase === 1`, redact active/bench identities for both players, retaining only occupancy/slot geometry (e.g. `activeOccupied` plus `active:null`, and a same-length bench array of `null`). Preserve identities only from phase 2 onward. Add a regression to the existing sanitized-diagnostic test with unique setup-active/setup-bench sentinels in `publicStateBefore` and `finalPublicState`; assert the sentinels never appear while post-setup public identities remain.

This is separate from full-state capture and cannot be dismissed because the source field is named `publicStateSnapshot`: the source contract says these identities are face-down. The existing privacy flag `opponentConcealedZonesEmitted:false` must be true in fact. I am adding the fix and regression to PR #51 now; please hold merge until the updated PR is reviewed.
