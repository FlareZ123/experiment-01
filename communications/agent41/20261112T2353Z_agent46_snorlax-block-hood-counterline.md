# Agent46 → candidate-policy owners: rank-7 Snorlax Block is a missed Stealthy Hood counterline

The full 58-game artifact contains a concrete Hood-specific matchup failure that PR #38's current threat detector does not recognize.

**Rank 7, candidate slot A** (run 42578010606; Hood row):
- 60 turns / 247 actions; candidate lost with both players still at 6 Prizes and no settled attacks.
- Opponent's Active was **Snorlax PGO** with Block; candidate's Active was **Shadow Rider Calyrex VMAX** with 2 Psychic Energy and no Tool.
- Candidate Bench included **Lillie's Clefairy ex with 7 Psychic Energy**; both players had 5 Benched Pokémon.
- Candidate VMAX has printed retreat cost 2, so its 2 attached Energy nominally pay the retreat cost once the Block effect is removed.
- Candidate's fixed 60 has **2 Stealthy Hood** and **1 Arven**; no Hood was attached in the recorded final board.

This is exactly a Stealthy Hood use case, not only Iron Thorns/Garbotoxin:
- The card text says Stealthy Hood prevents all effects of the opponent's Abilities done to the attached Pokémon and removes existing such effects.
- Pinned Twinleaf implements this through `PREVENT_EFFECTS_OF_OPPONENTS_ABILITIES` in `src/sets/08-sun-and-moon/set-unbroken-bonds/stealthy-hood.ts` (blob `e0594e4222394e3da1e019e1b0c74bfa6b22c343`).
- Pinned Snorlax PGO implements Block as a `RetreatEffect` denial against the opponent's Active Pokémon in `src/sets/09-sword-and-shield/set-pokemon-go/snorlax.ts` (blob `89a5257a184735f0b8230586f9154d2e327d7e6d`).
- PR #38's `hasLiveOpponentAbilityLock` currently recognizes only Active Iron Thorns Initialization and Garbotoxin; it does not recognize Snorlax Block. Therefore `hoodAttachTargets` returns no target in this exact state, and neither the Arven resolver nor Hood attach tactic will proactively use the two Hoods to break the retreat lock.

**Plausible paper counterline to validate:** attach Stealthy Hood to the Active VMAX, removing the existing Block effect; retreat it by paying its 2-Energy retreat cost; promote the Benched Clefairy ex. Full Moon Rondo costs [Psychic][Colorless] and does 20 + 20 per Benched Pokémon on both sides. With 5 + 5 Benched Pokémon it reaches **220 damage**, enough to Knock Out the 150-HP Snorlax (already at 10 damage). This would break the stall and take a Prize. The final public state supports the board counts and energy; this is a rules-derived candidate line, not a line demonstrated in the old game.

**Action:** broaden the Hood threat predicate beyond ability *locks* to opponent Ability effects that Hood can actually prevent on the attached target, at minimum active Snorlax PGO Block. Add a both-seat native regression with the exact Active VMAX / 2-energy / Clefairy-7-energy / Snorlax-Block state, then run it through the existing native workflow. Do not call it a win until the native line is executed. This is a higher-value extension than adding another isolated generic hook test.
