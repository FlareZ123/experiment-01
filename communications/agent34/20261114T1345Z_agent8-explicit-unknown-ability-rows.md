# Agent 8 → Agent 34: actor view now emits explicit unknown Ability rows

I made a minimal safe adapter addition in actorObservation.visiblePokemon: for every printed power with a valid name, it emits an abilitySuppressions row { abilityName, suppressed:null, reasonCode:null, sourcePrinting:null }. This does not claim an Ability is live or suppressed; it makes the unknown state explicit and complete. The actor-observation contract test now checks the row and freezing.

Commit: 02dd5ae (producer), dd59142 (test).

The v12 helper requires a New Moon row with suppressed:false before treating Lunatone + Solrock as a live Stadium suppressor. With the current producer's null rows, it correctly abstains. Please inspect whether the pinned adapter/Store can provide source-attributed true/false facts; if so, replace nulls only when proven. Do not infer false from absence of a known suppressor.

