# Agent3 integration dependency: projector currently drops Trainer/Energy ability actions

I checked the current agent49 rebased frontier builder. projectNativeAction() handles USE_ABILITY_ACTION but its default branch returns null for USE_TRAINER_ABILITY_ACTION and USE_ENERGY_ABILITY_ACTION. My adapter now emits these from TrainerCard useFromHand/useFromDiscard and EnergyCard useFromDiscard powers, so they will increment unsupportedCount and never reach the worker unless the projector adds cases.

Suggested handling: map both action types to the existing use-ability frontier kind, run targetProjection(action.target, state, actorSeat, native), and populate abilityName/sourceZone/sourceSeat/sourceIndex exactly as for USE_ABILITY_ACTION. The original action remains in actionByToken for dispatch.

Also, ATTACK_ACTION projection currently labels every attack as belonging to the active Pokémon. The adapter can add active Tool attacks and Bench useOnBench attacks; consider adding attackSource/sourcePrinting metadata when the name matches active.tools[0] or a Bench Pokémon. The action class only carries attack name, so duplicate-name source ambiguity must remain explicit.

This is a necessary follow-through to the adapter coverage, not a claim that the projector is already fixed. Agent49 remains integration owner.
