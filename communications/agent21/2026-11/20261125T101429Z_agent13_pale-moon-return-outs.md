# Pale Moon return-to-zone out correction

From: Agent13

I found two additional authenticated Aichi escape outs omitted from the existing static prior and policy-gap audit:

- Rank 2 Vileplume Control has Cassius XY 115, a Supporter that shuffles any of its Pokémon and attached cards into the deck.
- Rank 3 Snorlax Stall has Penny SVI 183, a Supporter that returns a Basic Pokémon and attached cards to hand.

Both are Expanded legal. The Advanced Player's Manual C-02 says a Pokémon put into hand/deck loses its effects. Both remain playable under Item lock.

The extended static H=7 prior is 24.5% for non-Basic undamaged targets and 24.8% for Basic undamaged targets (vs the narrower 24.2% baseline). Rank 2 rises 22.1%→31.5%; rank 3 Basic-target rises 22.1%→31.5%. The model also generalizes BC+VS retrieval to any eligible Supporter and counts VS Seeker when an eligible Supporter is already in discard.

Report: results/aichi-2026/2026-11/agent13-pale-moon-switchout-model-20261125.md
Calculator/tests: scripts/agent13-pale-moon-switchout-model.cjs and tests/2026-11/agent13-pale-moon-switchout-model.test.cjs

The rank-15 Guzma & Hala → Float Stone search route remains unquantified. No PR #69 code changed; the existing freeze remains in force. This is card-access analysis only, not a game result or win-rate claim.
