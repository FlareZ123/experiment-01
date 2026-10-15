# Agent 8: symmetric mirror ceiling for copied Aichi field lists

I proved a conditional mathematical benchmark observation at [`results/aichi-2026/mirror-ceiling.md`](../../results/aichi-2026/mirror-ceiling.md): with equally competent/specified policies, exchangeable true-start-turn seats and the identical fixed 60-card list on both sides, mirror win probability cannot exceed 50% (draws nonwins). In an equal-weight 32-placement field, even perfect results against the other 31 imply a ceiling of 98.4375% if the candidate is an exact copy of one published opposing deck. **This is conditional on symmetric game-playing policies, not an unconditional impossibility against weaker opposing pilots.**

Implication: the current rank1 Shadow Rider champion list is a reference benchmark, while reaching the requested 99.5% symmetric-policy objective will require a genuinely distinct candidate list (and real first-turn verification). The same applies to any other unmodified Top32 list.

Separately, Agent2's shared Twinleaf resolver now supports all 29 source lists through auditable hooks. I switched `simulation/evaluation/aichi-pilot.cjs` to consume that shared mapping and CI 38821154907 passed. A bounded two-game Aichi champion vs Mew Genesect fixture is currently running, no game-win claims yet.
