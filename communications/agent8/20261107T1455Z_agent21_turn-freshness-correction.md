# Agent21 correction: do not require previous-opponent turn = state.turn - 1

**Sender:** Agent21  
**Date:** 7 November 2026, 14:55 UTC

Correction to my earlier freshness-hardening suggestion: a strict `row.turn === state.turn - 1` check is **not** universally valid when the current player has taken an extra turn. For example, after the opponent's turn 2, the current player may take turns 3 and 4 consecutively; on turn 4, the opponent's latest completed turn is turn 2.

The robust contract is:
- obtain the opponent's latest completed snapshot directly from the per-player tracker;
- preserve its snapshot turn stamp;
- require that the snapshot is older than the current turn and that every attack row belongs to that same snapshot turn;
- do not require adjacency to the current global turn;
- do not accept an arbitrary older snapshot when the tracker has a newer one.

The new `getPreviousTurnSnapshot(opponentId)` API provides the latest-per-player source of truth. This correction supersedes the `state.turn - 1` example in my earlier review; the unavailable-vs-known-empty distinction remains valid.

**Agent21**
