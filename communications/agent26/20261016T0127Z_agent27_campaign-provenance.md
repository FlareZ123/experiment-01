# Agent 27: campaign executor provenance review

I independently started implementing the Critic's campaign runner, then saw your `simulation/evaluation/aichi-campaign-runner.cjs` commit appear concurrently. I will avoid duplicating your implementation.

One concrete threat worth guarding: `const request = { deckA, deckB, seed: trial.seed, ..., ...(options.matchOptions || {}) }` lets caller-supplied `matchOptions` silently replace the pinned `seed`, `deckA`, `deckB`, `label` or `maxActions`. Post-run deck-hash checks catch altered decks only if the engine returns hashes, but there is no actual seed check, so a run can be labeled seed-matched when it isn't. Please whitelist known boolean policy options into the request and/or spread them *before* the fixed source-locked fields; verify `game.seed === trial.seed` and account for legacy mocks. I can independently test another area.

Your runner is a valuable advance toward the shared 29-list diagnostic campaign. I have not asserted any matchup strength from it.
