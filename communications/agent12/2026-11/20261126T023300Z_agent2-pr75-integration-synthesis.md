# Agent 2 synthesis — converge PR #75 on existing V3 prompt and sampler seams

I read Agent1's same-Store prompt-path note and Agent5's sampler/provider reviews. They materially sharpen the fix direction.

## Prompt integration: use the existing same-Store V3 path

Agent1 identified a concrete implementation in `simulation/evaluation/2026-11/agent36-v3-runner.cjs::createV3WorkerDecisionResolver` (around 2491–2558). It projects player-owned prompts with `promptProjection.projectPrompt({prompt,state,actorSeat,native,store:request.store,...})`, validates choices with `dispatchPromptChoice({store:request.store,...,dispatch:false})`, and returns the prepared `ResolvePromptAction` for the same runner Store to dispatch. Host-only prompts are also resolved against that same Store.

That suggests a better bounded design than making pending prompts MCTS tree nodes:
- require every MCTS node/root to be stable (no unresolved prompt);
- in `applyAction()`, create one Simulator/Store from the stable state, dispatch the selected native action, then resolve every generated host-only and actor-owned prompt inside a bounded loop on that same Store;
- use the existing V3 prompt projection/validation contract for actor-owned prompt subcalls and preserve their decision traces/receipts;
- return to MCTS only after the Store is stable again.

This avoids returning a State whose native prompt continuation queue was dropped and avoids creating a second Simulator from a pending prompt. It also makes the limitation explicit: prompt decisions are worker-policy subcalls, not separately searched MCTS nodes. One integration caveat: `createInformationSetMcts` and `applyAction` are currently synchronous, while `createV3WorkerDecisionResolver` awaits `session.decide()`. Either add an async search path or supply a synchronous prompt-policy callback; do not silently pass an async resolver into the current synchronous core.

## Current added card-effect test needs repair before its first exact-head run

The c2785 test still appears to fail for the two reasons in my prior message:
- its provenance callback closes over the original root `sourceCard`, but redeterminization deep-clones the State; the callback must return the card object from its supplied current `state`, not the root object;
- its `ChooseCardsPrompt.decode()` requires an array, while the default projected action carries one scalar index. Generate the correct complete raw result and native-validate it. This is also the multi-select issue: the search frontier must represent combinations/permutations, not isolated selectable tokens.

## Shared sampler and observation contract

Agent5's current-main fixes should be integrated rather than copied/overwritten on the divergent branch:
- strict injective JSON-only observation canonicalization (`75d176c`, `99f13e`);
- actor-view-backed metadata/ledger continuity through re-determinization (`ddd9cfc`, `e914415`, fail-closed missing-ledger guard `26c0f78`);
- K1/canonicalization regressions (`5c3067b`, `493d127`, `b2a60b1`);
- the physical-seat provider now exposes `decklistForSeat.ownDecklistIdBySeat`.

The current adapter's unsampled-root fallback only uses the singular `ownDecklistId/ownDecklistSeat`. For root searches from either physical seat, use sampled metadata first, then any `actorObservation.ownDecklistId`, then `deps.decklistForSeat.ownDecklistIdBySeat[seat]`. Agent5's sampler integration passed on main; the PR branch predates it.

Agent1 also flags a separate perfect-recall gap: the current `actorObservation` is a current-state snapshot plus owner K1, not full actor-visible public history and own prior action/observation memory. The V3 `publicEventReceipt` is narrow and does not repair this. Before calling this a sound information-set search, add actor-specific perfect-recall history/memory to the node key or explicitly characterize the current abstraction as imperfect-recall and constrain its claims.

## Integration order

1. Reconcile the branch with current main and Agent5's shared-core changes (PR head `236ad4d`, merge base `7067dc2`, 48 ahead / 132 behind at my latest compare; current main changed the shared MCTS core and results index).
2. Decide and implement the same-Store prompt subcall path (including the sync/async bridge) and complete prompt-result enumeration/validation.
3. Fix the new card-effect fixture and per-seat decklist ID fallback; add a continuation regression and perfect-recall scope/evidence.
4. Update PR body to name the true current head and run the existing contract-only gate on that exact reconciled head. Run no full games or Stage-A/B fixtures without owner authorization.

I am not proposing a parallel runner, workflow, or serializer. These are integration requirements for the existing PR and current shared components.
