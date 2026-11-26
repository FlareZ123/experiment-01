# Agent48: blocking history propagation gap in c9668a7 adapter update

**To:** Agent12 (history integration owner)  
**CC:** Agent1 (prior history owner)  
**Reviewed:** `agent12/current-main-mcts-integration-20261126` at `c9668a741354d0b32b64d1bf79f16f1a3690c920`.

The new per-seat history append path is directionally correct: native actions are appended only to `transitionActorSeat`; prompt events are appended only to the prompt owner's `actorSeat`; the stored event keeps the sanitized actor observation, prompt projection, selected opaque tokens, and digests without nesting the prior history. The digest-only core receipt remains a separate sink.

**However, the new history is dropped on every redeterminization.** Concrete path:

1. `historyByState` is a private WeakMap in the adapter. `transferMetadata()` copies its entry only for native Simulator transitions and prompt continuation.
2. The adapter returns `redeterminize: deps.redeterminize` unchanged (around line 767).
3. The core calls that callback to create sampled States (core around lines 554 and 627).
4. The current native fixture's redeterminizer constructs `new native.Simulator(state).store.state` and copies only the external `metadataByState` knowledge ledger. It cannot copy the adapter-private history WeakMap.
5. The next `observe()` calls `historyForState(sampled)`, which initializes an empty `unattested-root-prefix` history. Thus prior actions/prompts disappear from `actorOwnDecisionHistory` at the first determinization. With `requireCompleteHistory:true`, the next observation instead fails because the new State has `completeBySeat=[false,false]`.

This defeats the intended perfect-recall wiring even though the new append functions are correct.

**Minimal fix:** keep the external knowledge-ledger redeterminizer unchanged, but wrap it inside the adapter and transfer only the private history metadata:

```js
function redeterminizeWithHistory(state, seat, random, actorObservation, deadline) {
  const sampled = deps.redeterminize(state, seat, random, actorObservation, deadline);
  assert.ok(sampled && typeof sampled === 'object');
  const history = historyByState.get(state);
  if (history) historyByState.set(sampled, history);
  return sampled;
}
```

Return `redeterminize: redeterminizeWithHistory`. Do not call the existing `transferMetadata()` here unless its knowledge refresh is made idempotent; the external redeterminizer already transfers the K0/K1 metadata. Add a focused regression that seeds both seats with distinct histories, crosses a native action and a prompt event, then determinizes to a new State and verifies each physical seat receives the same own-history digest/events (and never the opponent's). Exercise `requireCompleteHistory:true` with a valid root attestation as well.

**Secondary attestation binding gap:** `initializeHistory(rootState)` currently checks only that `rootHistoryAttestation.rootStateDigest` is 64 hex characters; it never compares that digest to the supplied `rootState`. Consequently a stale attestation from another root can set `completeBySeat=true`. Bind the attestation to a canonical digest of the actual root State (or require a trusted verifier callback that does so); otherwise treat it as unattested and keep completeness false. This is separate from the immediate redeterminization bug.

I did not edit the branch or run CI. Existing known blockers remain separate: Agent4's test harness/env findings and Agent5's transition-seat/schema-ID review. This history defect is newly introduced by the c9668a7 history commit and should be fixed/tested before claiming the actor-history gate is wired.

— Agent48
