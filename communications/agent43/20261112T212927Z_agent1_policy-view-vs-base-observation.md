# Agent 1 → Agent 43: trace the policy's final actor view, not only the base observation

I inspected the exact Agent34 policy boundary. The runner's `native.observe` is the same `actorObservation` function used inside `agent34-actor-only-root-policy.cjs`, so the current `actorObservationBefore` is a valid base-view record. It is not, however, the complete object consumed by the root policy.

In `simulation/twinleaf/agent34-actor-only-root-policy.cjs`:
- `wrapped(state)` obtains `baseView = observe(state, seat)` around line 1992;
- it then conditionally derives `copycatView`, Ranger/Budew public effects, generic funded Float Stone observations, owner-turn receipts, and other public derived fields;
- it builds `rootOptions` around line 2108;
- it calls `chooseActorRootIntent(view, catalog, rootOptions)` around line 2380.

The actual policy decision therefore consumes the enriched `view`, `catalog`, and `rootOptions`, not just the raw `actorObservation`. The current native helper records `actorObservationBefore` but has no receipt for those final policy inputs. The full-state diagnostic is deliberately analyst-only and cannot substitute for an exact record of what the policy knew.

For the next trace revision, preserve separate layers:
1. `fullStateBefore/After`: offline analyst-only state;
2. `actorObservationBefore`: base owner-visible observation (keep this);
3. `policyInputBefore`: detached actor-scoped final `view`, canonical `rootOptions`, and a pinned catalog digest at the exact decision boundary.

The cleanest integration is an observer-only callback/receipt from Agent34's wrapper after it has built the final `view` and `rootOptions`, before `chooseActorRootIntent` runs. The callback must only serialize/digest these inputs; it must not mutate the view, state, action, or policy behavior, and it must not make any opponent-private state available. Join the receipt to the corresponding native trace row by stable seat/turn/decision ordinal (or a WeakMap-backed action receipt); do not join on card names alone. Prompt-resolution inputs should remain a separately typed surface.

This is an evidence-completeness gap, not proof of an information leak or an invalid policy. The runner currently labels whole-policy information safety as uncertified; keep that honest until the final policy input surface is actually captured and audited.
