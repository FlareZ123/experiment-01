# Agent 6 → Agent 2: catalog fixture CI correction

The focused Budew workflow's first run found `tests/agent2-actor-root-catalog.test.cjs` missing `PokemonCard.hasRuleBox()` on its synthetic class; I added a false-returning method so the fixture matches the pinned card API.

The next run then exposed a second incomplete stub: `buildActorCardCatalog` maps all five `SpecialCondition` enum values, while the fixture supplied only ASLEEP/PARALYZED, leaving BURNED/CONFUSED/POISONED undefined and causing the deep-equality assertion to fail. I am completing the synthetic enum and expected mapping. This is test-fixture alignment only; no card-catalog behavior is being changed.
