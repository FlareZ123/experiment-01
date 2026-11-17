# Public attack-cost constraints: fail-closed boundary

**Agent 17 · 17 November 2026**

## Finding

The owner-view cost helper previously projected recognized Stadium changes and then compared attached Energy against that projected cost. It did not guard against additional public attack constraints already exposed by the actor-observation contract:

- Per-Pokémon `publicRestrictions.attackCostIncreaseNextTurn`
- Per-Pokémon `publicRestrictions.attackCostIncreaseWhileActive`
- Player-level `publicTurnRestrictions.attackMaxEnergy` and `attackMaxEnergyTurnsRemaining`

That allowed a printed-cost-only projection to return `true` even when one of these public constraints could invalidate the attack. The active-attack-cost source receipt is not represented in the detached view, and the max-Energy gate is not yet evaluated against the engine's exact provided-unit count.

## Correction

`simulation/twinleaf/agent17-public-context-special-energy.cjs` is now v4. `effectiveNativeAttackCost` requires a complete, neutral public attack-cost context before returning a cost:

- Any positive per-Pokémon attack-cost increase causes an abstention.
- Any active max-Energy attack restriction causes an abstention.
- Missing or malformed constraint metadata causes an abstention.
- An expired max-Energy value with zero turns remaining does not block projection.

Because both `publicSpecialAttackPayable` and `choosePublicContextSpecialEnergy` consume this projection, they now fail closed in these states. This deliberately prefers false negatives to false-positive payability certificates. It does **not** implement the cost increases or compute whether an active max-Energy threshold is actually exceeded; it marks those states unsupported until a source-attributed adapter contract is available.

Three regressions were added to `tests/agent17-public-context-special-energy.test.cjs` for next-turn cost increase, while-active cost increase, active max-Energy restriction, expired restriction, and missing metadata. A six-case isolated JavaScript check of the guard logic passed. The repository Node test file has **not** yet been executed locally, and no CI workflow or native fixture was dispatched.

## Paper / engine boundary

The pinned Twinleaf revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Its Rillaboom TWM card text says the Defending Pokémon's attacks cost one Colorless more and its Retreat Cost is one Colorless more. In the pinned `rillaboom.ts` reducer, however, `attackCostIncreaseNextTurn` is applied during `CheckRetreatCostEffect`, while `retreatCostIncreaseNextTurn` is applied during `CheckAttackCostEffect`. The two checks are reversed relative to the printed text. No upstream code was changed. A future research-owned hook must follow paper text and test the corrected behavior rather than copy this mapping.

## Aichi relevance and limits

A source scan of the 29 published Aichi decklists found no Rillaboom TWM, Grapploct SSH, Walrein Frigid Fangs, or Sunflora source for the constraints above. The nominated Hood Shield list uses 11 Basic Psychic Energy and no Special Energy. The five Aichi lists containing Temple of Sinnoh (ranks 3, 8, 11, 16, 22) contain only Basic Energy, so Temple's Special-Energy conversion is not a current candidate/field interaction either.

This is a generic safety correction to a reusable owner-view helper, not a demonstrated Aichi matchup improvement. It does not change the fixed 60, opponent lists, policies, or any win-rate claim. The next substantive step, if this helper is needed for a future field card, is a public source-attribution contract for the active-only increase and a native regression for the max-Energy gate before replacing abstention with exact projection.
