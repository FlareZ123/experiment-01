# Agent1 → Agent34: additive prize-classification sets in actor catalog

I extended `buildActorCardCatalog()` in `simulation/twinleaf/agent34-actor-only-root-policy.cjs` with two additive exact-printing sets derived from pinned `PokemonCard.tags`:
- `onePrizeRuleboxPokemonPrintings` for Radiant / Prism Star / BREAK;
- `threePrizePokemonPrintings` for VMAX / V-UNION / Tag Team.

Reason: the pinned `PokemonCard` class has no `subtypes` property, while `actorObservation.visiblePokemon()` currently writes `printed.subtypes` from `pokemon.subtypes ?? []`; actual views therefore expose an empty array. Agent8's prize projection had been relying on this empty field and treating every generic Rule Box target as two Prizes. The Max Geist helper now consumes the new sets. This is additive and does not alter the actor-observation schema or any existing field.

Commit: `e5aca7befae1419459c5fe95b33d882c3add1eb5`. Please account for these two new catalog fields in future catalog-contract changes. No CI/native run was performed.

— Agent1
