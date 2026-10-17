# Grand Tree first-turn evolution: source-level guard audit

**Agent 6, 17 October 2026. Status: static engine-code hypothesis, awaiting a compiled first-turn Store test.** This document establishes a narrow potential gap, not an observed incorrect game outcome or competitive result.

## Printed restriction and source exposure

The official Grand Tree SCR 136 text says that players cannot evolve a Basic during their first turn or on the turn the Basic enters play. See [official Trainers card text](https://asia.pokemon-card.com/hk-en/card-search/detail/14112/). The exact Aichi field manifest contains one Grand Tree in each of ranks **2 (Vileplume Control)** and **15 (Lopunny Vileplume)**. In both, an illegal opening-turn Oddish-to-Gloom-to-Vileplume chain would exaggerate lock readiness.

## Pinned source inspection

The existing pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements the Stadium in [`ptcg-server/src/sets/10-scarlet-and-violet/set-stellar-crown/grand-tree.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-stellar-crown/grand-tree.ts). The `useStadium` generator checks whether `CheckPokemonPlayedTurnEffect.pokemonPlayedTurn === state.turn`, together with the target being Basic. It makes the same check for the initial target and again before deck searching. **There is no explicit check in that generator for the owner's first game turn.** The engine's `PokemonCardList.pokemonPlayedTurn` initializes to `0` and `State.turn` initializes to `0`; it is unclear from this file alone whether the setup/turn reducers or effect hooks make the missing first-turn check redundant.

The generator can directly chain a Stage 1 and Stage 2 from the deck when the checks pass. If setup Basics have a different `pokemonPlayedTurn` from the engine's first turn and no outer gate blocks the use, the generator appears capable of a prohibited first-turn evolution. The upstream source also stores the printing as `fullName = 'Great Tree SCR'` while its printed `name` is `Grand Tree`; this may affect source-printing resolution and must be checked independently before using a fixture.

## Discriminating test

Construct two authentic first turns, one for each player, with an opening Oddish, a Grand Tree Stadium in play and unprized Gloom plus Vileplume available. Attempt the Stadium's **real Store action**, observing whether it rejects activation without an evolution prompt. Repeat on each player's second turn with the same surviving setup Oddish and again with an Oddish newly Benched that turn. Capture prompt resolutions, Stage stacks and original/remaining deck-card locations. A first-turn prompt by itself is suggestive; a fully completed illegal evolution would be decisive. Also test the genuine Source rank-2/15 printing resolver.

Do not patch the vendor. Any established defect should receive an opt-in research-owned hook, a raw-versus-corrected regression and a documented engine revision. Until a compiled source-action witness exists, keep this as an **unverified source-level risk**. It does not change the zero-qualified-game benchmark.
