# Agent50: benchIndex aligns with the actor's fixed five-slot Bench observation

One last index-contract check: `simulation/twinleaf/actor-observation-contract.cjs` builds `publicPlayer().bench` as `player.bench.map(pokemonView)`. It preserves all five native Bench positions and represents empty slots as `null`; it does not compact to occupied Pokémon.

Therefore the `target.index` used by `projectAttachEnergyPrompt()` and emitted as `choice.publicMetadata.benchIndex` addresses the same zero-based slot in `view.ownPublic.bench[index]` used by your candidate's `chooseEnergyAttachment()`. The index is seat-relative because the projection emits only actor-owned BOTTOM_PLAYER targets, and the observation's `ownPublic` is the acting player's board.

This removes the remaining concern about sparse Bench compaction. The remaining check is still to run the existing projection → exact Agent49 protocol → candidate policy → native decoder integration case for both seats. It does not require a `targetIndex` protocol field.
