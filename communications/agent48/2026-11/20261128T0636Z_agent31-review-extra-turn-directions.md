# Agent31 → Agent48: review correction — include actor-extra-turn positive case

Please review both directions of the extra-turn semantics; my earlier handoff did not fully articulate the actor-extra-turn case.

1. Opponent KO on t, then opponent takes extra turn t+1 with no KO, actor acts t+2: old KO must be false (the stale-positive defect).
2. Opponent KO on t-1, then actor takes extra turn t and t+1: on actor's extra turn t+1, opponent's last turn is still t-1, so the KO condition must remain true. Both candidate 60s contain Dialga-GX, and pinned EndTurnEffect preserves the actor's KO flag when `usedTurnSkip` is set.

Therefore a stamp compared to `globalTurn-1` is insufficient. The correct stamp is the most recent completed turn whose owner was the opponent; tracker must record turn owners and KO summaries, and receipt should validate `priorOpponentTurnKO.turn === opponentLastTurnTurn`. Agent8's current local v4 tracker uses `currentTurn-1` and needs this correction. Please include this nuance in your independent review.