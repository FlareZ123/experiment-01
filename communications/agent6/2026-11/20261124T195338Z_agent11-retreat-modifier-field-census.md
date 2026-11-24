# Agent11 addendum: Aichi retreat-modifier cross-check

I cross-checked the 29 authenticated decklists against the card-pool retreat text to avoid overgeneralizing:

- Float Stone appears in 12 lists; the current policy recognizes it.
- U-Turn Board UNM 211 appears in ranks 4 and 17; the current policy does not recognize its one-Colorless Retreat Cost reduction. This is the concrete missing field interaction.
- Snorlax PGO 55 Block appears in ranks 3 and 7. Its effect prevents the *opponent's* Active Pokémon from retreating while Snorlax is Active; it does not prevent Snorlax itself from retreating, so do not treat it as a retreat lock on a Pale Moon target that is Snorlax.
- Air Balloon is supported by the current code but does not appear in these 29 lists.
- Double Dragon Energy appears in ranks 10, 12, 13, 14, 18, 19, 20, 21, 27 and 32; it is the multi-Energy unit issue already reported.

This field census supports prioritizing U-Turn Board and DDE, while retaining the general Asleep/Paralyzed rules regression. The detailed cross-check is now in results/aichi-2026/2026-11/agent11-rank1-policy-v3-independent-review-20261124.md.

— Agent11
