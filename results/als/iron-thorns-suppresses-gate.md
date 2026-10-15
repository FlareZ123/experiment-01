# Aichi champion's Radiant Gate loses applicability under active Iron Thorns ex

**Agent 10, 15 October 2026. Evidence type:** source-verified opponent deck composition plus printed-card rule implication. This is a narrow conditional analysis, not a measured win-rate or an assertion about full-match outcomes.

## Three relevant placements

From `results/aichi-2026/full-decklists.json`, the three published Aichi 2026 Top 32 Iron Thorns decks at **ranks 6, 24 and 29** each contain precisely **four Iron Thorns ex** and **no other Pokémon**. On a valid opening, the player's Active Pokémon must therefore be Iron Thorns ex. The [source-check script](../../scripts/aichi_iron_thorns_gate_lock.cjs) and [test](../../tests/aichi_iron_thorns_gate_lock.test.cjs) assert exact published deck composition and card text.

The bundled card pool `resources/cards/en/sv6.json`, `sv6-77` (Iron Thorns ex, TWM 77), gives `Initialization`:

> As long as this Pokémon is in the Active Spot, Pokémon with a Rule Box in play (both yours and your opponent's) have no Abilities, except for Future Pokémon.

The champion's `Radiant Eternatus` CRZ 105 is a Basic Dragon Pokémon with the **Radiant Pokémon Rule**, thus it possesses a Rule Box, and is **not a Future Pokémon** (`resources/cards/en/swsh12pt5.json`, `swsh12pt5-105`). Its `Climactic Gate` is an Ability triggered by entering the Bench.

**Conditional tactical fact:** While an opponent's Active Iron Thorns ex has an unsuppressed Initialization, Radiant Eternatus's Climactic Gate is unavailable. Searching, drawing or retrieving Radiant does not bypass this card-text constraint. The full published opponent lists begin with that Active lock whenever their opening is valid. Unless some effect shuts off Initialization or otherwise changes the governing state, this remains true even after the champion has all Radiant Gate resources.

## Consequences for the opening access model

Our [direct opening access](radiant-eternatus-opening.md) and [Forest Seal Stone extension](forest-seal-radiant-access.md) give **54.6660% first-turn two-VMAX access** in the expanded direct-plus-VSTAR resource model after mandatory draw, conditional on valid opening. This is the maximum *modeled resource accessibility under the assumed lines* with ability availability taken for granted. The lock above can suppress the actual Gate from that state.

Therefore, a simulator or deck optimizer must not reward that 54.6660% as a functional setup probability against these three opposing decks without modeling opposing Ability suppression and escape lines. A successful Forest Seal Stone **Star Alchemy search** by itself cannot override the Gate's suppression. Item cards can still work under a pure Initialization lock, absent independent Item lock or other restrictions.

## Cross-check against pinned Twinleaf

The pinned Twinleaf `iron-thorns-ex.ts` declares `Initialization` as an Ability lock and tests target `hasRuleBox()` and `hasTag(FUTURE)` while Iron Thorns is Active. Its `card.ts` lists `CardTag.RADIANT` among `hasRuleBox()` cases. The research team's engine regression harness should verify Gate blocking under both opponent and self-owned Iron Thorns; code presence alone does not establish end-to-end engine fidelity. A second exception is that an available Ability-lock suppression effect can change the result, and sources should be checked for every such proposed escape.

**Interpretation:** 3 of 32 published field placements are locked into the Iron Thorns-only Basic archetype, a strategically meaningful slice of the benchmark. It does not follow that the champion cannot win these games; attackers, Energy attachments, other Abilities/Tools under specific conditions, and alternate paths may be sufficient. Complete games and matchup evidence are still required before judging deck strength. The 99.5% target is unproven.
