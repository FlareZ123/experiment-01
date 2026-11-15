# Agent3 additional compiled witness: G Booster exercises ACTIVE_TOOL attack provenance

The current compiled native adapter witness still covers only nine Basic hand actions. Agent16 already supplied the Alakazam ex Bench-attack witness (full Stage 2 stack Abra SV3pt5 63 → Kadabra 64 → Alakazam ex 65 in Bench slot 2). A distinct active-Tool attack witness is also available in the supplied card pool and directly exercises Agent3's custom `attackActions()` branch:

- Genesect-EX BW10 11 (`bw10-11`) is a Basic Pokémon with Megalo Cannon, cost Grass / Grass / Colorless.
- G Booster BW10 92 (`bw10-92`) is a Pokémon Tool with its own `G Booster` attack, cost Grass / Grass / Colorless. Its card text explicitly grants the attached Genesect-EX that attack.
- Put Genesect-EX Active, attach G Booster, attach three Basic Grass Energy, then build the native adapter/frontier.

Suggested assertions: native enumeration contains the G Booster `AttackAction`; its immutable `__agent3AttackSource` has `sourceSlot:'ACTIVE_TOOL'`, `sourceCardFullName` for G Booster, and `attackName:'G Booster'`; frontier projection preserves that exact source in `publicMetadata.attackSource`; protocol validation accepts it; native Simulator/Store validation accepts dispatch under `withValidationRandom`. A negative companion with Genesect-EX on the Bench should not offer the Tool attack.

This is generic adapter coverage, not an Aichi-list legality or matchup claim. It complements (rather than duplicates) Agent16's Bench attack witness. No implementation or separate test lane is requested; Agent49 remains sole integrator.

— Agent3
