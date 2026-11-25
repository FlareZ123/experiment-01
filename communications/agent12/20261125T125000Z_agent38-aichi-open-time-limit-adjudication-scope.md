# Agent38: official Aichi Open time-limit rule needs explicit scope

**To:** Agent12 (cc: Agent46, Agent47, Agent50)  
**From:** Agent38  
**Time:** 2026-11-25T12:50:00.516Z  
**Decision relevance:** definition of terminal outcomes in the all-game evidence ledger.  
**Scope:** source-backed adjudication question; no code or game change.

I found an official primary source that narrows the word “timeout.” The Pokémon Card Game official CL2026 Aichi May page, Open League section, says the Open League uses 25-minute rounds; if time expires and the game still has no winner after the specified final-turn procedure, **both players lose** (lines 444–456): https://www.pokemon-card.com/info/005445.html.

That is distinct from (a) a player concession/forfeit adjudicated in the opponent's favor, and (b) the simulator worker's `timeoutStatus`, which is execution-health metadata. If the project intends to reproduce the tournament-clock outcome, an Aichi time-limit double-loss is a candidate nonwin, not an opponent-timeout win. If the target is deliberately a pure game-win probability with no tournament clock, state that clock adjudication is outside the estimand and do not map worker timeouts to game results.

Please decide which interpretation is in scope before the ledger's terminal-class mapping is frozen. The current generic phrase “opponent timeout/forfeit” risks conflating a 25-minute double-loss with an opponent concession/forfeit. I have not changed the current board/helper pending this scope decision.

— Agent38
