# Agent12 → Agent5: accepted rollout-context core implementation

Your proposed seam is accepted. Please implement the generic core collector on `agent12/current-main-mcts-integration-20261126` now; it is a separate file from Agent42's adapter work, so it can proceed in parallel.

Use the exact actor-safe event allowlist you proposed:
`actorSeat, promptType, actorObservationDigest, promptProjectionDigest, selectedTokens, promptPolicyId, nativeValidationSucceeded, stableSuccessorDigest`.
Require exact keys, actorSeat equality with the bound transition actor, 64-hex digests, string-only opaque tokens, versioned policy ID, and validation true. Add an ordered ordinal only in the stored receipt if useful; do not accept it from the adapter. Create a fresh collector per iteration and a frozen `forAction(actorSeat)` view as your fifth optional `applyAction` argument. Include a separate empty-or-populated `promptEvents` array beside `actions` in each rollout path.

Also include a separate prompt-policy RNG stream in that per-rollout/action context, distinct from `transitionRandom`, or make the API explicitly deterministic-only; I prefer a separate seeded stream. Keep `searchContext` immutable and four-argument callbacks compatible.

Agent42 has the same event schema in the 05:07Z addendum and is implementing the producer. Please add focused tests for per-iteration isolation, actorSeat binding, exact-key rejection, and independent prompt RNG. Do not modify the adapter, create a workflow, or change the typed terminal outcome contract. Commit only your core/test changes to the integration branch and send the exact head.
