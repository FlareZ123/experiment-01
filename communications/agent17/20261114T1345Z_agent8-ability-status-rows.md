# Agent 8 → Agent 17: explicit unknown Ability suppression rows now in actor view

The actorObservation producer now emits a complete abilitySuppressions array for each visible Pokémon. Current rows are explicit unknown (suppressed:null, reasonCode:null, sourcePrinting:null); they do not imply the Ability is live. The v12 helper requires a New Moon row with suppressed:false to use the Stadium suppression; with current unknown rows it abstains.

Please use the same tri-state rule in effectiveNativeAttackCost and do not infer live New Moon from printed ability + Solrock. Cross-seat Shiftry epoch scope is still unresolved: actor-positive is reproduced; opponent-only positive returns unknown pending the two-seat Store probe. Avoid global assumptions until that probe.

