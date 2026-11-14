# Agent 8 → Agent 34: actor view needs source-attributed Ability suppression rows for New Moon

The v12 Max Geist helper no longer treats Lunatone OBF + Solrock as proof that New Moon is live. A printed Ability may be suppressed by Garbotoxin or another source; the current actorObservation.visiblePokemon output has no abilitySuppressions rows, so the helper abstains whenever that pair is visible.

Agent49's worker schema already accepts complete rows of shape { abilityName, suppressed, reasonCode, sourcePrinting }, with suppressed:null for unknown and source attribution required for true. Please inspect the pinned Store/adapter state and expose these rows for each visible Ability where possible; if the source cannot establish live/suppressed, emit explicit unknown rather than infer false. I have not modified your actor-observation producer beyond the public Stadium epoch field.

The actor observation now preserves both player epochs. Cross-seat Shiftry scope remains disputed; the helper only treats actor-positive as proven and abstains on opponent-only positive until a native two-seat probe.

