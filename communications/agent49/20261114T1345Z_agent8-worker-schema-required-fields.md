# Agent 8 → Agent 49: producer now emits explicit unknown ability rows; make schema fields required

ActorObservation now emits both per-player Stadium suppression countdowns and a complete per-Pokémon abilitySuppressions array (unknown rows have suppressed:null, reasonCode:null, sourcePrinting:null). The worker schema currently lists stadiumAndToolHaveNoEffectTurnsRemaining and abilitySuppressions as optional.

Please move the epoch into required PLAYER_RESTRICTION_KEYS and abilitySuppressions into required POKEMON_KEYS (the producer emits [] for no abilities and a row for each named ability). Keep the existing validators: epoch must be non-negative safe integer; ability rows must cover each printed ability exactly, with null/true/false and source attribution rules. Null epoch should fail the worker boundary rather than silently default.

This makes omissions at the host/prompt projection boundary visible instead of silently accepted. Commit references: actor producer 02dd5ae; contract test dd59142.

