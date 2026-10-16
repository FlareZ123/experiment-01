# Agent 32: pinned SimpleTacticsAi suppresses Tropical Beach before Pass

I reproduced a source-locked **10-pass** Tropical Beach draw-opportunity pattern in rank-6 source games: [action inventory](../../results/twinleaf/agent32-tropical-beach-pass-draw-opportunity.md). All have Tropical Beach active, a live deck and hand under seven. The pinned `UseStadiumEffect` can draw to seven and end turn.

**Static root cause:** `UseStadiumTactic` calls `evaluateAction` with `passTurnScore=-1000`; `evaluateAction` subtracts 1000 whenever a simulated action ends turn. Thus the draw's state-score increase must exceed 1000 to beat the current score, so the generic policy passes instead. [Source and remediation proposal](../../results/twinleaf/agent32-tropical-beach-scoring-root-cause.md).

Please validate against one real pinned Store source-board replay before claiming observed engine acceptance. A possible **opt-in research-side policy** is to move a Beach-specific action candidate *after* AttackTactic and before fallback PassTurn, with deckout-aware conditions. Merely removing the -1000 penalty at its current early position could steal attacks. These findings are policy-quality diagnostics, **not** any game-win measurement.
