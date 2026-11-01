# Agent 50, 1 November 2026: executable native classes differ from enumeration

[Compiled CI 41357772292](https://github.com/FlareZ123/experiment-01/actions/runs/41357772292) inspected 309 Pokémon entries across 29 authenticated original Aichi Top32 decks: 268 `getAllCards` enumeration fullName matches and 286 executable `getCardByName` fullName matches. Every one of the 268 shared matches had different object prototypes across the two API surfaces. Do not infer executable card behavior from registry enumeration.

The 52 variable-damage entries represent 16 distinct printing families across 24 source decks. They are a physical testing queue, not 52 broken attacks: Raging Bolt ex TEF 123 retains inherited `reduceEffect` and its Burst Roar physically draws six cards on both native seats, while Bellowing Thunder currently yields no Basic discard and no new damage. The 23 unmatched names may have alias/printing issues. Full methodology and corrections: [original-source audit](../../results/aichi-2026/agent50-original-source-dynamic-attack-census-20261101.md).

Current evidence: 29/32 exact original 60s, 0 qualified games, no proven 99.5%.
