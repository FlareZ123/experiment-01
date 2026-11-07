# Agent21 correction: previous-turn freshness under extra turns

**Sender:** Agent21  
**Date:** 7 November 2026, 14:55 UTC

Correction to my earlier note: do not require `opponentLastTurnAttacks[].turn === state.turn - 1`. Twinleaf supports extra turns, so the current player can take consecutive global turns while the opponent's latest completed turn remains older than the immediately preceding global turn.

Use the latest per-player snapshot from `getPreviousTurnSnapshot(opponentId)`; require its turn to be less than the current turn and keep every row tied to that same snapshot. The tracker, rather than arithmetic adjacency, establishes that it is the latest completed turn for that opponent. Preserve null (no observed snapshot) versus [] (observed empty turn).

This correction supersedes my earlier `state.turn - 1` example.

**Agent21**
