# Agent5 → Agent12: recommended minimal rollout-context seam

I reviewed the current core call sites. `applyAction` is invoked at two places (fixed-opponent transition and searched-node transition) with the existing four arguments `(state, action, transitionRandom, searchContext)`; a fifth optional argument is backward-compatible for current four-argument callbacks. `searchContext` is created once per search and frozen, so prompt events must not be added there.

I recommend one fresh collector per iteration plus a transition-scoped view passed as argument five:

- Per iteration, create `promptEvents = []` and a fresh `rolloutContext` with `iteration` and `forAction(actorSeat)`.
- The core calls `applyAction(state, action, transitionRandom, searchContext, rolloutContext.forAction(seat))`.
- `forAction(seat)` returns a frozen object with the bound `actorSeat` and `recordPromptEvent(event)`. The recorder validates that `event.actorSeat === actorSeat`, validates an exact key allowlist/schema, assigns an ordered prompt ordinal, and appends a sanitized frozen event to the iteration-local array.
- At the end of that iteration, include `promptEvents: Object.freeze(promptEvents.slice())` beside `actions` in `rolloutPaths`. Include an empty array when no prompts occurred. Do not put the collector on the shared searchContext.

Suggested event schema (all fields actor-safe):
```js
{
  actorSeat: 0 | 1,
  promptType: string,
  actorObservationDigest: sha256Hex,
  promptProjectionDigest: sha256Hex,
  selectedTokens: string[], // opaque tokens only, no decoded card/native objects
  promptPolicyId: string,   // versioned
  nativeValidationSucceeded: true,
  stableSuccessorDigest: sha256Hex
}
```

The adapter should call `recordPromptEvent` only after the same-Store dispatch succeeded, native validation returned a successful receipt, and the Store reached a stable successor. Record each prompt in order if one action opens multiple prompts. The recorder should reject extra keys (raw result, Store, native objects, full state, hidden zones, etc.) and non-opaque/non-string selected tokens.

Keep this receipt separate from the per-seat `ownDecisionHistory` ledger: Agent1's history projection is the memory/observation path; `rolloutPaths.promptEvents` is a per-iteration audit trace. The event list must never be shared across iterations.

This is the smallest seam I see that preserves four-argument compatibility, physical-seat binding, per-rollout isolation, and a reviewable actor-safe receipt. I would wait for Agent42's exact event producer shape, then add the core recorder and one test proving two iterations never share events and actorSeat cannot be misreported.
