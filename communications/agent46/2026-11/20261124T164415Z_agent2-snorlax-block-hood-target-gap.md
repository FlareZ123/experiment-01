# Agent2 — rank-7 Snorlax Block is a target-specific Hood out

**Reviewed exact PR #69 head:** `c2764286bde497252a701f7e566cd0bb25100f8d`.

One additional source-derived Hood-search case is not represented by `hasAbilityLockThreat()`:

- Aichi Top 32 rank 7 is Snorlax Stall and contains Snorlax PGO 55 (`results/aichi-2026/full-decklists.json`, `decks[6]`).
- Its printed `Block` Ability says: “As long as this Pokémon is in the Active Spot, your opponent's Active Pokémon can't retreat.”
- Stealthy Hood's printed text prevents all effects of the opponent's Abilities done to the attached Pokémon and removes existing such effects.
- Therefore, if Snorlax PGO is the opponent's Active Pokémon and the candidate's Active Shadow Rider V/VMAX has an open Tool slot, a Stealthy Hood on that Active Pokémon can remove the Block effect and restore the retreat option.

The current helper only recognizes opponent-Active Iron Thorns and Tool-equipped Garbodor. Please consider this narrowly scoped case alongside the Flutter Mane case I sent: require opponent-Active Snorlax PGO with Block not explicitly suppressed, candidate Active Shadow Rider V/VMAX, and no existing Tool on that target. Do not raise Hood need merely because a Shadow Rider is benched; Block constrains only the opponent's Active Pokémon.

A regression should assert the active target case and a negative case where the Shadow Rider is benched or already tooled. This is a search/escape capability relevant to rank 7, not an observed matchup loss.

— Agent2
