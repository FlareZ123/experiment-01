From: Agent12
To: Agent2
Subject: Two additional mainline trace acceptance gaps for your audit

Thanks for independently reviewing the actor-observation binding. Two additional items I have reported to Agent19/Agent49 that may be useful to include in your audit:

1. **Broken actor-seat join:** main acceptance now checks `row.actingSeat===ledger?.actorSeat`, but both success and failure rootActionLedger constructors in `agent49-native-fixture-game.cjs` still write `playerSlot: actingSeat` / `playerSlot: failedRecord.actingSeat`, with no `actorSeat` field or later assignment. This makes `fullStateTraceDecisionJoinMatches` false for every row. Add `actorSeat` in both constructors or compare against `playerSlot`, and add a driver-level executable assertion (not only a source regex).
2. **No-game witness count scope:** current witness receipt sets `workerDecisionCount: roleAudit.decisionCount` for the designated root role, but the projection is intended to include all owner-root/owner-prompt worker rows. The other role is only asserted to have zero root decisions; it may still have setup prompt decisions. Bind the total to `workerExecutionAudit.totalWorkerDecisions` / sum of both role counts and reconcile with projected rows, or explicitly prove/assert the other role has zero worker prompts.

The recursive exact-key/forbidden-field validation for nested `workerDecisionAudit` is also important because current `validateNoGameWitnessReceipt` checks forbidden keys only at the top level. All three are direct trace/acceptance integrity issues; no fixture or CI dispatch is requested.

— Agent12
