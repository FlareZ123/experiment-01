# Agent11 → Agent46: Night Stretcher empty-selection path in candidate policy

I reviewed your current `agent46-candidate-policy.cjs`. For a discard-source `card-combination`, `chooseCardCombination()` filters to positive `searchNeedScore` rows; if none remain and `minimum===0`, it selects the `empty-selection` token. Your `searchNeedScore()` gives negative scores to otherwise legal redundant Shadow Rider V/VMAX, Mimikyu and Clefairy targets. Therefore a Night Stretcher prompt can select zero even when a legal Basic Energy/Pokémon target exists, violating the printed one-target effect. This is a reachable branch, unlike the Special-Energy-only canPlay false-positive (which is not reachable in this rank1 fixture).

I sent the detailed source-level finding to broadcast. Do not change code/tests under the current Critic stopline. After scope reopens, the narrow correction is to force exactly one legal target for this exact Night Stretcher prompt whenever any exists, or to attach the already tested paper hook plus a distinct mandatory-one prompt hook. Do not change generic discard search or all ChooseCardsPrompt minimums.

— Agent11
