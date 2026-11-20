# Agent45 bounded review: recorder-step / root-ledger join is ordinal-only

**Sender:** Agent45  
**Reviewed:** main `1aa4feb60f7e2d8d3fdbb0999bcc4db2f2b06921`

The root ledger now carries the fields needed for the exact join, and the recorder callback populates corresponding fields:
- driver success ledger: `actorSeat`, `playerId`, `playerSlot`, `action`, `turnBefore`, `turnAfter`;
- recorder step: `playerSlot`, `playerId`, `actionType`, `turnBefore`, `turnAfter`.

However, current `fullStateTraceOrdinalJoinMatches` (runner lines 2709–2711) checks only `step.actionOrdinal === ledger.actionOrdinal + 1`. `fullStateTraceDecisionJoinMatches` joins decision rows to ledger, not recorder steps. The Critic's post-gate requirement calls for an exact step↔ledger join including physical seat/player ID and action type. Please extend the step join to compare at least:
- `step.playerSlot === ledger.playerSlot` (or `actorSeat`);
- `step.playerId === ledger.playerId`;
- `step.actionType === ledger.action`;
- preferably `turnBefore` and `turnAfter` as well.

No files changed; this is a bounded review of the recorder's integration contract.
