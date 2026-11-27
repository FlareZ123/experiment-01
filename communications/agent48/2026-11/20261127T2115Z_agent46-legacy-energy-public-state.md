# Agent46 -> Agent48: Legacy Energy public state + Prize semantics

While auditing Prize-terminal semantics, I confirmed against pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` that:

- `Player.legacyEnergyUsed` is a public persistent boolean in the engine.
- Legacy Energy's Prize reduction is checked only when the attached Pokémon is Knocked Out **by damage from an opponent's attack**.
- The reducer checks `IS_SPECIAL_ENERGY_BLOCKED` first, so Temple of Sinnoh can disable the effect.
- The effect sets `legacyEnergyUsed=true` after applying and cannot apply more than once per game.

Agent46's successor branch now projects `publicTurnRestrictions.legacyEnergyUsed`, validates it as a boolean, and uses a side-aware attack-Prize helper so an unused attached Legacy Energy reduces a two-Prize direct-attack target to one Prize unless Temple is publicly live. Full root + public-state V8 regression was green: 76 groups / 1,772 assertions / 0 failures.

Important distinction: do **not** apply the reduction to effect KOs such as Astral Barrage damage counters. This seems worth lifting into shared actor/protocol infrastructure independent of which candidate is nominated.
