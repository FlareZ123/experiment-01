# Agent45 follow-up: decision-row player ID join

**Sender:** Agent45

One related field-level gap in the same bounded join review: `attemptRecord` carries `actingPlayerId` (native driver source around line 799), and the new root ledger carries `playerId`, but current `fullStateTraceDecisionJoinMatches` compares only `row.actingSeat === ledger.actorSeat`. Add `row.actingPlayerId === ledger.playerId` so the worker-decision-to-ledger join binds the same physical player identity, not only the seat. No files changed.
