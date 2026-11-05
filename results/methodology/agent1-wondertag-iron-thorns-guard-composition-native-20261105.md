# Native Wonder Tag owner-prompt composition with the existing Iron Thorns entry lock guard

**Agent 1 | 5 November 2026 | pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Evidence type:** eight exact artificial original-printed-60 native board placements, native `Store.dispatch`, and read-only hand/Bench/state observations. **Competitively qualified games: zero.**

## Purpose

The new Agent8 owner's Wonder Tag policy initially passed the genuine native positive search/Supporter custody test while failing its Iron Thorns ex negative control. The failing [native run 42032309428](https://github.com/FlareZ123/experiment-01/actions/runs/42032309428) showed 17/18 total subtests passing, including exact physical Supporter transfer and reveal/shuffle in both physical seats. Its negative original rank1 Shadow Rider versus rank6 Iron Thorns synthetic board offered `ConfirmPrompt` under active Initialization.

This precise entry-lock fidelity defect and its compatibility correction had already been independently documented by [Agent31 in October](../twinleaf/lele-entry-ability-lock-timing.md); likewise [Agent11 studied Dedenne-GX/Crobat V](../twinleaf/dedenne-crobat-entry-lock.md). We preserve that authorship and original evidence rather than recasting the prior bug as a new discovery. The new question is whether **the existing** `installLeleEntryAbilityLockHook` correctly composes with the recently introduced owner-bound Wonder Tag prompt adapter in both physical seats and under both reversible wrapper installation orders.

## Reproduction and two native CI runs

[Native run 42033407374](https://github.com/FlareZ123/experiment-01/actions/runs/42033407374) passed the [two-seat timing probe](../../tests/agent1-wondertag-iron-thorns-entry-timing.native.test.cjs) and repeated Agent1's same-seed baseline sham regression. Native rank1-versus-rank6 controlled stages each returned:

- Before entry, exact physical Lele in owner's **hand**: `IS_ABILITY_BLOCKED=false`.
- After native `PlayCardAction`, same physical Lele in owner **Bench**: `IS_ABILITY_BLOCKED=true`, while the uncorrected initial `ConfirmPrompt` remained unresolved.
- Rank1-versus-rank10 Regidrago V nonlocking controls: `false` before and `false` after, with ordinary Wonder Tag `ConfirmPrompt`.
- Both physical owner seats passed, four native original-printed board assignments total. No mutation of upstream Twinleaf or registered printed card multisets was made.

The source ordering explains it: pinned `Store.propagateEffect` invokes `TapuLeleGX.reduceEffect` during `PlayPokemonEffect` while Lele is still in the hand, before `playPokemonReducer` transfers the Basic to its target Bench. Iron Thorns checks `StateUtils.findCardList(state,card) instanceof PokemonCardList` before suppressing Rule Box Abilities. The official paper card text applies Initialization to eligible in-play Pokémon, including a newly Benched Lele, but the premature engine probe sees it in hand.

[Native run 42033885124](https://github.com/FlareZ123/experiment-01/actions/runs/42033885124) completed **SUCCESS** at commit `a9f96bd76776b75bf26124e815c0259fde1e9b66`. [Eight-case integration test](../../tests/agent1-wondertag-entry-hook-owner-policy-composition.native.test.cjs) exercised:

| Existing wrapper order | Owner seat | Opposing Active | Observed unresolved native prompt | Owner Wonder Tag offer count | Result |
| --- | --- | --- | --- | --- | --- |
| Guard first, owner prompt inside | 0 and 1 | Iron Thorns ex | none | 0 | expected |
| Guard first, owner prompt inside | 0 and 1 | Regidrago V | `ConfirmPrompt` | 1 | expected |
| Owner prompt first, guard inside | 0 and 1 | Iron Thorns ex | none | 0 | expected |
| Owner prompt first, guard inside | 0 and 1 | Regidrago V | `ConfirmPrompt` | 1 | expected |

All eight placed the **same physical Lele** on its owner Bench and removed it from the owner's hand; both wrapper orders restored the original `TapuLeleGX.prototype.reduceEffect` descriptor at experiment exit. In this fixture the unlocked `ConfirmPrompt` was deliberately left unresolved, so only prompt **offering**, not Supporter acquisition or later owner turns, is shown. The separate Agent8 positive and zero-choice tests in run 42032309428 provide evidence of those later prompt settlements under unlocked conditions.

Both new tests and workflow selection are in the existing [Agent1 manual native workflow](../../.github/workflows/agent1-issue25-baseline-sham-v9-native.yml). Existing `simulation/twinleaf/lele-entry-ability-lock-hook.cjs` and upstream vendor code were left untouched.

## Integration action and limits

The original Issue25 source registration `results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json` already freezes `leleEntryAbilityLockCorrection:true`; `simulation/twinleaf/headless.cjs` installs the existing guard when this request flag is true. **Do not classify the failing unguarded Agent8 synthetic negative as evidence that the selected headless profile lacks the guard.** Its fixture did not opt into the existing correction.

The remaining integration task is to verify the exact selected canonical native two-seat executing closure includes both the guard and the newer owner Wonder Tag prompt resolver, then report genuine owner-held/played Lele, accepted affirmative prompt, Supporter physical transfer, opponent reveal, required numeric shuffle validation, legal follow-up roots, and all errors/caps. A current Agent3 v15 runner independently changes `withNumericShuffleValidator` only in its B treatment. That creates a **second experimental intervention** because native ShuffleDeckPrompt validation otherwise rejects some valid numeric permutations; causal attribution to Wonder Tag requires holding the shuffle correction fixed across every arm or an independent shuffle-matched counterfactual.

The eight controlled board placements are **not** realistic randomly dealt game samples. No tournament clock, competent opponent policy, matchup prevalence, full paper-rules closure, source/candidate win rate or fixed best deck was demonstrated. Repository benchmark status remains **29/32 authenticated complete source inventories**, ranks 23/25/28 missing, **zero qualified games**, and **no verified 99.5% achievement**.
