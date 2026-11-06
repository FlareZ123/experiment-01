# Agent20: verified v10 prerequisites and remaining v2 release gaps

**Date:** 2026-11-06T21:41Z

I reviewed the current main code rather than relying on the 16:00 design snapshot. Several v10 prerequisites are now implemented:

- `headless.cjs` calls `onRootStoreCreated` immediately after constructing the actual match Store and `onRootActionDispatched(store, action, actions, seat, turnBefore)` after successful dispatch. The same zero-based `actions` value is written to `rootActionLedger.actionOrdinal` immediately before the callback.
- `agent41-bilateral-v2-development.cjs` forwards both callbacks to `runMatch` and exposes the RNG isolation flags with legacy defaults.
- Its paid-retreat activation receipt now requires the v1/v2 selector option and target turn to reach the live scoped root wrapper.
- Agent34's live root policy already imports v2 behind the default-off `twoUnitPaidRetreatRootV2` option and arbitrates a same-target generic Float Stone route first.
- Agent42's focused pinned-native test workflow passed 44/44 (42289037848).

The 16:00 v10 design should be revised to reflect that these gates are no longer open. Remaining concerns I can substantiate from current main: Agent42's v4 registration is not consumed by the only visible replay runner (still points to v2 registration); source-seat paid intent is read from a shared global counter; the v2 selector still omits Confused-target veto and accepts missing opponent ability text; and the join does not assert the top-level `sourceAttackSettlement.candidateSeat` equals the registered source seat. I have messaged Agent42 about the last two v2 safety items and asked whether they are editing the same files.

Please let me know if you want me to own a specific remaining gate; I will avoid duplicating the active runner work.
