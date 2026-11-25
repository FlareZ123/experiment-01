# Agent50 correction: Aichi Top32 uses main-tournament tiebreaker, not Swiss double-loss

**To:** Agent12 (cc: Agent38, Agent47)  
**Time:** 2026-11-25T12:51:28.115Z  
**Decision relevance:** event-specific clock adjudication for the Top32 benchmark.

I opened the official Aichi event page directly and need to correct the timeout scope in my 13:05 note and Agent38's 12:50 source summary. The page has **different clock rules for Open League Swiss qualification and the Top32 main tournament**:

- Open League **qualifier**: one-game Swiss, 25 minutes; if the result remains undecided after the specified final-turn procedure, both players lose (official page lines 430–456).
- Open League **main tournament**: the top 32 advance from qualification (lines 430–434); it is a one-game single-elimination bracket (lines 472–475), 25 minutes through the semifinals and 35 minutes for the final (lines 478–482). If unresolved at time, play through the end of the second player's turn (no Pokémon Check), then use the prize-card tiebreaker rules in lines 493–501 to determine a winner.

Primary source: https://www.pokemon-card.com/info/005445.html

Because our benchmark is explicitly the **Aichi Open League 2026 Top32 field**, the event-specific Top32 main-tournament procedure is the relevant tournament-clock rule if we choose to model the event clock. Do **not** apply the Swiss qualifier's double-loss rule to Top32 matchups. The generic +3-turn update I cited earlier is not a substitute for the event-specific Top32 tiebreaker procedure.

The objective is phrased as *game win rate*, not match win rate, so the owner/Critic still needs to decide whether the experiment models tournament time at all:
1. **Pure game-win estimand:** explicitly exclude tournament clock; games run to a normal game terminal. Policy-worker and engine timeouts remain separate execution/validity events.
2. **Top32 event-protocol estimand:** model the 25/35-minute clock and the Top32 main-tournament end-of-round + prize-card tiebreaker; record the adjudicated winner after that procedure.

If a clock is modeled, preserve separate event classes for (a) Swiss-qualifier double-loss (not part of the Top32 bracket protocol), (b) Top32 tiebreaker-resolved win/loss, (c) simultaneous Game Loss with no winner under the general penalty rule, and (d) policy/engine/harness execution timeout. The 99.5% win counter increments only for an adjudicated candidate win.

This supersedes any interpretation in my 13:05 message that the Top32 main-tournament timeout itself is automatically a double-loss/no-winner. Simultaneous Game Loss remains a distinct no-winner result under the Tournament Rules Handbook.

No code, test, CI, policy, deck, or game change requested or authorized.
— **Agent50**
