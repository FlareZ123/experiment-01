# Pinned, research-owned adapter removing Twinleaf ActionEnumerator's eight-candidate caps

**Date:** 14 November 2026  
**Owner:** Agent3  
**Status:** standalone adapter prototype; not integrated into the V3 runner or validated against the compiled pinned Store

## Motivation

The pinned Twinleaf ActionEnumerator at commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05 has a MAX_CANDIDATES_PER_TYPE limit of eight in eight action families. The previous cap-audit report documents the exact source methods and the runner's missing admission gate.

A fail-closed detector prevents capped roots from being admitted, but it does not let the game continue when a family legitimately has more than eight candidates. This adapter is a second option: replace only the eight capped instance methods while retaining the pinned ActionEnumerator's original enumerate() method and its uncapped Stadium, use-Stadium, retreat, attack and PassTurn methods.

## Implementation

Added:

- simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs
- tests/2026-11/agent3-known-cap-free-action-enumerator.test.cjs

The adapter is hard-pinned to the exact Twinleaf commit above and verifies the expected ActionEnumerator methods, action constructors, card classes and enums before patching the instance. It replaces the eight capped methods with source-shaped uncapped implementations, preserving their family order and existing rules:

- evolution candidates retain the same eligible-Pokémon and hand-order traversal;
- Basic plays retain the original first-empty-Bench target by obtaining it from the pinned method, then extend the hand-index list beyond eight;
- Energy candidates retain the source's fullName deduplication and per-Pokémon target order;
- Tool, discard Ability, Item, Supporter and in-play Ability candidates retain the source predicates and traversal order;
- uncapped methods are left on the original instance.

The adapter records a non-writable pin/schema marker on the instance. It also adds source-confirmed omissions that the pinned enumerator misses: attached Tool powers, active Tool/Bench-usable attacks, and useFromHand/Trainer/Energy discard ability actions. It intentionally does not claim that the entire paper Expanded action space is complete; it only removes the eight identified caps and adds these explicit action sources for this pinned enumerator. Unsupported actions, any other source omissions, and the outer adapter's separate 256-item cutoff remain separate gates.

## Validation and limits

Nine Node v22.16.0 tests pass locally:

1. A synthetic reference ActionEnumerator mirroring the pinned source emits eight per family; the adapter emits all nine candidates in all eight families and preserves family ordering.
2. Energy fullName deduplication is preserved while target combinations are uncapped.
3. An unreviewed engine pin or missing native exports fails closed.
4. When no known cap is hit, adapter output is deeply equal to the synthetic reference enumerator output;
5. attached Tool powers, active Tool attacks and Bench-usable attacks are enumerated;
6. the original Paralysis and Sleep attack gate is preserved;
7. Expanded-legal hand Pokémon abilities and Trainer/Energy hand/discard ability action types are emitted;
8. adapter-path admission rejects a missing/wrong-pin marker, local frontier truncation, and unprojected actions;
9. same-name attacks follow native first-match priority and retain non-enumerable source metadata.

This is a source-shaped synthetic test, not a run against the compiled pinned Twinleaf Store. No V3 game, matchup, CI run, or competitive result is claimed.

## Integration requirements

The current Agent49 loader already imports cardActions and gameActions and also imports PokemonCard, EnergyCard, TrainerCard, Stage, TrainerType and SpecialCondition. Its returned native dependency object currently omits those six classes/enums; expose them (or pass an equivalent typed bundle) before constructing this adapter. gameActions already carries AttackAction and UseAbilityAction.

The V3 frontier builder can instantiate the adapter with the actual frozen engine pin, then call its ordinary enumerate() method. Use assertKnownCapFreeAdapterAdmissionClear() to require the matching adapter marker/pin, all four coverage flags, and removedPerFamilyCap=8; reject the outer frontier's truncated flag, nonzero omittedCount, or nonzero unsupportedCount. The 256-item cap is not removed by this adapter. The current projector also needs explicit USE_TRAINER_ABILITY_ACTION and USE_ENERGY_ABILITY_ACTION cases before these newly emitted actions can reach the worker. Preserve the returned marker in per-root diagnostics. The synthetic adapter test is now included in the existing bounded contract_only lane; no CI run has yet validated the current head. The separate cap-audit fallback test remains outside that lane. Do not create another workflow.

Agent49 remains the V3 integration owner. This standalone prototype is a reviewable option, not a change to the runner, vendor submodule, CI or fixture policy.


## Additional source-confirmed action omissions now covered by the prototype

The pinned ActionEnumerator's abilityActions method loops only each in-play Pokémon card's own powers. It does not inspect PokemonCardList.tools. This omits attached Tool abilities. Forest Seal Stone (swsh12-156) and Sky Seal Stone (swsh12pt5-143) are Expanded-legal Pokémon Tools in the supplied card pool. Their pinned Twinleaf implementations set useWhenInPlay and add their power to CheckPokemonPowersEffect when attached to a qualifying Pokémon V; the normal UseAbilityAction reducer resolves that checked power. The adapter now adds useWhenInPlay powers from each attached TrainerCard tool, using the owning Pokémon's target.

The pinned ActionEnumerator's attackActions method returns only the active Pokémon's printed attacks. The pinned playerTurnReducer also accepts attacks from Bench Pokémon whose attack has useOnBench, and CheckPokemonAttacksEffect contributes attacks from player.active.tools[0].attacks. The supplied card pool contains 22 Expanded-legal Trainer cards with attacks, including G Booster (bw10-92), G Scope (bw10-93), Technical Machine: Evolution (sv4-178), and multiple Technical Machines/Scrolls. The adapter now adds active Tool attacks and Bench attacks marked useOnBench while retaining the original active-condition gate.

The loader must additionally expose SpecialCondition (already imported locally) to the adapter. This remains a source-shaped synthetic prototype, not compiled-engine validation. The attached-tool and attack additions cover these explicit sources; they do not prove that all card-specific CheckPokemonPowersEffect/CheckPokemonAttacksEffect mutations or all possible action types have been enumerated.


## Hand-ability coverage

The pinned ActionEnumerator's abilityActions method only visits Pokémon returned by forEachPokemon, while discardAbilityActions only visits PokemonCard instances in the discard pile. It never scans the actor's hand for useFromHand powers. This misses real Expanded-legal cards in the supplied card pool: Audino (bw7-126, Busybody), Trumbeak (sm8-165, Mountain Pass), and Minior (sm7-83, Falling Star). The pinned player-turn reducer accepts UseAbilityAction with a HAND target.

The adapter now emits UseAbilityAction for Pokémon useFromHand powers in hand, and UseTrainerAbilityAction for TrainerCard useFromHand powers. Its discardAbilityActions also emits UseTrainerAbilityAction and UseEnergyAbilityAction for TrainerCard/EnergyCard powers marked useFromDiscard, matching the corresponding reducer action branches. The generic Trainer/Energy paths are implemented because the engine supports them; this is not a claim that every such category has a currently legal Expanded card example.

The native dependency bundle must expose SlotType.HAND (the full SlotType enum is already returned), plus the card classes/enums and SpecialCondition described above. gameActions already contains the additional ability action constructors.


## Attack source fidelity

AttackAction in the pinned engine carries only an attack name. The reducer builds its candidate attack list in this order: active Pokémon attacks, Bench attacks with useOnBench, then CheckPokemonAttacksEffect attacks (including active.tools[0].attacks), and resolves by the first matching name. The adapter now mirrors that priority, emits only the first occurrence of each name, and attaches a non-writable/non-enumerable __agent3AttackSource object to the retained action. The metadata records sourceKind, sourceSlot, sourceIndex, sourceCardName, sourceCardFullName and attackName without changing the native action payload.

This avoids falsely presenting same-name sources as separately selectable when the native reducer cannot distinguish them. The V3 projector should copy this metadata into the frontier row's public metadata; it must not infer a Bench/Tool source from the active Pokémon. The actionSignature may continue to use the native name because the adapter has already deduplicated according to reducer first-match semantics.
