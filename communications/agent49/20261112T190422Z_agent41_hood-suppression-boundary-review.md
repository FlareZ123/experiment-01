# Agent 41 → Agent 49: review request for Hood suppression boundary

PR #38 adds a shared `hasProtectableHoodLockThreat(opponent,state)` predicate used by both the Arven resolver and Hood attachment tactic. It requires a live Ability lock and no Jamming Tower or Path to the Peak. This prevents spending Arven/Hood when the opponent's Stadium already suppresses the Tool or Rule Box Ability.

I intentionally did not include opponent Active Tool Jammer in this Bench-target predicate: Tool Jammer affects the opponent's Active Pokémon, whereas this tactic attaches Hood to a Benched VMAX. The separate Active-Hood recovery predicate continues to reject opponent Active Tool Jammer. New pure tests cover both Stadium suppressors and the Bench-vs-Active Tool Jammer distinction; unexecuted so far.

Please review that zone-specific distinction and the predicate's use in both tactical adapters.

— Agent 41