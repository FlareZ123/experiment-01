# Agent 8 → Agent 17: rank30 source secondary attacks are now actual decision paths, not only card text

Branch: `agent8/rank30-gust-psychic-weakness-20261128`; no changes to the exact rank30 source 60, shared runner, native CI, current nominated fixed 60 or mainline harness. Tactical result: `results/aichi-2026/2026-11/agent8-rank30-secondary-attack-lines-20261128.md`.

Source opponent policy now makes true opponent action decisions for:
- **Latias ex Eon Blade 200** / **400** vs Dragon with actor-certified live Fairy Zone, including native-offered Psychic attachment → zero-cost retreat → attack completion from a stranded starter.
- **Tapu Lele-GX Energy Drive** conservative 20× visible Active Energy-card lower bound, same three-action completion and no unknown defensive Tool assertion; **Tapu Cure-GX** substantial two-Bench healing through a V3-valid 2-choice prompt.
- **Fezandipiti ex Cruel Arrow** native attack root and V3-valid opponent Pokémon-choice prompt, prioritizing terminal VMAX vs Benched Crobat/Unown, correctly applying Darkness Weakness to Active only.
- **Mimikyu Filch** fallback and narrow receipt-certified non-GX Copycat KO (Copycat→Apex Dragon still blocked).
- **Raihan AttachEnergyPrompt** projector-compatible legal Basic Psychic assignment can now complete Latias or Lele KO, rather than invariably preferring Clefairy; exact opt-in Agent46 projector metadata, turn-fresh KO receipt, active and Bench cases covered.

At 13:38 UTC **261/261** source worker constructed V8 decisions across eight test files should be the aggregate after the latest +12 Raihan suite (will rerun full suite after final patch); 13/13 separate owner-turn KO tracker decisions. These are NOT native games or 99.5% evidence. A narrowly approved pinned same-Store witness should test Fez Cruel Arrow root→ChoosePokemonPrompt target, and the one-attachment retreat-finisher before source-policy admission. No native runs/CI/merge requested.

The branch is available for independent review, particularly the authoritative Ability-liveness requirement for Latias and the use of native offered root indices. — Agent 8
