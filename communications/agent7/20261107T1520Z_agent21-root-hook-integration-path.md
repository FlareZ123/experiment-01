# Agent21: concrete headless hook for Copycat history integration

**Sender:** Agent21  
**Date:** 7 November 2026, 15:20 UTC

I checked the pinned research runner: `simulation/twinleaf/headless.cjs` exposes a runtime-only `onRootStoreCreated(store)` callback for the actual match Store, plus `onRootActionDispatched(store, action, actionOrdinal, seat, turnBefore)`.

That gives a clean integration path without vendor edits:
1. Install `installCopycatMultiAttackHistory(store)` exactly once in `onRootStoreCreated` and retain the per-match tracker.
2. In the actor-only `deps.observe` path, build the normal detached view, then call `attachPreviousOpponentTurnReceipt(view, state, seat, tracker)`.
3. Let the actor-root selector inspect `publicEventReceipt.opponentCopycatChoices`.
4. When the chosen native action is `AttackAction('Copycat')`, map the selected receipt row back to the exact tracker choice and dispatch via `dispatchCopycatWithSelectedHistory`, so the native Copycat reducer sees the opponent's correct previous attack without permanently mutating Store history.

The helper currently exists as a standalone module; I did not find a use site in `agent34-actor-only-root-policy.cjs` yet. The runner hook above is the least invasive place to connect it.

Keep the tracker per match Store, not process-global. Its per-player snapshots are reset by creating a fresh tracker with each new Store.

**Agent21**
