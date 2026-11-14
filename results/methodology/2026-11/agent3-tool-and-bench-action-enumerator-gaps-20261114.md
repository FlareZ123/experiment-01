# Twinleaf ActionEnumerator omits Expanded-legal attached Tool abilities and attacks

**Date:** 14 November 2026  
**Owner:** Agent3  
**Status:** source-level finding; research-owned adapter updated; not yet integrated or validated against the compiled pinned Store

## Evidence

The pinned ActionEnumerator at a9905a76a6c4103ba4b6cb9a49e86bad795c5c05 has two further omissions beyond its eight per-family caps:

1. Its abilityActions method iterates only the powers on each card returned by forEachPokemon. It does not inspect PokemonCardList.tools.
2. Its attackActions method returns only active.getPokemonCard().attacks.

The pinned engine supports both missing sources:

- Forest Seal Stone and Sky Seal Stone define useWhenInPlay powers. Their card implementations add the Tool's power to CheckPokemonPowersEffect when the Tool is attached to a qualifying Pokémon V. The player-turn reducer resolves that power through UseAbilityAction and CheckPokemonPowersEffect. The ActionEnumerator's abilityActions never sees the Tool power because it does not traverse cardList.tools.
- CheckPokemonAttacksEffect initializes its attacks from player.active.tools[0].attacks. The player-turn reducer also adds attacks from Bench Pokémon whose attack has useOnBench. The ActionEnumerator's attackActions returns only the active Pokémon's own attacks, so it omits active Tool attacks and Bench-usable attacks.

## Paper Expanded relevance

The supplied card list marks these attached Tool abilities Expanded legal:

- Forest Seal Stone (swsh12-156), Star Alchemy;
- Sky Seal Stone (swsh12pt5-143), Star Order.

It also contains 22 Expanded-legal Trainer cards with attacks, including G Booster (bw10-92), G Scope (bw10-93), Technical Machine: Evolution (sv4-178), and multiple Technical Machines and Scrolls. This is not a hypothetical API surface: the supported card pool contains real cards requiring the missing action sources.

## Adapter correction

Updated simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs:

- abilityActions now emits UseAbilityAction for useWhenInPlay powers on attached TrainerCard tools, using the owning Pokémon's target. The native engine's CheckPokemonPowersEffect remains responsible for the card-specific validity/lock checks.
- attackActions now includes active Pokémon attacks, Bench attacks with useOnBench, and active.tools[0].attacks, while retaining the pinned Paralysis/Sleep gate.

Updated tests/2026-11/agent3-known-cap-free-action-enumerator.test.cjs. Six synthetic Node v22.16.0 tests pass, including attached Tool ability, active Tool attack, Bench-usable attack, and preservation of the status gate.

## Integration and limits

The current Agent49 runner loader imports SpecialCondition locally but does not return it in the native dependency object. The adapter also requires the already-imported PokemonCard, EnergyCard, TrainerCard, Stage and TrainerType bindings; expose them, and pass gameActions (which already contains AttackAction and UseAbilityAction).

This is still synthetic source-shaped validation. It has not run against the compiled pinned Store, and it does not cover every possible card-specific mutation to CheckPokemonPowersEffect or CheckPokemonAttacksEffect. The outer 256-item frontier cutoff remains a separate fail-closed requirement. No game or competitive result is claimed.
