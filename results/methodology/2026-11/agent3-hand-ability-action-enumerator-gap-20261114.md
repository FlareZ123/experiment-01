# Pinned Twinleaf ActionEnumerator omits Expanded-legal useFromHand abilities

**Date:** 14 November 2026  
**Owner:** Agent3  
**Status:** source-level finding; research-owned adapter updated; not yet integrated or validated against the compiled pinned Store

## Finding

The pinned ActionEnumerator's abilityActions method only iterates Pokémon returned by forEachPokemon, and discardAbilityActions only visits PokemonCard instances in the discard pile. There is no scan of the player's hand for powers marked useFromHand.

The supplied card list contains at least three Expanded-legal Pokémon with useFromHand Abilities:

- Audino (bw7-126), Busybody;
- Trumbeak (sm8-165), Mountain Pass;
- Minior (sm7-83), Falling Star.

The pinned player-turn reducer accepts UseAbilityAction with a HAND target and resolves the power through the card's CheckPokemonPowersEffect. These are real paper Expanded actions that the stock ActionEnumerator does not propose.

The same reducer also supports UseTrainerAbilityAction for TrainerCard powers from hand/discard and UseEnergyAbilityAction for EnergyCard powers from discard. The stock ActionEnumerator's discardAbilityActions ignores non-PokemonCard entries. The adapter now supports those action types generically when a card exposes the matching useFromHand/useFromDiscard flag. This is implementation coverage, not a claim that each class currently has a legal Expanded example in the supplied pool.

## Adapter correction

Updated simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs:

- abilityActions scans hand PokemonCard powers marked useFromHand and emits UseAbilityAction with a HAND target;
- it also scans hand TrainerCard powers marked useFromHand and emits UseTrainerAbilityAction;
- discardAbilityActions now covers PokemonCard, TrainerCard and EnergyCard powers marked useFromDiscard, using the corresponding action constructor and DISCARD target;
- existing in-play Pokémon and attached Tool powers remain covered.

Seven synthetic Node v22.16.0 tests pass, including the hand Pokémon examples, Trainer hand/discard powers, and Energy discard powers. The tests do not instantiate the compiled pinned Store.

## Integration and limits

The runner already returns gameActions and SlotType; expose the already-imported PokemonCard, TrainerCard, EnergyCard, Stage, TrainerType and SpecialCondition bindings from loadNativeRoleDependencies. The adapter requires UseAbilityAction, UseTrainerAbilityAction, UseEnergyAbilityAction and AttackAction from gameActions.

This adapter remains source-shaped and unintegrated. It does not prove every card-specific CheckPokemonPowersEffect/CheckPokemonAttacksEffect mutation or all possible legal actions. The outer 256-item frontier cap remains a separate fail-closed requirement. No game or competitive result is claimed.
