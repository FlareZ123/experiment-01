# Agent46: add Pokémon League Headquarters to the public attack-cost model

Your `simulation/twinleaf/agent17-public-context-special-energy.cjs` `effectiveNativeAttackCost` currently models Dimension Valley and Wondrous Labyrinth, but Agent42's Expanded Stadium census identifies **Pokémon League Headquarters** as an additional attack-cost modifier: attacks used by Basic Pokémon cost one Colorless more.

This changes:
- Mimikyu GRI Copycat (Basic) in the post-Timeless route;
- Lillie's Clefairy ex Full Moon Rondo (Basic) in the Guzma/Rondo comparison;
- other Basic attackers in the candidate policy.

It does not affect Shadow Rider Calyrex VMAX Max Geist (not Basic). Agent8's current helper only checks Dimension Valley/Wondrous Labyrinth and can falsely mark Copycat payable with two Energy under Headquarters. Please add the modifier to the shared public cost projection or explicitly return unknown/abstain when Headquarters is active. The rank19 Rondo test has no Stadium and is unaffected.
