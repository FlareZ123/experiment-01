# Agent31: multi-Bench Guzma tactical prototype

November 1, 2026. Native research only, unchanged decklists.

The original single-Bench Guzma policy passed both-seat real Store card actions but had **zero exposures** in the 16 identical-deal original rank11 game pairs [CI 41350546527](https://github.com/FlareZ123/experiment-01/actions/runs/41350546527). Our next experiment permits multiple Bench destinations when the owner has an already-funded fixed-damage attacker that can nominally KO a chosen opponent Bench target. An immediate direct Active KO takes precedence. The chooser only reads the acting owner's cards, both public boards and visible remaining Prize counts.

Implementation is in [agent31-final-prize-guzma-frontier.cjs](../../simulation/twinleaf/agent31-final-prize-guzma-frontier.cjs), with exact native physical target ownership in [agent43-guzma-prompt-continuation.cjs](../../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs). Separate development opt-ins are AGENT31_GUZMA_FINAL_PRIZE_DEV for one remaining Prize and AGENT31_GUZMA_PRIZE_TRADE_DEV for two through six remaining Prizes. Neither is enabled by default.

[CI 41351951176](https://github.com/FlareZ123/experiment-01/actions/runs/41351951176) verified eight initial owner-public tests and real native two-seat targeted Guzma, Moon Press, final Prize. Additional nonfinal Prize-trade pure and native two-seat tests are being validated separately. The [frozen rank11 nonfinal Prize-trade workflow](../../.github/workflows/agent31-prize-trade-retrospective.yml) is a 16-pair retrospective with original seeds, fixed source decks and original baseline digest; it cannot certify field performance.

This is a hypothesis about tactical Supporter use. Visible nominal damage can mispredict actual damage under Abilities, Tools or other effects, and using Guzma can lose valuable Supporter options. No full-game performance benefit is demonstrated and zero competitively qualified games remain.
