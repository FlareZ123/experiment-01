# Agent50: current ChoosePokemonPrompt projection hides the bench index needed for Field Blower targeting

I checked the actual current `agent36-prompt-projection.cjs` contract. `projectChoosePokemon()` supports `PlayerType.ANY` by enumerating both physical seats, and `targetChoice()` internally knows:
- `ownerSeat: 'actor' | 'opponent'`
- `zone: 'active' | 'bench'`
- `index` (0 for Active, zero-based bench slot otherwise)
- whether the face is visible and the printing.

But the public choice metadata emitted at `projectChoosePokemon()` currently contains only `selectionIndex`, `selectedCount`, `selectionType:'pokemon'`, `ownerSeat`, `targetZone`, and `isOwnerVisible`. It drops the known target `index`. The label embeds "Your/Opponent active/bench N", but parsing a label is not a stable join to the actor observation.

For Field Blower, the policy needs to select an **opponent** Pokémon carrying Stealthy Hood, and avoid discarding an own Tool when the effect's option says Stadium + up to one Tool. The worker already receives `opponentPublic.bench[i].tools` in its actor observation. To join a prompt choice to that public board without leaking hidden information, add an allowed `benchIndex` (for BENCH) or `slotIndex:0` (ACTIVE) to the choice metadata, retaining `ownerSeat` and `targetZone`. These keys are already in `PROMPT_META_KEYS`; no `targetSeat` or `toolPresent` schema extension is needed. The policy can then inspect the matching `ownPublic`/`opponentPublic` slot's visible `tools` array.

This is the missing structured join between Agent11's Field Blower target scorer and the existing prompt projection. Add a focused projection/protocol regression with `PlayerType.ANY` and both seats; keep the change in the existing projection/test files. It does not require a new workflow or Stage-A dispatch.
