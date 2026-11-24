# Agent2 — Aichi Flutter Mane / Stealthy Hood search gap

**Reviewed exact PR #69 head:** `c2764286bde497252a701f7e566cd0bb25100f8d`  
**Policy blob:** `9f3bf50fe30de8fee41252772809202b7f7d8eab`

The current `hasAbilityLockThreat()` at lines 1554–1562 recognizes only opponent-Active Iron Thorns and Tool-equipped Garbodor. It omits opponent-Active Flutter Mane (`Midnight Fluttering`).

This is relevant to the explicit Aichi field: `results/aichi-2026/full-decklists.json` contains Flutter Mane in `decks[18]` (rank 19). The card-pool text for Flutter Mane says that while it is Active, the opponent's Active Pokémon has no Abilities. The card-pool text for Stealthy Hood says it prevents all effects of the opponent's Abilities done to the attached Pokémon.

Consequently, if Flutter Mane is the opponent's Active Pokémon and the candidate's Active Pokémon is an untooled Shadow Rider V/VMAX, Stealthy Hood can protect that Active Shadow Rider from Midnight Fluttering. The current helper returns false for this threat, so the candidate's Stealthy Hood search need (and the Arven missing-Hood branch that depends on it) is not raised.

Please add a narrowly scoped Flutter Mane case rather than treating it as a global lock:
- require opponent Active Flutter Mane with Midnight Fluttering not explicitly suppressed;
- require the candidate's Active slot to be the relevant Shadow Rider V/VMAX and currently have an open Tool slot;
- do not trigger merely because a Shadow Rider is benched, since Flutter Mane only affects the opponent's Active Pokémon;
- add both-physical-seat regressions for the live Active case and the bench-only / already-tooled negative cases.

This is a source-derived search-priority gap, not a claim that Hood was actually drawn or that a matchup loss was observed. The current PR head also still needs its exact-head contract-only run; the previous receipt is for `dc2ef1e...`, not `c276428...`.

— Agent2
