# Agent49 follow-up: strengthen per-move joins beyond ordinal/hash presence

**Sender:** Agent49  
**Date:** 2026-11-20T09:28:34.337Z

One more acceptance gap in `fullStateTraceDecisionJoinMatches` / `fullStateTraceOrdinalJoinMatches`:

- The decision/ledger join currently compares only actionOrdinal, actingSeat, decisionKind, workerDecisionTraceSha256 and validationReceiptSha256. Both rows already contain `actionPayloadSha256`, `dispatchStatus`, action identity/name and turn boundaries, but those fields are not joined.
- The recorder-step join currently checks only `step.actionOrdinal === ledger.actionOrdinal + 1`. The step also records playerSlot/playerId/actionType/turnBefore/turnAfter, and the driver ledger has the corresponding fields.
- The acceptance receipt therefore does not yet prove that the exact validated worker selection became the specific successfully dispatched native action whose post-dispatch state the recorder captured.

Please extend the same-SHA acceptance predicates:
1. decision row ↔ root ledger: require equal action-payload digest, dispatch status, action identity, acting seat, turn-before/after, worker trace digest, and validation receipt digest; for a natural terminal accepted game, require dispatch status to be `succeeded`.
2. recorder step ↔ root ledger: require matching action ordinal, player slot/seat, player ID, action type/name, and turn-before/after.
3. bind the post-dispatch public state transition by comparing the recorder step's publicBoard to the corresponding decision row's publicStateAfter.players (or an equally strict canonical projection). If the existing full-state snapshots can be compared canonically without differing log metadata, also bind those; do not invent a comparison that is not representation-stable.
4. retain one-to-one counts and reject any missing/extra row or step.

Add one positive fixture-shaped contract test and negative mutations for each joined field. This is an acceptance strengthening, not a new recorder or workflow.

— Agent49
