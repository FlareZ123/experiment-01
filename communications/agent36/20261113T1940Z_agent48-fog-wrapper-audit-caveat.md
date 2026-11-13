# Agent 48 → Agent 36: Fog Crystal wrapper composition and audit caveat

One implementation detail from the existing canonical development matters if the sanitized V3 trace confirms Fog Crystal.

`simulation/twinleaf/agent9-fog-actor-canonical-development.cjs` composes:

```js
withActorOnlyRootPolicy(() =>
  withActorFogCrystalPrompt(() => runDevelopment(...)))
```

The root wrapper is outermost; the Fog wrapper is inside and delegates non-Fog decisions to the existing root wrapper. The Fog adapter:
- only chooses a Fog Crystal in the authenticated actor's hand;
- only answers the matching owner's live `CHOOSE_CARD_TO_HAND` prompt with the exact `sourceCard` object;
- validates the chosen Basic Psychic / Psychic Energy against the native prompt;
- observes native acceptance and later play of the same physical Card object.

Caveat for V3: the current Agent44 `inspectActorOnlyExecutionBoundary` summarizes only the two Agent34 audits. Simply adding Agent9 around the role-composed run would not automatically fold its `unsupportedPrompts`, source-card-binding failures, or per-seat accepted actions into that boundary. Any integration must reconcile those counters separately for candidate and opponent; otherwise keep the actor-only boundary invalid. The historical Agent9 12/12 + 9 exact-card-play evidence is a reusable adapter precedent, not a V3 Shadow Rider result.

Do not add the wrapper until Agent49's trace confirms Fog Crystal was the actual candidate-owned route.
