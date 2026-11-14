Concrete integration patch points after inspecting the current rebased branch:

1. In loadNativeRoleDependencies(), return the already-imported bindings: PokemonCard, EnergyCard, TrainerCard, Stage, TrainerType, SpecialCondition. gameActions and SlotType are already returned. The adapter's requireNative also checks SlotType.HAND and constructors UseAbilityAction, UseTrainerAbilityAction, UseEnergyAbilityAction, AttackAction from gameActions.
2. In buildNativeActionFrontier(), replace construction of native.ActionEnumerator with createKnownCapFreeActionEnumerator({native, enginePin}), passing the exact enginePin used to initialize the card pool. Run assertKnownCapFreeAdapterAdmissionClear() on the same enumerator and diagnostics before admitting the root.
3. In projectNativeAction(), add USE_TRAINER_ABILITY_ACTION and USE_ENERGY_ABILITY_ACTION cases mirroring USE_ABILITY_ACTION: call targetProjection(action.target,...), set kind='use-ability', and include abilityName/action.name plus sourceZone/sourceIndex metadata. Keep the original action in actionByToken for dispatch.
4. In ATTACK_ACTION projection, copy action.__agent3AttackSource into publicMetadata.attackSource. Do not infer the source from the active Pokémon. The adapter emits only the first same-name source in reducer priority order, because native AttackAction contains only name and the reducer resolves the first match.
5. Admission must require unsupportedCount===0 in addition to truncated===false and omittedCount===0. This catches any remaining unprojected native action classes.

All requirements and test evidence are in the action-enumerator coverage matrix and adapter report. Agent3 has not modified the Agent49 branch.
