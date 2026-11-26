# Agent48 — K1 sampler / two-sided adapter integration review

**Date:** 2026-11-26  
**Scope:** read-only review of the new mainline K0/K1 sampler API and the current PR #78 two-sided adapter. No source patch, game dispatch, or CI dispatch was made.

## Executive finding

The mainline sampler contract tests are green, and the current PR #78 adapter contract suite is green, but the K1 sampler is not yet wired into the adapter. More importantly, the synthetic root-K1 test currently exercises a behavior that the production actor-observation function does not provide. A real pinned-Twinleaf K1 integration needs an explicit owner-K1 sidecar/provider, a typed conversion from the existing owner-search snapshot to the sampler's Prize-membership schema, and transition-local per-seat evidence passed through the adapter.

## Evidence reviewed

- Mainline sampler and belief-input implementation: `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs` and `agent5-hidden-partition-sampler.cjs`.
- Existing owner K1 custody/invalidation implementation: `simulation/twinleaf/owner-k1-prize-knowledge.cjs`.
- Production actor observation: `simulation/twinleaf/actor-observation-contract.cjs`.
- Current PR #78 adapter: `simulation/twinleaf/2026-11/agent12-twinleaf-two-sided-search.cjs`.
- Synthetic root-K1 regression: `tests/2026-11/agent5-twinleaf-belief-search.test.cjs` (lines 524–655).
- Mainline sampler exact-head run **45820094251** passed on `d0f594859b073770a03ef6d054b0c23d36866d15`.
- PR #78 exact-head native-search-only run **45812454376** passed on `29431c2b45b84a49b1a53d2a5879082f30c5ac10`.
- These are contract/synthetic-State receipts, not a pinned-Twinleaf K1 game or matchup.

## Findings and required corrections

### 1. Root K1 initialization is not proven against the production actor-observation contract

The sampler's unsampled-root `knowledgeBySeat` path calls `deps.actorObservation(state, seat, {ownerK1Snapshot:null})`, then calls `rootKnowledgeBySeat({rootSeat, observation})` without passing State. Later, `sampleDeterminization` requires `observation.ownerK1` to equal the root ledger's `ownerK1Snapshot`.

The production `actorObservation()` in `actor-observation-contract.cjs` sets `ownK1 = options.ownerK1Snapshot ?? null`; it does not derive K1 from native State or a hidden Prize/deck read. The sampler's unsampled-root `knowledgeBySeat` path passes a null override when constructing the public observation supplied to `rootKnowledgeBySeat`. That callback can still return K1 from a per-run sidecar closure without receiving raw State. Importantly, PR #78's `buildBaseActorView()` already takes the returned `ownerLedger.ownerK1Snapshot` and passes it into production `actorObservation()`; production observation can therefore carry the authenticated snapshot into search once the root ledger provider supplies it.

The current regression at `agent5-twinleaf-belief-search.test.cjs:524–655` instead supplies a custom actorObservation that reads `currentState.ownerK1BySeat[seat]`. That is a synthetic fixture property, not part of the production actor-observation contract or pinned Twinleaf State. It does not exercise the production adapter path in which a sidecar-backed `rootKnowledgeBySeat` callback returns the ledger and `buildBaseActorView()` passes its snapshot to production `actorObservation()`.

**Required:** implement/test `rootKnowledgeBySeat` as an explicit per-run owner-K1 sidecar lookup keyed by the physical owner seat and bound to the current trial/deck identity. Use the public observation's turn to enforce freshness; do not pass raw State to the provider. Confirm that the adapter's existing `buildBaseActorView()` path carries the returned snapshot into production `actorObservation()`. The existing `captureOwnerK1()` can establish a snapshot only while the real owner-deck `ChooseCardsPrompt` is pending; preserve that result in the sidecar and advance/invalidate it with `advanceOwnerK1()`. Test this provider path with production `actorObservation()` and a pinned-Store owner-search capture; do not rely on a synthetic `state.ownerK1BySeat` property.

### 2. Existing owner-K1 and sampler Prize-snapshot schemas are not interchangeable

The existing `captureOwnerK1()` result in `owner-k1-prize-knowledge.cjs` uses:
- `knownPrintings` for the remaining **deck** multiset;
- `knownPrized` for the inferred **Prize** multiset;
- `prizeInferenceCertified` to say whether that Prize inference is certified;
- `exactMembershipKnown` / `deckMembershipStale` for deck-membership freshness.

By contrast, `normalizeKnowledge()` in `agent5-twinleaf-belief-input.cjs` interprets `exactPrizeSnapshot.knownPrintings` as the exact **Prize** multiset and compares it directly with `knowledge.knownPrizePrintings`.

Passing a raw `captureOwnerK1()` object as `ownerK1Snapshot` would therefore label deck membership as Prize membership. Also, `captureOwnerK1()` sets `exactMembershipKnown:true` even when `prizeInferenceCertified:false`; that flag cannot be reused as the sampler's exact-Prize flag.

**Required:** add an explicit typed projection/adapter. For example, the sampler's exact-Prize snapshot should be derived as:
- `epoch: captured.epoch`;
- `exactMembershipKnown: captured.prizeInferenceCertified === true`;
- `knownPrintings: captured.prizeInferenceCertified ? captured.knownPrized : null`;
- `invalidationReason: captured.invalidationReason ?? null`.

The corresponding `knowledge.knownPrizePrintings` must equal that Prize multiset. If `prizeInferenceCertified` is false or the deck/Prize state has invalidated the inference, downgrade to PARTIAL/K0 and do not assert exact membership. Validate `captured.ownerSeat` against the physical seat before projection.

### 3. PR #78 currently drops the new transition-local K1 evidence API

The new sampler exposes `refreshMetadata(fromState, toState, transitionEvidenceBySeat)`, but the current PR #78 adapter's `transferMetadata(fromState, toState)` calls `refreshMetadata(fromState, toState)` with no evidence. The native-action, automatic-prompt, and player-prompt paths all use that two-argument call.

The player-prompt path already has the relevant pre-dispatch context: `actorSeat`, `actorView`, `resolution.actorObservation`, `resolution.promptProjection`, and selected tokens. It currently reduces the buffered receipt to opaque tokens and never supplies a per-seat evidence delta to K1 refresh.

**Required:** pass a two-entry `transitionEvidenceBySeat` array into each real transition refresh. Partition private evidence by the prompt's physical owner `actorSeat`, not by `transitionActorSeat`; include public transition evidence in both seat entries. Capture owner-deck-search evidence while the genuine prompt is still pending, before the receipt is reduced to opaque tokens. Include appropriate invalidation evidence for deck/Prize-changing native and automatic transitions. Add a pinned-Store regression where seat 0 initiates a transition but seat 1 owns the prompt: only seat 1 receives private prompt/search evidence, while both ledgers receive the public transition.

### 4. The new physical-seat decklist ID map is not yet consumed by the adapter

The sampler now exposes frozen `ownDecklistIdBySeat`. The current adapter's unsampled-root actor view still falls back to scalar `deps.ownDecklistSeat` / `deps.ownDecklistId`; it does not consult `deps.redeterminize.ownDecklistIdBySeat[seat]`.

**Required:** use the physical-seat map for an unsampled root, validate both entries, and retain the physical-seat mapping in the search audit/experiment manifest. Do not collapse the two fixed Aichi lists into one candidate scalar when the root seat can be either physical seat.

## Acceptance sequence

1. Add the explicit owner-K1 sidecar/provider and typed Prize-snapshot projection; replace the synthetic `ownerK1BySeat` test with a pinned-Twinleaf Store + authenticated sidecar test.
2. Wire `ownDecklistIdBySeat` and `transitionEvidenceBySeat` through the adapter, with prompt-owner versus transition-actor negative/positive tests.
3. Run the existing bounded `native_search_only=true` lane on the exact reconciled PR #78 head; retain the pinned Twinleaf gitlink SHA.
4. Only after real pinned-State K1 continuity is demonstrated should the integration be described as K1-capable. This review does not authorize a fixture/game or establish policy competence, matchup strength, a deck nomination, or a win rate.
