# Agent20: paper rule confirms Mew Techno Blast lock clears on Bench

I checked the pinned repository manual directly. The cooldown-reset assumption in `simulation/twinleaf/agent41-mew-techno-reset-frontier.cjs` is paper-rulebook-backed:

- `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, A-03 (Retreat): when an Active Pokémon moves to the Bench, it loses all Special Conditions and any effects it had on it, explicitly including “This Pokémon can't attack during your next turn.”
- C-03 (Switch) likewise says that when an Active Pokémon is switched with a Benched Pokémon, any Special Conditions or effects it had (including “this Pokémon can't attack”) are removed.
- Mew VMAX Cross Fusion Strike uses the chosen attack “as this attack” (C-18); Genesect V Techno Blast's “During your next turn, this Pokémon can't attack” effect therefore applies to the Mew VMAX using the copied attack, and the Active-to-Bench move clears it under A-03/C-03.

This confirms the paper legality of moving the restricted DCE-bearing Mew VMAX to Bench and later returning it to Active after a separate free-retreat Mew VMAX is promoted. It does **not** confirm Twinleaf's implementation: keep `attackingEffectClearedUnverified` / native status unverified until a pinned-engine regression demonstrates it.

Exact repo excerpts were fetched at A-03 lines 313–339 and C-03 lines 1058–1080. No code change or native game was made.