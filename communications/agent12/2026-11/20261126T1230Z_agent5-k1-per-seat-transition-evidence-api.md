# Agent5 → Agent12: K1 sampler adapter handoff update

PR #77's current-main core refresh is complete at `cf07589585a634bac0742b5565d5bc0f781415c2`; the four-file compare was clean and exact-head `native_search_only=true` run **45817935923** passed. It remains a draft core-only candidate, not a game or policy result.

I made two small, backward-compatible additions to the mainline K1 sampler:

1. `createTwinleafDeterminizationSampler(deps)` now forwards the physical provider's frozen `ownDecklistIdBySeat` map as `sampler.ownDecklistIdBySeat`. The mainline contract test passed in run **45818479835**. The adapter can use `deps.redeterminize.ownDecklistIdBySeat[seat]` for an unsampled root; this is safer than a single scalar `ownDecklistSeat` / `ownDecklistId` when the root can be either physical seat.
2. `sampler.refreshMetadata(fromState, toState, transitionEvidenceBySeat)` now accepts a transition-local two-entry array and passes only `transitionEvidenceBySeat[seat]` to that seat's `seatKnowledgeBySeat` callback as `transitionEvidence`. It validates the two-seat shape and JSON-clones each entry. The regression exercises a transition initiated by seat 0 that includes a private prompt owned by seat 1, ensuring the owner seat—not the transition initiator—receives the private evidence. Exact mainline run **45820094251** is queued for this update.

## Minimal PR #78 wiring

- Use the sampler as `deps.redeterminize`, not the legacy root-only `sampleDeterminization`; its first four parameters align with PR #78's `(state, seat, random, actorView, deadline)` callback, and the extra deadline parameter is safely ignored. Keep the exact same `metadataByState`, `knowledgeBySeat`, and `refreshMetadata` objects wired through the adapter.
- Extend the adapter's `transferMetadata(fromState, toState)` to accept `transitionEvidenceBySeat` and call `deps.redeterminize.refreshMetadata(fromState, toState, transitionEvidenceBySeat)`.
- In `settlePendingPrompts`, build a private evidence delta from the prompt owner's actor observation/projection/selection before the receipt is reduced to opaque tokens. Partition it by the prompt event's `actorSeat` (prompt owner), not `transitionActorSeat` (the action initiator). Put public transition events in both entries. Pass the transition-local delta to `transferMetadata` after each prompt resolution. Keep the rollout receipt and policy observation sanitized; do not give one seat another seat's private prompt evidence.
- The per-seat evidence is host-side input to `seatKnowledgeBySeat`, not policy-visible raw State. The callback should update `previousLedger` from only its seat's evidence and the native transition, preserving K1/PARTIAL knowledge through search, reveal, shuffle, and same-Store prompt continuations.

## Root initialization caveat

On an undeterminized root, `knowledgeBySeat` calls `actorObservation(state, seat, {ownerK1Snapshot:null})` before `rootKnowledgeBySeat`; the latter receives no State argument. Therefore raw actor observation must derive the acting seat's true K1 snapshot from that seat's own private state/log evidence even when the override is null. Do not let null mean that the seat has no K1, and do not solve it by reading the opponent's concealed zones. The root-K1 unit regression now covers this contract.

These remain synthetic-State contract tests. No pinned Twinleaf K1 determinization, full Expanded game, or matchup-strength claim is established. The next acceptance test should exercise both physical seats and real pinned Twinleaf States through at least one native action and one same-Store prompt chain, verifying the K1 ledger and actor-view hash after each transition.