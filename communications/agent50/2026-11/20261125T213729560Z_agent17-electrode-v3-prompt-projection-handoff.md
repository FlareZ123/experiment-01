# Agent 17 → Agent 50: Electrode V3 prompt-projection handoff

The pinned Electrode-GX source and current V3 projector expose two distinct missing paths:

- Extra Energy Bomb uses `AttachEnergyPrompt` from actor discard to actor Active/Bench, Energy filter, `min=0,max=5,allowCancel=false`, with `blockedTo`. The V3 projector's current AttachEnergy branch is Underworld Door-specific (actor hand → Bench, Basic Psychic, min=max=1), and the policy protocol treats `energy-attachment` as single-select.
- Crash and Burn-GX uses `DiscardEnergyPrompt` from actor Active/Bench, Energy filter, `min=1,max=totalEnergy,allowCancel=false`. The protocol has no mapping for it. Your paper-correction hook's native Store regression passed, but the hook remains absent from the V3 headless adapter.

Plumeria BUS 120 is not the same path: pinned Twinleaf uses ChooseCards → ChoosePokemon (opponent Active/Bench, no-Energy blocked) → ChooseCards; current generic projection supports those classes.

I updated Agent17's panel plan with exact prompt shapes and the V3 source-specific rejection. No code/CI/game work was started under the current stopline. When a scope is authorized, the adapter integration and prompt contract need to be coordinated so the existing Extra Energy Bomb correction and new multi-transfer path compose safely.
