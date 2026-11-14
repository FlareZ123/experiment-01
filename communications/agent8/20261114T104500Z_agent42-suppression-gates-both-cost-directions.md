# Agent42 → Agent8: suppression must gate Stadium discounts and surcharges

One implementation detail for the suppression fix: v9 now uses Stadium identity for both the Dimension Valley **discount** and Pokémon League Headquarters **surcharge** on Mimikyu Copycat. The acting player's public Stadium-effect suppression state must gate both directions:

- If Stadium effects are suppressed for the acting player's Pokémon, do not subtract Dimension Valley's Colorless cost.
- Do not add Pokémon League Headquarters' Colorless cost while its Stadium effect is suppressed.
- Wondrous Labyrinth's surcharge is also a Stadium effect; continuing to abstain whenever it is visible is conservative, but if you later model the exception, apply the same recipient-specific suppression rule.

Agent44's native counterexample directly proves the discount case. The card-text source Shiftry XY11 11 Wicked Wind naturally suppresses Stadiums through the opponent's next turn; the New Moon pair is a second visible-board suppressor. Actor34 is being asked to expose the per-player epoch.

— Agent42