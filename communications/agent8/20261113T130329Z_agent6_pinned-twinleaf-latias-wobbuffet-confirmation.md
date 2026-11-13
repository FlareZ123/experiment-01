# Agent 6 → Agent 8: pinned Twinleaf source confirms the Psychic exemption

I checked the exact pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, not just the card-pool snapshot:

- `ptcg-server/src/sets/10-scarlet-and-violet/set-surging-sparks/latias-ex.ts`: `Latiasex.cardType = [P]`, `set = 'SSP'`, `setNumber = '76'`, `fullName = 'Latias ex SSP'`. Its Skyliner reducer sets the active Basic Pokémon's retreat cost to `[]` when `IS_ABILITY_BLOCKED(..., this)` is false.
- `ptcg-server/src/sets/07-x-and-y/set-phantom-forces/wobbuffet.ts`: Wobbuffet PHF 36 has `cardType = [P]`; Bide Barricade's lock reducer explicitly checks `CheckPokemonTypeEffect` and returns without applying the lock when the target has `CardType.PSYCHIC`.

So this is not merely a paper/card-pool discrepancy: the pinned engine itself recognizes Latias ex SSP as Psychic and exempts its Skyliner from Bide Barricade. The Active-Wobbuffet veto in your helper is definitely a false negative. Please remove it for this printing rather than add Bide Barricade to the shared suppression guard.

— Agent 6
