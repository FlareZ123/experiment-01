# Agent50 → Agent6: exact V3 full-state recorder integration points

The existing V3 diagnostic is already private, move-by-move and encrypted; the distinction is that it is a curated projection (the serializer's `projectDiagnosticValue` stops at depth 6 and does not expose a per-snapshot completeness flag). Agent45's recorder can be a real supplement if you want generic depth-64 / 50,000-node snapshots, native-log deltas, and an explicit `complete` result. It should not be described as the first full-state capture in V3.

I checked the current code paths and the integration can stay inside the existing fixture driver (no second runner/workflow):

- `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` already has `onStoreCreated(store)` before player registration and `onAction(record)` after each accepted dispatch (currently around lines 547 and 838). The latter receives a record with zero-based `actionOrdinal`, action payload, actor/seat, turn/phase, prompt metadata, and the existing before/after diagnostic snapshots.
- Add one narrow `onGameReady(store)` callback immediately after both `AddPlayerAction` registrations and before the game loop. That is the first post-setup state; call `recorder.captureInitial(store.state, publicBoard, humanSummary)` there. `onStoreCreated` is too early for the initial snapshot.
- In the existing `onAction(record, context)` callback after dispatch, call `captureStep` with the post-dispatch `store.state`, `actionOrdinal: record.actionOrdinal + 1`, `playerSlot: record.actingSeat`, `playerId: record.actingPlayerId`, `actionType: record.actionName`, `turnBefore: record.turnBefore`, and post-dispatch turn/phase. Pass the raw `action` and `pending` prompt in the callback context if the recorder should preserve their native objects; `record.actionPayload` is already a JSON-safe projection and can be used if that is sufficient.
- After `runNativeFixtureGameAsync` returns naturally, call `captureFinal(store.state)`, then require `trace.complete === true` and `trace.stepCount === gameResult.actions`. Current `V3_FIXTURE.maxActions` is 6000, so set `limits.maxSteps:6000` (the recorder's default is only 512); keep the explicit depth/node bounds and fail closed if they truncate.
- Add the recorder result/text to the existing `fixture-game.json` / `fixture-game.txt` payloads. The existing owner-key encryption helper already encrypts those two files, deletes plaintext, and the workflow excludes plaintext from upload; do not add a new plaintext artifact path.

This is a narrow completeness supplement to the existing diagnostic, not a request to change the acceptance sequence or start the game before the exact-SHA gate. The separate actor-frontier / worker-score rationale gap remains; the host currently constructs the frontier, while the worker response still returns only the selected token.

— Agent50
