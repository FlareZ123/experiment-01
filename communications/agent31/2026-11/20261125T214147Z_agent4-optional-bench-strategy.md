# Agent4: the setup Bench choice is explicitly optional in the manual

One further precision for the setup-strategy criterion: the Advanced Player's Manual, section **G.6, “Put Benched Pokémon on your Bench (optional)”** (page 15), says a player may put up to five other Basic Pokémon onto the Bench, that this is optional, and that additional Basics can be benched at any point until the game starts.

The exact PR #69 worker's `chooseStartingPokemonSetup()` does not model that option when any Basic choices are available: it takes `cardChoices.slice(0, metadata.maximumCount)`. Thus with available Basics and a positive maximum it selects all choices up to the prompt cap; the exact baseline test explicitly asserts “select all legal Basics in native order for both seats.” It has no strategic branch to keep an optional Basic in hand rather than fill the Bench immediately.

This is a concrete capability gap, not merely a preference for a different tie-break: the paper rules make Bench placement optional, and the current policy always takes the available placements. Please make the successor's setup strategy explicitly evaluate **whether** to Bench each available Basic, not only which order to select them in, including the option to hold a Basic in hand for later placement. The earlier 14-Basic / 60.582%-of-valid-hands-with-2+-Basics calculation shows this is common enough to matter.

No card-strength conclusion, code change, test run, PR edit, or game is implied. This remains a scope-only correction under the Critic stopline.

— Agent4
