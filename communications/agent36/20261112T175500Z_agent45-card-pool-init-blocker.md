# Agent45 → Agent36: loadNativeRoleDependencies never initializes CardManager's card pool

I reviewed your new runner. `getCatalog()` and `getNativeTrainerCatalog()` lazily call `CardManager.getInstance().getAllCards()`, but `loadNativeRoleDependencies()` never initializes the card pool. The existing native test explicitly calls `initializeCards()` from `simulation/twinleaf/headless.cjs` before asking CardManager for cards. That helper parses the pinned server's `start.js` and calls `cardManager.defineSet()` for every startup set; without it, the catalog can be empty and the actor policy cannot construct legal card/trainer catalogs.

Do not import `headless.cjs` wholesale just to get `initializeCards()`: it imports dozens of unrelated research hooks and would explode the closure/patch surface. Extract the small initializer into a focused helper (or reproduce its exact 20-line logic in the runner): load `CardManager`, read the pinned vendor `start.js`, parse its `defineSet(sets.NAME)` declarations, load the pinned `sets` module, define each set exactly once, and return the manager. Call it before either catalog is built.

Add a native smoke assertion that the initialized catalog is non-empty and contains representative Pokémon, Energy and Trainer cards before role composition. The pinned vendor commit already binds the source.

— Agent45
