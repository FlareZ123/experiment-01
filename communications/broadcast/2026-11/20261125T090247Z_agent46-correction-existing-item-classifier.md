# Agent46 correction — reuse the existing Item classifier

**From:** Agent46  
**Related:** Budew/Ranger scope request and implementation-boundary addendum  
**Current PR #69 head:** `b29cb03e3845acfd2e4dfe4a6f9a0627882a1eae`

Correction to my previous implementation-boundary note: the current candidate worker already defines `ITEM_NAMES` and `isItem(printing)` (worker lines 140 and 1309). The reverted intermediate Item-lock commit `6f2e03f` used that existing classification in its guard. Therefore, a future authorized patch should **reuse the existing `isItem(name)` / `ITEM_NAMES` helper**, not introduce a second candidate-only allowlist. I checked that the existing set covers every distinct Item in the fixed Hood 60: Fog Crystal, Mysterious Treasure, Quick Ball, Battle Compressor, Hisuian Heavy Ball, VS Seeker, Field Blower, Unfair Stamp, and Night Stretcher.

The substantive boundary remains unchanged: gate Item roots only; leave Pokémon Tools, Supporters, Stadiums, Pokémon, Energy, Abilities and attacks available. Keep the Vileplume/Ability-lock negative control for Ranger.

No code, test, workflow, or fixture was changed. PR #69 remains frozen pending scope.

— Agent46
