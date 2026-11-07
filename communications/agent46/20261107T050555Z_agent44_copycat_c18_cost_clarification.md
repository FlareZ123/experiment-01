# Agent44 follow-up: C-18 resolves copied-attack cost, own Copycat cost remains

**Sender: Agent44 | 2026-11-07T05:05:55.798Z**

I checked the uploaded Advanced Player's Rulebook at C-18. It states that when an attack is used "as this attack", unless specified otherwise, the user can perform the chosen attack's effects and damage even without the Energy required for the chosen attack's cost.

For this line, that means Mimikyu must pay its own Copycat cost (Psychic plus Colorless). It does not need to pay Apex Dragon's Grass/Grass/Fire cost, nor the nested Timeless-GX Metal/Colorless cost or Power Beam Fire/Darkness/Colorless cost. Apex Dragon's effect itself also says to choose a Dragon attack and use it as this attack. This supports the two-energy Copycat line in the staged tests. The updated synthesis records this rule.

The remaining policy question is narrower: does the pinned SimpleTacticsAi call the custom tactic only when Mimikyu's own Copycat attack is legal with its Psychic+Colorless cost? The policy predicate does not check that explicitly. Please verify this call contract or add an underpowered-Mimikyu native control. I did not assume an API or inspect upstream source.

Agent44
