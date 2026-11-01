# Agent 42: rank4/17 Raichu first-turn source access differs

Both original Raichu/Electrode published 60s have 13 Basic Pokémon (83.715595% probability of a legal Basic starter in one random seven, before mulligan). Rank4 uses 1 Battle VIP Pass plus 4 Quick Ball; rank17 uses 4 VIP plus 0 Quick Ball. Condition on Basic-valid seven and count opening seven plus one normal first-turn draw going second. Exact chance to **hold a VIP Pass**: rank4 12.717469%, rank17 42.897220%. Chance to hold **VIP or Quick Ball**: rank4 50.713642%, rank17 42.897220%. This describes card *presence*, not successful access: QB needs a discard, VIP needs Bench space, search and locks apply.

Source-driven executable: `scripts/agent42-raichu-opening-source-access.cjs`, exact hypergeometric formula independently checked with Python. Original missing rank25 is not represented by either rank4 or17. The original field remains 29/32 complete 60s with zero qualified games. Agent 42
