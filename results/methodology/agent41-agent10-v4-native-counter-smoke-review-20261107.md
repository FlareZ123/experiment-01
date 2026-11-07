# Agent41 independent review: Agent10 v4 native root-counter smoke

**Date:** 7 November 2026  
**Run:** [42424474002](https://github.com/FlareZ123/experiment-01/actions/runs/42424474002)  
**Run head:** `39df145d90c1abf21adb4eed1e7e985a7693ad62`  
**Disposition:** Accept bounded native dispatch-count parity for one complete match. A native VIP-positive event is still required before v10c attribution or integration.

## Counter alignment review

I inspected the successful smoke workflow, test, v4 hook, and pinned-revision research headless loop.

The two counters use the same boundary and indexing convention:

- In `simulation/twinleaf/headless.cjs`, the match-loop `actions` counter is initialized to zero after the two `AddPlayerAction` setup dispatches.
- The headless loop records `actionOrdinal: actions` before dispatch, then increments `actions` only after the successful `store.dispatchAction(action)`.
- In `agent9-battle-vip-owner-after-pass-v4.cjs`, the Store hook ignores the two `AddPlayerAction` setup dispatches, initializes `nextRootOrdinal=0) after the second, captures the current ordinal before dispatch, and advances it only after the underlying Store dispatch succeeds.
- Therefore both are zero-based and count successful root dispatches after the same two setup actions. The v4 hook's `rootOrdinalProtocol` string accurately describes this boundary.

The smoke test asserts:
- native Store and root-ordinal initialization were observed;
- the protocol identifier matches;
- `dispatchRootCount === result.actions`;
- `rootActionLedger.length === result.actions`;
- every ledger row has contiguous `actionOrdinal === index).

Agent10 reports 70 successful Store dispatches, 70 hook increments, and 70 contiguous headless ledger rows. The workflow is green and the test contains the relevant assertions. This is credible bounded evidence that the counter does not drift in this one pinned native match.

## What the smoke does not establish

The smoke deck produces **zero VIP intervention events**. Consequently it does not emit or compare a native `itemRootOrdinal` or `searchRootOrdinal` for Battle VIP Pass. It does not show a native `PlayCardAction` for VIP, the ensuing `ChooseCardsPrompt` / `ResolvePromptAction`, or the physical deck-to-Bench movement.

The smoke therefore verifies total dispatch-count parity, not the event-to-ledger join used by strict attribution. The v3 pure contract's 57/57 tests validate synthetic event/ledger combinations, but a native positive event remains mandatory.

## Additional integration checks

1. **`policyRecorded` interface:** `strictVipTreatmentAttribution` requires `vipAudit.policyRecorded === true`. The v4 hook's returned audit currently exposes `nativeStoreSeen`, `rootOrdinalInitialized`, `dispatchRootCount`, event counters, and qualification fields, but no `policyRecorded` property. The v10c composition must set this truthfully when the adapter was actually installed and observed the native Store, or explicitly revise the contract. Do not manufacture the flag for an absent/aborted hook.
2. **Unresolved searches:** the v4 hook exposes `unresolvedOwnerSearches`, but the v3 contract does not currently require it to be zero. Its `acceptedEventsMatchRoots` checks that each accepted search has a matching item, but does not enforce the reverse for every accepted item event. For a completed attributed match, require zero unresolved searches and ensure every accepted VIP item event has exactly one accepted search event.
3. **Completed native game:** attribution should not qualify a partial or aborted match. The v10c caller must require a completed match, no native abort, and no unresolved/rejected VIP event before reporting treatment performance.
4. **Positive and negative native controls:** a positive case must produce a native VIP item root at ordinal (n), its own search `ResolvePromptAction) at ordinal (m), and the expected physical deck/Bench deltas. Compare both ordinals to the independent headless ledger rows. A negative control must demonstrate that a natural or unrelated VIP root does not get attributed as the treatment intervention.

## Recommendation

Keep v10b frozen. The 70/70 smoke is a useful count-parity checkpoint and should be retained. Do not promote v10c treatment attribution or integrate it into the shared policy until a pinned native VIP-positive match produces the exact item/search ordinal pair, physical movement receipt, complete archive, and completed game. No competitive result or win-rate evidence is produced by this smoke.
