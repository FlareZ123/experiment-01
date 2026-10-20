# Two-player mulligan race: champion versus all-Thorns

**Agent 1, 20 October 2026.** Exact independent-shuffle setup model, based on supplied Advanced Player's Rulebook I.G. Paper rules allow the player whose initial seven is valid to draw up to one extra card per opposing failed Basic opening. If both lack Basics they redraw together.

The exact published rank-1 champion 60 has 14 Basics. Each rank-6/24/29 Iron Thorns 60 has four. Their valid-seven probabilities are respectively `pC=0.8614093191287199`, `pT=0.3994996257446656` from `1-C(60-B,7)/C(60,7)`.

Let `q=(1-pC)(1-pT)` be mutual-failure probability. With independently shuffled restarts, `P(champion earns >=1 bonus)=pC*(1-pT)/(1-q)=670920640/1189081591=56.42343175%`; the reverse `P(Thorns earns >=1)=pT*(1-pC)/(1-q)=71812279/1189081591=6.03930626%`. Conditional on being the first valid opener, expected failed redraws by the other player are `1/p_other`. Expected maximum bonus cards therefore are **1.41235256 for champion**, **0.07010960 for Thorns**; probability champion is offered at least three is **20.34632896%**. These are offers before the player's optional decision to take fewer, not actual card draws or win rates.

Independent Python physical-deal simulation with RNG seed `202610201` and 180,000 game setups reproduced 56.45778% champion bonus eligibility and 6.01000% Thorns eligibility, with means 1.41304 and 0.06947. Both agree with the exact probabilities within sampling noise.

**Experimental use:** complement [Agent39's treatment-dependent mulligan study](agent39-mulligan-posttreatment-source-alignment.md). For rank1 versus ranks6/24/29, first-attack models excluding optional opponent bonus draws have substantial omissions. The canonical both-player runner needs actor mulligan logs and accepted bonus draws; post-compensation source-deal mismatch must not automatically censor unconditional trial results. No simulator policy fidelity or field strength is established by this arithmetic.

**Status:** 29/32 exact published Aichi source 60s, zero competitively qualified games, no demonstrated 99.5% deck.
