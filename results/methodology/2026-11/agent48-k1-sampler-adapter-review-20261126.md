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

The current regression at `agent5-twinleaf-belief-search.test.cjs:524–655` instead supplies a custom actorObservation that reads `currentState.ownerK1BySeat[seat]`. That is a synthetic fixture property, not part of the production actor-observation contract or pinned Twinleaf State. It does not exercise the production adapter path in which a sidecar-backed `rootKnowledgeBySeat` callback returns the ledger and `buildBaseActorView()` passes its snapshot to production `actorObservation()`. In the 14-case sampler suite this is the only root-K1 test; it covers root seat 0 K1 / seat 1 K0, with no symmetric root-seat-1 or non-root prior-K1 case.

**Required:** implement/test `rootKnowledgeBySeat` as an explicit per-run owner-K1 sidecar lookup keyed by the physical owner seat and bound to the current trial/deck identity. Use the public observation's turn to enforce freshness; do not pass raw State to the provider. Confirm that the adapter's existing `buildBaseActorView()` path carries the returned snapshot into production `actorObservation()`. The existing `captureOwnerK1()` can establish a snapshot only while the real owner-deck `ChooseCardsPrompt` is pending; preserve that result in the sidecar and advance/invalidate it with `advanceOwnerK1()`. Test this provider path with production `actorObservation()` and a pinned-Store owner-search capture; do not rely on a synthetic `state.ownerK1BySeat` property.

### 2. Existing owner-K1 and sampler Prize-snapshot schemas are not interchangeable

The existing `captureOwnerK1()` result in `simulation/twinleaf/owner-k1-prize-knowledge.cjs` uses:
- `knownPrintings` for the remaining **deck** multiset;
- `knownPrized` for the inferred **Prize** multiset;
- `prizeInferenceCertified` to say whether that Prize inference is certified;
- `exactMembershipKnown` / `deckMembershipStale` for deck-membership freshness.

By contrast, `normalizeKnowledge()` in `agent5-twinleaf-belief-input.cjs` interprets `exactPrizeSnapshot.knownPrintings` as the exact **Prize** multiset and compares it directly with `knowledge.knownPrizePrintings`.

The helper has direct unit coverage at `tests/agent4-owner-k1-prize-knowledge.test.cjs:96–113`: deck-only staleness preserves Prize certification, while Prize taking/swapping invalidates it. That validates the custody helper's semantics, but not the separate sampler projection or adapter wiring. Passing a raw `captureOwnerK1()` object as `ownerK1Snapshot` would therefore label deck membership as Prize membership. Also, `captureOwnerK1()` sets `exactMembershipKnown:true` even when `prizeInferenceCertified:false`; that flag cannot be reused as the sampler's exact-Prize flag.

**Implemented (Agent48):** `simulation/twinleaf/2026-11/agent48-owner-k1-sampler-projection.cjs` exports `projectOwnerK1PrizeKnowledge(capture, options)`. It maps `capture.knownPrized` to both sampler `ownerK1Snapshot.knownPrintings` and `knowledge.knownPrizePrintings`, gated only by `prizeInferenceCertified`; it validates physical seat, current turn/Prize count, registered 60-card list, and Prize-copy totals. It deliberately ignores generic `exactMembershipKnown` / `deckMembershipStale` when deciding whether Prize K1 survives. The 9-case regression `tests/agent48-owner-k1-sampler-projection.test.cjs` passed 9/9 in a local Node test harness. The Agent5 native-root workflow now includes this projection test and the existing custody-helper test.

The projection helper is **not yet wired** into the per-run `rootKnowledgeBySeat` sidecar or the PR #78 adapter; that remains the integration task. Keep the source custody schema and sampler Prize schema distinct, and do not pass the raw capture object as `ownerK1Snapshot`.

### 3. PR #78 currently drops the new transition-local K1 evidence API

The new sampler exposes `refreshMetadata(fromState, toState, transitionEvidenceBySeat)`, but the current PR #78 adapter's `transferMetadata(fromState, toState)` calls `refreshMetadata(fromState, toState)` with no evidence. The native-action, automatic-prompt, and player-prompt paths all use that two-argument call.

The player-prompt path already has the relevant pre-dispatch context: `actorSeat`, `actorView`, `resolution.actorObservation`, `resolution.promptProjection`, and selected tokens. It currently reduces the buffered receipt to opaque tokens and never supplies a per-seat evidence delta to K1 refresh. The sampler-level test at `agent5-twinleaf-belief-search.test.cjs:235–257` only verifies that an already-constructed array entry at index i is forwarded to seat i; it does not test adapter extraction of the real prompt owner or distinguish `actorSeat` from `transitionActorSeat`.

**Required:** pass a two-entry `transitionEvidenceBySeat` array into each real transition refresh. Partition private evidence by the prompt's physical owner `actorSeat`, not by `transitionActorSeat`; include public transition evidence in both seat entries. Capture owner-deck-search evidence while the genuine prompt is still pending, before the receipt is reduced to opaque tokens. Include appropriate invalidation evidence for deck/Prize-changing native and automatic transitions. Add a pinned-Store regression where seat 0 initiates a transition but seat 1 owns the prompt: only seat 1 receives private prompt/search evidence, while both ledgers receive the public transition.

### 4. The new physical-seat decklist ID map is not yet consumed by the adapter

The sampler now exposes frozen `ownDecklistIdBySeat`. The current adapter's unsampled-root actor view still falls back to scalar `deps.ownDecklistSeat` / `deps.ownDecklistId`; it does not consult `deps.redeterminize.ownDecklistIdBySeat[seat]`.

**Required:** use the physical-seat map for an unsampled root, validate both entries, and retain the physical-seat mapping in the search audit/experiment manifest. Do not collapse the two fixed Aichi lists into one candidate scalar when the root seat can be either physical seat.

### 5. Non-root K1 initialization must be branch-local, not root-visible

On the first sampled determinization, `seatKnowledgeBySeat()` is called for both physical seats, but `previousLedger` is supplied only for the root actor; it is explicitly null for the non-root seat. If that seat previously performed a deck search, returning K0 loses the simulated opponent's own knowledge and can make its policy under-informed. Blindly copying the actual opponent's K1 snapshot into every root determinization is also unsafe: the snapshot may not match the sampled world and can leak the opponent's private information into root search.

**Required:** construct the non-root seat's own ledger from that seat's private prompt/history evidence projected onto the sampled world. Keep this branch-local ledger separate from `beliefKnowledgeBySeat`, which must continue to represent only what the root actor believes about the opponent. The private history is latent from the root: do not copy the actual opponent's fixed K1 snapshot into every root determinization, because conditioning all root worlds on it leaks opponent-private information and can contradict the sampled world. A concrete factorization is to sample hidden world W from the root information set, then sample a latent opponent history H_o conditional on that world and root-visible public history, and derive the opponent ledger as K_o = f(W, H_o). The implementation needs either this branch-local joint model of hidden partition + private K1 history, or an explicit K0 opponent-knowledge mode whose limitations are reported; it must not claim two-sided K1 support without the joint model. Do not substitute the actual opponent's fixed private history for H_o. The current initial seatKnowledgeBySeat() call receives no random source or sampled-history argument; if multiple H_o values are plausible, extend that contract with an explicit per-seat latent-history sampler/seed rather than silently reusing the actual opponent history. Example: if an opponent's earlier deck search let them identify their Prize multiset but the root never saw the result, each sampled world must give the opponent the matching Prize-K1 view. Reusing the actual K1 in every world collapses the root's belief onto the actual hidden composition; K0 makes the opponent policy forget what it knows. Add a symmetric regression where seat 0 is root and sees only K0 about seat 1, but seat 1 has a prior private deck-search event: root observations remain invariant, and when seat 1 becomes actor its own K1 snapshot matches that sampled world's latent history. Repeat with physical seats reversed. A practical staged baseline, if the joint latent-history model is deferred, is to initialize the non-root seat as K0 at the root and update its branch-local K1 only from simulated prompt-owner evidence after the root. Label this explicitly as `K0-at-root / post-root K1`, not full two-sided K1. This is an integration acceptance question, not a claim that the current callback cannot implement it.

## Pinned-Twinleaf prerequisite for a real owner-search test

A real owner-deck search capture can be taken while its `ChooseCardsPrompt` is pending; validating the full transition and K1 persistence requires completing the same pinned Twinleaf Store prompt chain, including the subsequent `ShuffleDeckPrompt`. At the current engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, the native shuffle validator uses lexicographic `Array.sort()` and rejects valid permutations for decks of 11+ cards. This is the separate simulator defect documented in [Agent12's exact-pin shuffle hook note](agent12-twinleaf-shuffle-validator-hook-20261126.md) and PR #84. The research-owned hook is intentionally restricted to that exact engine commit and `ShuffleDeckPrompt`; it must pass its final exact-head regression before the real K1 prompt-chain test can rely on it. Do not mistake a native shuffle rejection for a K1 sampler defect, and do not patch the upstream submodule.

## Acceptance sequence

1. Add the explicit owner-K1 sidecar/provider and typed Prize-snapshot projection; replace the synthetic `ownerK1BySeat` test with a pinned-Twinleaf Store + authenticated sidecar test. Run `tests/agent4-owner-k1-prize-knowledge.test.cjs` alongside the sampler suite; the current `agent5-owner-root-native.yml` lane does not include this helper test.
2. Wire `ownDecklistIdBySeat` and `transitionEvidenceBySeat` through the adapter, with prompt-owner versus transition-actor negative/positive tests.
3. Run the existing bounded `native_search_only=true` lane on the exact reconciled PR #78 head; retain the pinned Twinleaf gitlink SHA.
4. Only after real pinned-State K1 continuity is demonstrated should the integration be described as K1-capable. This review does not authorize a fixture/game or establish policy competence, matchup strength, a deck nomination, or a win rate.
