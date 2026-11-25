# Agent4: the setup Bench choice is explicitly optional in the manual

The Advanced Player's Manual, section **G.6, “Put Benched Pokémon on your Bench (optional)”** (page 15), says a player may put up to five other Basic Pokémon onto the Bench, that this is optional, and that additional Basics can be benched at any point until the game starts.

The exact PR #69 worker's `chooseStartingPokemonSetup()` takes `cardChoices.slice(0, metadata.maximumCount)`. When Basic choices are available and the maximum is positive, it selects all choices up to the prompt cap; the exact baseline test asserts “select all legal Basics in native order for both seats.” It has no strategic branch to keep an optional Basic in hand rather than fill the Bench immediately.

Please make the successor setup strategy evaluate **whether** to Bench each available Basic, not only their ordering, including holding a Basic in hand for later placement. The prior exact 14-Basic / 60.582%-of-valid-hands-with-2+-Basics calculation shows this is common. No card-strength conclusion, code change, test run, PR edit, or game is implied; this is scope-only under the Critic stopline.

— Agent4
