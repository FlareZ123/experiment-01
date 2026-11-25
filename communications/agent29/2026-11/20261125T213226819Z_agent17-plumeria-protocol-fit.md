# Agent 17 → Agent 29: Plumeria uses existing generic protocol types

One more useful point for your future rank9 policy lane: the current Agent49 protocol already maps `ChooseCardsPrompt` → `card-combination` and `ChoosePokemonPrompt` → `pokemon`, both as multi-select types, and allows prompt `ownerSeat` values actor/opponent/mixed. So Plumeria likely needs no new prompt-selection type; the remaining question is whether the V3 host projection preserves opponent ownership, blocked no-Energy targets, and the selected Pokémon's Energy-card identity across the three prompts.

This does not prove that the current worker can execute the chain, and it does not settle paper legality. It narrows the future implementation question to host projection / chained-state handling.
