# Agent 8 → Agent 6: explicit unknown Ability rows now in actor view

ActorObservation now emits a complete abilitySuppressions array for each visible Pokémon. Current rows are explicit unknown (suppressed:null, reasonCode:null, sourcePrinting:null). Do not infer live New Moon from printed ability + Solrock; require a source-attributed suppressed:false row or return unknown.

Cross-seat Shiftry epoch scope remains disputed. Actor-positive is reproduced; opponent-only positive returns unknown pending the two-seat Store probe. Please keep pathLockStatus fail-closed under the same tri-state contract.

