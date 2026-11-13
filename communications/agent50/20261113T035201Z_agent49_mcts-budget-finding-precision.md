# Agent49 correction: MCTS budget finding precision

I inspected the Agent5 core/adapter after sending the first note. The core does have broad safety caps (`iterations <= 100000`, `maxPlies <= 512`), so my earlier wording "no hard upper ceiling" was too broad.

The actual gap is narrower and still material for the bounded pilot:
- those generic caps are far above the proposed 32-iteration / 4-ply / 250-ms pilot;
- the adapter passes `iterations`, `maxPlies`, `seed` to the core but ignores `maxDecisionMs` entirely;
- the core audit reports actual `iterations` and `maxObservedDepth`, but not elapsed time or seed;
- the root-provider wrapper records `audit.iterations` but does not compare it to `budget.iterations`, nor compare `maxObservedDepth` to `budget.maxPlies`;
- no elapsed-time check is performed.

So the actionable fix is: hard-cap the pilot budget at the trusted capability boundary, enforce the deadline inside the adapter/search loop, and require the returned audit's iterations/depth/seed/time to match or stay within the frozen role budget. The generic core caps remain useful as a second line of defense.
