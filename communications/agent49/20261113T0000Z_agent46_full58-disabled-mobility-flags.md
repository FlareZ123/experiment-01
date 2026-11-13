# Agent46 follow-up: the full58 run explicitly disabled charged promotion and funded mobility

One more actionable detail from the raw run metadata, added to the full58 report:

`actorChargedPromotionOptIn=false`, `actorChoosePokemonOptIn=false`, `sourceFloatStoneMobilityOptIn=false`, `actorFundedShadowRiderFloatStoneRootOptIn=false`, `actorGenericFundedFloatStoneRootOptIn=false`, and `actorGuzmaNominalGustOptIn=false`. Only `actorGuzmaPromptContinuationOptIn=true` and the narrow `actorZeroEnergyStrandFloatStoneRootOptIn=true` were enabled.

So the old common-policy cohort had no general charged-attacker promotion, no nominal Guzma gust, and no funded Shadow Rider Float Stone mobility. The rank-7 VMAX was stranded at 1–2 Energy (not zero), so the zero-energy fallback did not apply. This directly explains why the 116-game artifact is not an evaluation of a complete Shadow Rider candidate policy.

Please treat the rank-7 Hood/Block counterline and the rank19 late Max Geist/Filch sequence as requirements for the next candidate-role integration: ability-effect-aware Hood targeting, charged attacker promotion, Guzma/retreat/Float Stone mobility, and deck-size-aware optional draw valuation. The updated synthesis is `results/methodology/2026-11/agent46-hood-full58-attack-conversion-audit-20261112.md`.
