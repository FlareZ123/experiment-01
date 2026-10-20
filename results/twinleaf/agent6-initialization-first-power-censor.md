# Rank-6 native Initialization observer: first eligible Power can conceal a second blocked Power

**Agent 6, 20 October 2026 UTC.** Evidence class: **source-code algorithm and isolated synthetic V8 execution** against the exact committed native-observer implementation. This does **not** demonstrate an actual Aichi game, a real Store bug, a tactical denied Ability, or a candidate win/loss.

## Tested mechanism

[The existing rank-6 native Store observer](../../simulation/twinleaf/agent39-live-initialization-window.cjs) enumerates candidate in-play Rule-Box, non-Future Pokémon with nonempty `powers`, but then sets `target=eligible[0]` and `targetPower=target?.powers[0]`. It only calls the genuine `IS_ABILITY_BLOCKED` predicate for **that single first Power**, returning `targetNativeAbilityBlocked` without checking later Pokémon or later printed Powers. The same observer correctly returns the **full list** in `eligibleRuleBoxPowerTargets`, so the existing observable data already admits other Powers.

I executed `initializationSnapshot` from the **exact committed source retrieved through GitHub** in an isolated JavaScript runtime, injecting a deterministic pure blocked predicate and two public candidate Pokémon with Rule Boxes:

| Public board slot | Printed Power | Mock-native block predicate |
| --- | --- | --- |
| Candidate Active, first in iteration | Exempt Ability | false (specifically exempt) |
| Candidate Bench, second in iteration | Nonexempt Ability | true (suppressed) |

Source Active was `Iron Thorns ex`; both candidate Pokémon were non-Future and eligible. The observer returned:

- `eligibleRuleBoxPowerTargets.length === 2`;
- `targetPrinting === 'Exempt ex TEST'`;
- `targetNativeAbilityBlocked === false`;
- the same injected block predicate evaluated on the second printed Power returned **true**.

This directly proves a **first-target-only measurement false negative** under the stated synthetic input. Any later in-play Ability that would be blocked can be missed if an earlier eligible Ability is exempt or protected. A different false negative occurs with two Powers on one Pokémon when its first Power is unblocked and a later one is blocked. These are **possible observer algorithm failures**; this test does not establish that any historical candidate board had the necessary mixture.

## Why this matters to the common v2 gate

[The current Agent41 rank-6 pressure classifier](../../simulation/evaluation/agent41-passive-rank6-pressure.cjs) sets `nativeCapabilitySuppressed` using `candidateTurn2.targetNativeAbilityBlocked===true` together with source-Active continuity. Therefore it can report `native-printed-power-block-unverified` even when the **same candidate board has another native-blocked Ability**. [Agent3's typed early-pressure gate](../../simulation/evaluation/agent3-source-first-pressure-kind.cjs) subsequently reads that classification. The failure is conservative, suppressing evidence; the snapshot should still not be promoted into a claim that a tactically useful Ability was denied.

This is distinct from Agent39's source-first t1 passive/attack typing correction and from the existing independent Store action-root attestor. No native experiment is counted or overridden by this synthetic check.

## Narrow integration recommendation

Within the existing observer, retain the existing first-target fields for backward-compatible historical diagnostics. Add **all eligible printed Powers** with each printing, Power name, and the actual native `IS_ABILITY_BLOCKED(store,state,owner,pokemon,power)` result. From the full set, derive `anyEligibleNativeAbilityBlocked` and `anyEligibleNativeAbilityUnblocked`; classify `no-eligible-Power`, `all-exempt/unblocked`, and `at-least-one-blocked` explicitly. Then have the shared passive classifier use the full-set evidence while retaining its real Store-root/turn/source-Active continuity checks.

Required pure regression: two candidate Powers with first exempt/second blocked must not be mistaken for zero blocked Powers; reversed order and a two-Power one-card case should agree. Required **real compiled Store** regression: protected or exempt printed Power plus another eligible unprotected Ability in a legitimate board, paired with read-only observer absent/present and identical accepted root digests. Do not count an arbitrary blocked Ability as tactically relevant without identifying a payable/callable denied use.

No existing source, workflow or integrator-owned file was modified by this investigation; the follow-up belongs in the canonical Agent41 observer integration. **Field remains 29/32 exact opponent 60s; zero competitively qualified games.**
