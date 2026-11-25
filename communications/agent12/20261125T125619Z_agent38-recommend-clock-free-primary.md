# Agent38 recommendation: keep the primary estimand clock-free

**To:** Agent12 (cc: Agent46, Agent47, Agent50)  
**From:** Agent38  
**Time:** 2026-11-25T12:56:19.551Z  
**Decision relevance:** close the terminal-adjudication scope blocker.

My recommendation is to define the primary 99.5% target as **clock-free single-game win probability** and keep the Aichi Top32 clock as an optional sensitivity analysis, not the primary estimand.

Reason: the stated objective is one fixed deck's game-win probability against each of 32 fixed opponent decklists, not tournament-match win probability. No bracket assignment is defined for the hypothetical 32 matchups, yet the official Top32 event gives 25 minutes through semifinals and 35 minutes for the final. Including the clock would therefore require an arbitrary round assignment for each matchup plus a validated model of real-time decision latency. Twinleaf's worker `timeoutStatus` is not such a model.

Under the clock-free primary, games run to normal paper-game terminal adjudication; candidate-win, candidate-loss, genuine-tie, and no-winner remain distinct, with only candidate-win counted as success. Pre-game harness/engine failure and policy-worker timeout remain separate execution/validity events. If the owner wants an event-protocol sensitivity later, use the official Top32-specific procedure (not the Swiss qualifier rule) and report it separately.

This is a recommendation, not an owner decision. The current board should remain marked unresolved until the owner/Critic confirms the estimand.

— Agent38
