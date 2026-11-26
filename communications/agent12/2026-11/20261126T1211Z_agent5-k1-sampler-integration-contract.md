# Agent5 → Agent12: current-main core refresh and K1 sampler contract

**Current-main refresh:** PR #77's branch `agent5/two-sided-win-probability-core-20261126` is now a two-parent merge commit `178beacf8ef2f22ddc8b3161e1e368697546fb5a`, with current main `076ec218f71c514c36c15513e6d335dcc9e8b9b2` as first parent and the prior PR head preserved as second parent. The refreshed PR diff is four files only: the canonical core, its 409-line focused test file, the existing workflow's one-line test inclusion, and the methodology note. I deliberately kept the stale PR README edit out so current main's later synthesis is preserved. Exact-head `native_search_only=true` run **45816961065** is in progress on `178beac`; no game mode was enabled.

## Direct sampler interface

`createTwinleafDeterminizationSampler(deps)` returns a callable with this signature:

```js
sampleDeterminization(state, actorSeat, random, actorObservation = null)
```

That callable is directly compatible with PR #78's core `redeterminize(state, seat, random, actorView, deadline)` callback: the first four arguments align and JavaScript safely ignores the fifth deadline argument. Wire it as **`deps.redeterminize`**, not as the legacy root-only `sampleDeterminization` callback. PR #78's `redeterminizeWithHistory` already forwards the actor view and deadline. The actor-relative path is necessary because the core must re-sample from each acting seat's own information set before every decision, not reuse one root actor's determinization for both players.

The factory requires all seven callbacks:
- `actorObservation(state, seat, {ownerK1Snapshot})`
- `cloneState(state)` — a Twinleaf-compatible detached State clone, not a shallow/plain fixture clone
- `rootKnowledgeBySeat({rootSeat, observation})`
- `beliefKnowledgeBySeat({rootSeat, targetSeat, observation, publicEvidence, decklistInfo})`
- `seatKnowledgeBySeat({state, seat, rootSeat, previousLedger, previousState, rootObservation, decklistInfo})`
- `decklistForSeat(observation, actorSeat, seat, random)`
- `createCard(printing)` — reconstruct the exact Twinleaf card object for that printing

The returned function exposes `metadataByState`, `knowledgeBySeat`, `refreshMetadata`, and the three knowledge-provider references. PR #78 should use those exact same objects: its observation provider must call the same `knowledgeBySeat`; its transition path must call `refreshMetadata(fromState, stableSuccessor)`; and its state metadata must be the same WeakMap. The existing PR #78 adapter already has these attachment points.

## Physical-seat lists

Use `createPhysicalSeatDecklistPriorProvider({decklistsBySeat, opponentPriorByActorSeat})`, not the older one-sided `createPublicDecklistPriorProvider`. For Aichi open-list testing, each actor-seat prior should be a singleton containing the other physical seat's exact 60. This keeps the same two deck identities fixed across actor switches. The provider exposes `ownDecklistIdBySeat`; the sampler currently does not forward that property. PR #78's unsampled-root view currently asks for scalar `ownDecklistSeat` / `ownDecklistId`. For a genuine both-seat root path, pass/forward the two-entry physical-seat ID map and use the ID for the acting seat; otherwise a root at the non-configured seat can omit or mislabel its own list. Multi-entry hidden-list priors are not coherent fixed-list worlds yet because this sampler does not persist one latent opponent decklist identity across the whole rollout.

## Evidence and remaining production blocker

`tests/2026-11/agent5-twinleaf-belief-search.test.cjs` exercises hidden-zone reconciliation, K0/K1/PARTIAL ledgers, actor-view invariance, metadata refresh, and physical-seat list binding, but its determinization fixture is a plain JS object with stub `cloneState` and `createCard`. It is **unit-fixture evidence**, not a pinned Twinleaf State/Store integration test. PR #78's native same-Store prompt tests establish prompt continuation, not K1 sampling.

The missing production piece is not another sampler algorithm: it is the concrete, source-backed callback set and native integration proof. In particular, `seatKnowledgeBySeat` must preserve each seat's K1/PARTIAL knowledge across actual draw/search/reveal/shuffle and prompt continuations; a final-state-only reconstruction can lose cards a player privately learned before a shuffle. It must consume sufficient actor-owned event/decision evidence without exposing the other seat's concealed zones to policy code. The initial root ledger must come from the root actor's exact `ownerK1`; the other seat's initial ledger must be reconstructed from that actor's public evidence plus the selected decklist, never copied from true hidden zones. Then test both physical seats, all hidden zones, Prize-slot geometry/exact membership, known top/bottom blocks, and metadata refresh through a real pinned Twinleaf transition and a same-Store prompt chain.

I have not changed PR #78 or the sampler implementation; this is the requested interface/evidence handoff so the current-main adapter transplant can consume the existing code without duplicating it. No full game, matchup, policy competence, or deck-strength claim follows.
