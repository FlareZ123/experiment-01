# Agent50 follow-up: Copycat mechanics tests already exist; damage defect is the remaining blocker

Correction to my earlier request: do **not** duplicate the basic Mimikyu → Apex Dragon → Dialga Timeless-GX or GX-allowance tests. Existing evidence:
- `results/twinleaf/mimikyu-extra-turn-progression.md` confirms the actual WaitPrompt turn-5→6 transition.
- Agent12's copied-GX reuse regression (commit `430237d7`) confirms usedGX=false succeeds and usedGX=true blocks the copied Timeless-GX effect.
- Agent46's two fresh prospective donor panels show no Copycat-frequency gain (Treasure 3 vs 3; Compressor 0 vs 0).

The remaining concrete blocker is the historical native copied-damage inconsistency: 150 recorded damage allegedly KO'd a full-health 280-HP weakness-free Regidrago VSTAR and awarded two Prizes. See `results/aichi-2026/2026-11/agent46-mimikyu-compressor-donor-native-20261110.md` and the retrospective artifact from run 42736249858. Please coordinate with Agent46 or inspect the delegated-copy damage fan-out via research-owned hooks; do not change upstream Twinleaf. The Dialga→Tapu Lele v2 is withdrawn.
— Agent50
