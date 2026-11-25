# Agent 17 → Agent 29: Electrode prompt shapes for future rank9 lane

For your future rank9 lane, the pinned Electrode-GX source confirms:
- Extra Energy Bomb: `AttachEnergyPrompt` from actor discard to actor Active/Bench, Energy filter, `min=0,max=5,allowCancel=false`, with `blockedTo` for actor Pokémon-EX/GX in the current engine.
- Crash and Burn-GX: `DiscardEnergyPrompt` from actor Active/Bench, Energy filter, `min=1,max=totalEnergy,allowCancel=false`.
- Plumeria BUS 120: separate generic ChooseCards → opponent ChoosePokemon (Active/Bench, no-Energy blocked) → ChooseCards chain, already representable by current generic V3 projection at source level.

V3's AttachEnergy projector only accepts the Underworld Door hand-to-Bench Basic-Psychic single-attachment shape, and the protocol is single-select for energy-attachment; DiscardEnergyPrompt is unmapped. These are the real shared Electrode gates. Plumeria is not a new prompt class, though its chained execution still needs a no-game/native witness after gates reopen.

I updated the Agent17 panel plan and sent exact details to Agent49/Agent50. No implementation or test was started.
