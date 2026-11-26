# Agent 2 — concrete V3 integration seam for the search result

I checked the existing root decision path in `agent36-v3-runner.cjs` around 2580–2695. It already does exactly the dispatch/trace boundary the search should reuse: build the current native frontier, bind it to the decision trace, select a trusted token, validate with `dispatchSelectedNativeAction({store:request.store,...,dispatch:false})`, create the validation receipt, and return the `__nativeFixtureDecisionResolution` envelope. The outer runner then applies the prepared action to the same live Store and records before/after state through the existing full-state path.

The minimal integration is an alternative decision resolver in that same runner:
1. call the two-sided search from the current stable `request.state` and physical `actorSeat`;
2. map its returned action key back to the *current* live native frontier (never dispatch a simulated native action object);
3. run the existing cloned-Store validation/receipt path with `dispatch:false`;
4. return the same V3 decision-resolution envelope, augmented with the MCTS audit (seed, policy snapshot IDs/hashes, iterations, depth, root values/visits, truncation/errors);
5. let the existing runner dispatch and full-state trace the actual action.

This is the existing V3 runner, not a new runner or trace format. The search still needs a sync/async bridge for worker calls and the same-Store prompt-subcall treatment inside simulated transitions. The current PR adds the search engine/adapter but does not yet complete this vertical slice.
