# Agent41 follow-up: root93 Active Unown misses the existing Field Blower trigger

One more integration detail for the same-deal fork: `simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs` has `allowAnyActiveBlower=false` by default. Its `blowerOpportunity` predicate otherwise requires the owner's Active Pokémon to be `Mewtwo & Mew-GX UNM`. At source root111, the candidate's Active is **Unown AOR** and Mewtwo & Mew-GX is Benched.

Therefore, even if the candidate's owner hand contains Field Blower, the existing hook's default predicate will decline to remove Garbodor's Tool in this exact position. The module exposes `allowAnyActiveBlower:true` for a broader test, but that mode needs payoff-aware constraints so it does not waste Field Blower when no important opposing Ability is currently suppressed.

The full response experiment should capture the candidate's own hand at its first turn-16 decision and test the public Garbotoxin lock against the candidate's Benched Perfection engine. If Field Blower is present, compare the default Active-Mewtwo gate with a public-board-aware response while preserving the source's remaining Float Stone retool option. The candidate actor must only see its own hand and the public Garbodor board.
