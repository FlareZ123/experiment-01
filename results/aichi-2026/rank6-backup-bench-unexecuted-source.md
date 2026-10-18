# Rank-6 backup-Bench attack: actual-source verification failed before the Bench action

**Agent 33, 18 October 2026. Evidence class: negative compiled-policy execution test and source-control-flow inspection.** This experiment does not establish the value or legality of a *fully executed* backup-Bench counterline and carries no matchup win-rate evidence.

## Original source and tactical premise

Rank-6 published Iron Thorns ex TWM 77 has **Volt Cyclone** for 140 damage and an effect to move an Energy to one of its Benched Pokémon. Its retreat cost is four Colorless. The supplied advanced rulebook permits resolving attack damage even when an independent effect cannot apply. A source opening with no target may therefore attack without moving the attached Double Colorless Energy; adding a Benched copy changes the Energy-movement obligation and future switch/attacker options.

Actual physical seed `1819063225` against rank-1 Shadow Rider contained a spare **Iron Thorns ex TWM** in rank6's own hand immediately before its first decision, alongside Guzma & Hala. The [successful Eri/Faba payment contrast](rank6-discard-payment-preservation.md) preserved the same 140 Volt Cyclone against Marshadow and subsequent Shadow Rider Pale Moon-GX declaration. Both weak-bot games terminated with champion engine winner, unqualified for competitive inference.

## Red compiled experiment

A source-dealt [backup-Bench fork](../../simulation/twinleaf/rank6-backup-bench-source-fork.cjs) used identical rank1/rank6 published 60s, seed `1819063225`, own-hand-only opt-in policy, and actual root Store attack/Bench observer. The intended branch would play the held backup before the ordinary DCE attachment. The runner was designed to fail unless the source-hand and face-down Prize identities matched, both genuine Volt Cyclone attacks resolved, the alternate had one more Benched Iron Thorns, and the first divergence came from a legal root Store action.

[Manual CI run 39142972663](https://github.com/FlareZ123/experiment-01/actions/runs/39142972663) at revision `0d4e7bb02b17e300e507989c23e441eca46045d4` **failed** at source runner line 98:

`AssertionError: The opt-in policy must actually play a backup`.

The earlier source 24-seed broad trial and discard-payment fork both passed within that same job before the backup test. The failed backup artifact contains no validated branch-comparison JSON. In particular, this is **not evidence that the game engine rejected a legal Benching action**: no such action was attempted.

## Diagnosis and next falsification gate

Source inspection identifies a control-flow omission in [the optional broad source policy](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs). Its backup-placement check lives inside `continueAfterSearch()` *after the Stadium is in play*. However, on the observed opening G&H first retrieves and plays **Thunder Mountain Prism Star**; that function sets phase `attach`. The next policy decision handles phase `attach` by attaching DCE directly, skipping the optional backup check. The fail-closed red run is consistent with that exact source path. A subsequent attempted in-place phase fix was rejected by the repository write tool, so there is **no claimed repaired or passing rerun**.

The next reviewable step is for a normal researcher to repair and independently test the opt-in post-Stadium phase before any attempt to compare terminal results. Record the source-owned visible Bench at the first decision, real spare-Basic `PlayCardAction`, Energy moved during Volt Cyclone and any later forced Pale Moon-GX knockout. The pinned engine has a separately documented [Pale Moon delayed-effect Active-exit discrepancy](rank10-pale-moon-source-rule-discrepancy.md); a comparison involving switching must either verify the relevant opt-in correction or preserve paper-fidelity as false.

**Conclusion:** source backup-Bench effect remains an unexecuted hypothesis. Source counts 29/32 and competitive-qualified games remain zero.
