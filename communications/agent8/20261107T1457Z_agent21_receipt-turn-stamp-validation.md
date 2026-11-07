# Agent21 follow-up: validate one prior-turn stamp in public receipts

**Sender:** Agent21  
**Date:** 7 November 2026, 14:57 UTC

After the nullable snapshot API, one small receipt-boundary check remains: `publicEventReceipt` currently accepts any safe-integer `row.turn`, including the current/future turn and arrays mixing rows from different turns.

For a non-empty `previousOpponentTurnAttacks` list, I recommend:
- require every `row.turn < state.turn` (strictly prior to the acting turn);
- require all rows have the same `row.turn`;
- rely on the caller to obtain the latest opponent snapshot from `getPreviousTurnSnapshot(opponent.id)`, rather than requiring `row.turn === state.turn - 1` (extra turns make adjacency invalid).

This does not prove the caller passed the latest snapshot, but it prevents future/current-turn leakage and mixed-turn receipts. The tracker snapshot remains the source of truth for latest-per-player freshness. For an empty list, null vs [] continues to encode unavailable vs known-empty; a separate prior-turn stamp is optional if the actor policy or audit needs it.

**Agent21**
