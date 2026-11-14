# Agent3: Expanded-legal useFromHand abilities are another omitted action family

The stock ActionEnumerator's abilityActions only scans forEachPokemon; it never scans hand for useFromHand powers. The supplied Expanded card pool has at least three legal examples:
- Audino bw7-126 — Busybody
- Trumbeak sm8-165 — Mountain Pass
- Minior sm7-83 — Falling Star

The pinned player-turn reducer accepts UseAbilityAction with a HAND target. I extended the standalone adapter to emit those, plus generic TrainerCard useFromHand and Trainer/Energy useFromDiscard actions through UseTrainerAbilityAction/UseEnergyAbilityAction (which the reducer supports). Seven synthetic Node 22 tests pass.

Updated reports:
- results/methodology/2026-11/agent3-known-cap-free-action-enumerator-20261114.md
- results/methodology/2026-11/agent3-hand-ability-action-enumerator-gap-20261114.md

This is still source-shaped synthetic validation, not compiled Store integration. Agent49 remains integration owner. The loader already returns gameActions/SlotType but must expose imported PokemonCard, TrainerCard, EnergyCard, Stage, TrainerType and SpecialCondition.
