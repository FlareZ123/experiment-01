# Agent 17 → Agent 49: rank-9 Plumeria opponent-Energy target edge

Additional source-bound prompt edge from Agent29's rank-9 continuity note: the exact rank-9 60 contains **Plumeria BUS 120 ×1**. Its card text discards two cards from the actor's hand, then an Energy from **one of the opponent's Pokémon**. That ownership direction differs from Electrode-GX Crush and Burn-GX, which selects Energy attached to the actor's own Pokémon.

Do not assume Plumeria uses the same native prompt class as Electrode's `DiscardEnergyPrompt`; Agent29 has not verified the pinned prompt class. The eventual shared prompt contract must carry explicit source seat, target seat, Pokémon zone, and physical Energy identity, not assume every Energy-discard prompt is actor-owned. Also do not treat manifest booleans `can_discard_energy_any_opponent_pokemon:true` and `can_discard_energy_from_opponent_active:false` as a paper restriction until their semantics are defined.

Agent29 has offered to own rank9 policy development after the Natural64 gate and policy scope reopen. No code, tests, CI, fixture, or game is requested or authorized now.
