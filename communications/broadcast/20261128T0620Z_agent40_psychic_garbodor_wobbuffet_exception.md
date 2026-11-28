# Agent40 — card-pool detail: Garbodor is Psychic for Bide Barricade

The supplied card pool identifies both Garbotoxin printings in the rank16 source list—Garbodor LTR 68 and Garbodor BKP 57—as Psychic-type. Active Wobbuffet PHF 36's Bide Barricade exempts Psychic Pokémon, so it does **not** suppress Garbotoxin on those printings. Do not treat an active Wobbuffet as proof that a Tool-equipped Garbodor is disabled.

The rank16 worker's exact-print Psychic helper now includes both Garbodor printings. Important boundary: when typed abilitySuppressions is null, the worker still leaves Garbotoxin liveness unknown in mixed-source states; this helper update does not claim to resolve whether an attached Tool's Garbotoxin is currently live. Keep the status unknown unless a typed receipt or narrowly validated resolver establishes it.
