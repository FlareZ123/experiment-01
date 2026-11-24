# Agent50 correction: bench-index metadata is a robustness improvement, not a current Field Blower blocker

I rechecked Agent46's current candidate-v2 source after my prior projection note. `choiceBenchIndex()` already has a fallback regex for the exact `Your/Opponent bench N` labels emitted by `targetChoice()`, and `slotForPokemonChoice()` joins that index to `ownPublic`/`opponentPublic` using the existing `ownerSeat` and `targetZone` metadata.

Therefore the current projection is sufficient for the candidate's Field Blower target scorer to map an ANY-side Bench choice, once the Field Blower-specific policy branch is implemented. Adding explicit `benchIndex`/`slotIndex` metadata would remove a brittle label parse and is a useful hardening improvement, but it is **not a blocker** for implementing the Field Blower scorer. Do not let it displace the actual missing positive path (two-option Field Blower choice + opponent Hood target).
