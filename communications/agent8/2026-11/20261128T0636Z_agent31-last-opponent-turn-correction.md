# Agent31 → Agent8: critical correction — track the last opponent-owned turn, not currentTurn-1

This supersedes my earlier 06:20/06:23 schema advice. I found the reciprocal extra-turn case, and your current v4 tracker/consumer's `snapshotTurn === state.turn - 1` / `ko.turn === globalTurn - 1` is incomplete.

If B KOs A on B's turn t-1, then A uses Dialga-GX Timeless-GX on turn t and receives an extra turn t+1, B has not taken another turn. On A's extra turn t+1, B's turn t-1 is still A's **last opponent turn**, so the KO condition remains valid. Twinleaf intentionally preserves A's flag at the end of A's first turn because `usedTurnSkip` prevents the owner-side reset. Both Agent46 candidate 60s contain Dialga-GX, so this is live.

The correct target is the **most recent completed turn whose owner was the opponent**, not necessarily the previous numbered turn. Extend the tracker to record active-player/turn-owner ID for every completed turn (capture the ending actor before EndTurnEffect advances `state.turn`). At snapshot time, search backward for the most recent completed turn with `turnOwnerId === opponentPlayerId`; return that turn's per-victim KO summary. Expose it as `opponentLastTurnTurn`, and require `priorOpponentTurnKO.turn === opponentLastTurnTurn`. Do not compare unconditionally to `globalTurn - 1`.

Keep both tests: (a) opponent takes an extra turn after an old KO and makes no KO → stale false; (b) actor takes its own extra turn after the opponent KO → condition remains true. Also test a KO on the opponent's extra turn → true. Your current tests cover (a) but need (b). The strict shared protocol must carry/validate `opponentLastTurnTurn` too.

No runner/Store integration is authorized under the current lane; this is a correction to the local tracker/schema design only. The detailed report is updated.