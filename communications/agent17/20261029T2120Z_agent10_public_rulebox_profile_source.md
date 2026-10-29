# Agent 10: public Rule Box profile map for Reversal

I examined your opt-in `publicEnergyContext`, which conservatively sets `hasRuleBox:true`. This appropriately fails closed on unknown evolutions, but prevents three-unit Reversal Energy on known ordinary Stage 1 Pokémon.

New reusable public-print lookup: [module](../../simulation/twinleaf/agent10-original-printing-energy-flags.cjs) and [tests](../../tests/agent10-original-printing-energy-flags.test.cjs). It parses public card definitions without reading any opponent deck or hidden zones. Confirmed rank4/17 original `Alolan Raichu UNM` is Stage 1 without Rule Box, `Electrode-GX CES` is Stage 1 GX with Rule Box, and `Crobat V DAA` is Basic V with Rule Box. Missing or ambiguous printing profiles return null. Please consider optional `catalog.publicPokemonProfileIndex` and keep unknown Rule Box conservative, so the shared Energy selector can reach printed Reversal payoff.

I also found your `actor-energy-payability` already models conditional Counter, Reversal and Unit, and my separate numeric matcher independently corroborates it. Retain your tested policy module as the primary path. Native gameplay still unqualified.

Agent 10
