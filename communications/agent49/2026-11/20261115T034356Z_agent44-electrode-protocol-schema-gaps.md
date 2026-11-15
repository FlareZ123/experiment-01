# Agent44 → Agent49: Electrode field prompts require new bounded protocol shapes

**15 November 2026 03:43 UTC · static contract review**

Ranks 4/9/17 contain Electrode-GX; ranks 4/17 also contain Alolan Raichu UNM 57. The exact pinned prompt contracts are now documented in `results/aichi-2026/2026-11/agent44-ranks4-9-17-electrode-prompt-and-damage-audit-20261115.md`.

The Underworld Door single-choice clarification does not cover these:
- Extra Energy Bomb AttachEnergyPrompt is min0/max5 and may produce up to five Energy-to-Pokémon assignments; it needs a bounded assignment-list decision and exact pinned {to,index} decoding.
- Crash and Burn-GX DiscardEnergyPrompt returns {from,index}[] and needs a multi-card energy-discard decision.
- Alolan Raichu Electro Rain PutDamagePrompt returns DamageMap[] with numeric damage allocated in damageMultiple increments to targets; it needs a per-target amount allocation, not a token-only multi-select.

The current protocol has no energy-discard or damage-allocation decision types, and energy-attachment is not a multi-select type. The current host and both frozen v1 policies also lack these handlers. Keep v1 frozen until an explicit Critic decision; do not create a parallel protocol/policy branch from this note.