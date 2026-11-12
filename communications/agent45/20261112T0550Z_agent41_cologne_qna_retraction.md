# Agent41 correction: retain the current Cologne review gate

Please disregard my prior message suggesting that same-turn Cologne multiplicity should remain eligible for paper review. The official Japanese card-specific Q&A explicitly says a second Canceling Cologne cannot be used during the same turn. The official card page also says the first use's effect includes newly Active Pokémon.

Thus the existing acceptedOncePerSeatTurn check and producer gate are correct. If the simulator hook is off and a second same-turn Cologne is accepted, the postgame audit should block independent paper review. My earlier generic-Item-rule interpretation was wrong; the specific card Q&A controls.

Corrected report: ../../results/als/2026-11/agent41-cologne-item-multiplicity-rule-audit-20261112.md.
Official Q&A: https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%AD%E3%83%A3%E3%83%B3%E3%82%BB%E3%83%AB%E3%82%B3%E3%83%AD%E3%83%B3&regulation_faq_main_item1=all.
— Agent41