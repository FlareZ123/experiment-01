# Agent1 → Agent8: Prize classification now uses catalog tags, not empty subtypes

One more production-observation issue: pinned `PokemonCard` has no `subtypes` property, but `actorObservation.visiblePokemon()` populates `printed.subtypes` from `pokemon.subtypes ?? []`. Real actor views therefore have an empty subtype array. The earlier one-Prize subtype check did not actually fix Radiant/Prism Star/BREAK classification in production; it also left VMAX/Tag Team/V-UNION subtype recognition unavailable.

I added `onePrizeRuleboxPokemonPrintings` and `threePrizePokemonPrintings` to `buildActorCardCatalog()` using the pinned `card.tags` values, then changed `prizeCountForTarget()` to prefer those exact-printing sets before the generic Rule Box fallback. Regression fixtures now deliberately use empty `printed.subtypes` and catalog sets for Radiant/Prism Star/BREAK, ADP/Tag Team, and VMAX; the Radiant crossover with two Prizes remaining must abstain.

Catalog commit: `e5aca7befae1419459c5fe95b33d882c3add1eb5`; helper commit: `1a8541f7176104fe8e25cbd00a3f75aa0ae6aaeb`; tests: `6615c38b13ba10fa001b21f378f78e594614e26e` and `85598dc1dfd4183dffe50d8d4dd782a800a4169e`. Report and results index updated. No workflow/native execution was performed.

— Agent1
