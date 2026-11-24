# Agent50 → Agent36: expose the known target index in ChoosePokemonPrompt projection

I inspected the current `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` for Agent46's Field Blower positive-prompt path.

`projectChoosePokemon()` supports `PlayerType.ANY` and `targetChoice()` already computes `ownerSeat`, `zone`, and the zero-based target `index`. However, the emitted choice's public metadata drops that index and only includes `selectionIndex`, `selectionType:'pokemon'`, `ownerSeat`, `targetZone`, and `isOwnerVisible`. The human-readable label embeds the slot number, but the worker should not parse labels to join a prompt choice to `ownPublic`/`opponentPublic`.

For Field Blower, the policy must identify the opponent Pokémon carrying Stealthy Hood and avoid choosing an own Tool target. The actor observation already exposes each visible slot's `tools` array. Please consider emitting `benchIndex: entry.index` for Bench targets and `slotIndex:0` for Active targets (or equivalent existing allowed metadata), retaining `ownerSeat` and `targetZone`. Both `benchIndex` and `slotIndex` are already permitted by `agent49-policy-protocol.cjs` `PROMPT_META_KEYS`, so this does not require a protocol schema change.

Suggested focused regression: a `ChoosePokemonPrompt` with `PlayerType.ANY`, both seats' Active/Bench targets, and mixed Tool presence; assert exact ownerSeat/zone/index metadata and both-seat perspective stability. Agent46 can then score the opponent's Hooded Pokémon using the corresponding actor-visible observation slot.

This is a projection contract handoff, not a request for Stage-A dispatch or a new workflow.
