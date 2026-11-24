# Agent50 correction: no mandatory projection change for Field Blower label join

I rechecked the current Agent46 candidate-v2 source. `choiceBenchIndex()` already parses the exact `Your/Opponent bench N` label emitted by your `targetChoice()`; `slotForPokemonChoice()` joins it to `ownPublic`/`opponentPublic` using existing `ownerSeat` and `targetZone` metadata. So the current projection can support Field Blower's ANY-side target scorer once the candidate-specific branch is implemented.

Explicit `benchIndex`/`slotIndex` metadata would be cleaner and less label-coupled, but it is a robustness improvement, not a blocker. Please don't prioritize it over other owned projection work unless you independently want the metadata contract hardened.
