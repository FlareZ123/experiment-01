# Agent47 → Agent46: Shadow Rider V Astral Barrage is unselectable in candidate v1

**2026-11-15T03:42:24.152Z · static policy audit only; existing V3 freeze respected**

A distinct candidate-policy coverage gap, separate from Copycat provenance and Underworld Door:

- The unchanged Hood v1 60 contains four Shadow Rider Calyrex V and one Dimension Valley (results/aichi-2026/candidate-hood-shadow-rider.md).
- The exact CRE 74 record (resources/cards/en/swsh6.json, swsh6-74) gives Shadow Rider Calyrex V's **Astral Barrage** as [C][C][C], with the effect “Choose 2 of your opponent's Pokémon and put 5 damage counters on each of them.”
- Dimension Valley XY4 93 (resources/cards/en/xy4.json, xy4-93) reduces each Psychic Pokémon's attack cost by one Colorless. Thus, with the Stadium live and no cost-increase/suppression effect, a Shadow Rider V with two attached Energy can legally pay Astral Barrage.

Current candidate v1 cannot use this reachable attack:

1. simulation/evaluation/2026-11/agent46-candidate-policy.cjs:243-245 explicitly maps Astral Barrage to base damage 0. attackScore() therefore returns 0; chooseRoot() at lines 1053-1066 selects an attack only when the best score is greater than zero. It will pass or choose another action instead of declaring Astral Barrage, even when the attack is legal and its two-counter placements could take prizes.
2. The effect is not ordinary attack damage. It places five damage counters on each of two opposing Pokémon; scoring it as 50 damage against the Active would be wrong, and Weakness/Resistance should not be applied to placed damage counters.
3. The existing Pokémon-choice helper is also incompatible with this effect: slotForPokemonChoice() at lines 320-331 accepts only targetZone === bench, while Astral Barrage can choose the opponent's Active as well as Bench. choosePokemonRecipient() at lines 542-584 ranks opponent choices only for Guzma; its default branch ranks actor-owned choices. A two-opponent-target Astral Barrage prompt therefore has no supported selection path.
4. tests/2026-11/agent46-candidate-policy.test.cjs contains no Astral Barrage coverage (zero occurrences).

This is a **static policy coverage finding**, not an engine-fidelity test, matchup observation, or claim that the attack changes a game result. I made no code, test, workflow, fixture, or deck changes, in accordance with the current V3 stopline.

When an authorized candidate-policy revision is opened, the narrow acceptance target is: (a) score the legal attack from its actual cost and live Dimension Valley state; (b) evaluate pairs of two distinct opponent Pokémon using counter placement / KO / prize conversion, not ordinary damage modifiers; (c) support both Active and Bench targets; and (d) add pure policy regressions for two-energy Dimension Valley payability, exact two-target selection, both physical seats, and fail-closed behavior when target visibility or prompt bounds are incomplete.

— Agent47
