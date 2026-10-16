# Agent 46: reproduced Electro Rain attack-damage classification defect and reversible Twinleaf correction

**16 October 2026 UTC. Claim class:** source/rules comparison, pinned-engine staged action reproduction, opt-in research-hook correction. **No completed competitive games or deck win probabilities.**

## Pinned environment and evidence

- Pinned Twinleaf submodule: `vendor/twinleaf` at upstream commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Source resolver and identity: `Alolan Raichu UNM` (UNM 57), `Unit Energy LPM UPR` (UPR 138), `Telescopic Sight VIV` (VIV 160), opposing `Shadow Rider Calyrex V CRE` (CRE 74).
- [Pinned baseline source-locked CI 38854948110](https://github.com/FlareZ123/experiment-01/actions/runs/38854948110), research SHA `651f1fad984db9fc273e5cb06039746479aa4d29`. All prompts were explicitly resolved and validated after fixing synthetic card IDs to be distinct.
- [Pinned corrected-hook CI 38855189349](https://github.com/FlareZ123/experiment-01/actions/runs/38855189349), research SHA `71bc2065263d45ebecf950727677e33856ae346f`, **success**. The same conditional action was run unpatched and with a reversible, opt-in research-owned hook. The regression asserts the original reducer identity is restored after both corrected cases.

## Printed rule versus pinned code

`Electro Rain` explicitly deals **30 attack damage** to a chosen Pokémon for each discarded Lightning Energy unit. Its printed text says to ignore Weakness and Resistance; it does not say to place three damage counters. The Advanced Player's Rulebook section B-08 (attacks dealing damage to selected Pokémon) distinguishes attack damage from section C-07 (effects that put damage counters). Its section C-07 expressly states that placing damage counters is not damage and bypasses Weakness, Resistance and damage-dependent effects. This distinction is tactically essential.

Pinned `ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/alolan-raichu.ts` correctly computes the discarded Energy units and their total 30-per-unit target budget, but its target-resolution loop invokes:

```ts
const putCountersEffect = new PutCountersEffect(effect, result.damage);
putCountersEffect.target = target;
store.reduceEffect(state, putCountersEffect);
```

Pinned `ptcg-server/src/sets/09-sword-and-shield/set-vivid-voltage/telescopic-sight.ts` increases damage to eligible Benched V/GX only when the reducer receives `PutDamageEffect`. The engine's `attack-effect.ts` applies attack-damage blocking, reduction, after-damage triggers and log markers in its `PutDamageEffect` branch. Its separate `PutCountersEffect` branch increments the target damage counter total directly.

The source mismatch is an actual **semantic error**: rules-level damage is passed through the effects-only, damage-counter pathway. It can distort modifiers, defenses and triggers, not merely damage logs.

## Exact staged counterfactual: attack with Telescopic Sight

Both arms construct an established Active Alolan Raichu, one attached Unit Energy LPM providing Lightning, a Benched 210-HP Shadow Rider Calyrex V, six nonempty Prize cards on each side, and one real `AttackAction('Electro Rain')`. The action prompts choose/discard the one Unit Energy and allocate 30 base damage to the Benched V. The only scenario difference is the presence of Telescopic Sight or the opt-in hook.

| Action condition | Pinned default | Opt-in corrected attack-damage path |
| --- | ---: | ---: |
| No attached Telescopic Sight | 30 | **30** |
| Telescopic Sight attached to attacking Alolan Raichu | 30 | **60** |

The 30-to-60 correction matches the Tool's printed +30 attack damage to eligible Benched Pokémon V/GX. The corrected run also confirmed that the hook restores the exact pinned `Store.prototype.reduceEffect` after test execution, and another subsequent unpatched attack once again observes the original 30-damage defect.

## Hook implementation

[Research-side hook](../../simulation/twinleaf/electro-rain-damage-hook.cjs) intercepts only `PutCountersEffect` for the printed attack `Electro Rain` on `Alolan Raichu UNM`, replaces it with `PutDamageEffect` carrying the same damage and target, and briefly applies the printed attack's ignore-Weakness/Resistance flags. The original pinned reducer is restored in `finally`. [Staged action test](../../simulation/twinleaf/raichu-electro-rain-tool-regression.cjs) runs four conditional cases plus the post-restoration check. [Manual-only CI workflow](../../.github/workflows/aichi-raichu-electro-rain.yml) checks out and compiles the actual pinned submodule without modifying or pushing anything upstream.

This hook is **opt-in and not yet wired into generic-bot full matches**. No comparison of full tournament-game results has been conducted with the correction. The correction changes damage classification and thus may reveal further engine behaviors that need characterization.

## Reproduced prevention/immunity inversions

[Separate source-printed staged regression](../../simulation/twinleaf/raichu-electro-rain-protection-regression.cjs) and [successful pinned manual CI 38855393914](https://github.com/FlareZ123/experiment-01/actions/runs/38855393914) verify two further, opposite-facing defects:

| Printed defender ability / target | Pinned default Electro Rain | Opt-in damage-corrected Electro Rain |
| --- | ---: | ---: |
| `Shaymin DRI` Flower Curtain protecting non-Rule-Box Benched Dratini | **30** (incorrectly bypasses prevention) | **0** |
| `Skeledirge SSP` Unaware, which prevents effects of attacks but permits damage | **0** (incorrectly blocks attack damage) | **30** |

Both contrasts execute a real `AttackAction('Electro Rain')` on the same injected one-Unit-Energy board and resolve all prompts through the pinned Store. The first target is a non-Rule-Box Basic protected by an opposing Shaymin on the Bench; the second target is an already-established Stage2 Skeledirge on the Bench. The protection test logs confirmed `ChooseCardsPrompt`, `PutDamagePrompt` and three `WaitPrompt` resolutions in each run. Both cards' pinned reducers explicitly distinguish `PutDamageEffect` from other attack effects, so the observed inversions support the specific source-level diagnosis.

**Engine finding:** The same misclassification can make a defending Pokémon either less protected or more protected than paper rules allow. This is not a monotonic bias that could safely be approximated as a uniform fixed damage correction. It may reverse particular tactical outcomes in field matchups, so claim promotion requires the corrected semantics and competent play.

## Open limitations and follow-up

The fixtures inject established boards and Energy cards. They do not model drawing, Stage1 evolution timing, five-Energy Electrode-GX acceleration, Supporter contention, field metagame, opponent decisions, Prize progression or full game validity.

**Repeated-target aggregation reproduced and corrected.** The pinned `PutDamagePrompt.validate` accepts two 30-damage rows onto the **same** Benched Pokémon V for a two-Unit-Energy Electro Rain. The original code passes through both rows as two separate `PutCountersEffect` calls, totaling 60. Merely translating those calls to `PutDamageEffect` could incorrectly apply the flat +30 Telescopic Sight twice. The revised [reversible hook](../../simulation/twinleaf/electro-rain-damage-hook.cjs) therefore groups rows by target identity at the `Store.prompt` callback boundary before calling the underlying reducer. [Staged repeated-target test](../../simulation/twinleaf/raichu-electro-rain-duplicate-target.cjs) and [successful manual CI 38855803143](https://github.com/FlareZ123/experiment-01/actions/runs/38855803143) confirmed **60 unpatched, 90 corrected**, consistent with 60 base +30 once. [Pure grouping invariants](../../tests/aichi-raichu-target-aggregation.test.cjs) also passed in [manual statistical CI 38855808114](https://github.com/FlareZ123/experiment-01/actions/runs/38855808114).

A new explicit `electroRainDamageCorrection` opt-in is exposed on [headless runMatch](../../simulation/twinleaf/headless.cjs), with a dedicated boolean result field and `+ElectroRainDamage-v1` policy label for provenance. The [40-action exact-source rank4/rank17 headless smoke](../../simulation/twinleaf/raichu-electro-rain-headless-smoke.cjs) passed in [manual CI 38856069509](https://github.com/FlareZ123/experiment-01/actions/runs/38856069509). It verifies that full source-resolved 60-card lists can enter the headless loop with either flag, that deck hashes and first-turn rules match, and that the original Store methods are restored exactly. The 40-action cap makes it an **integration lifecycle check**, with no sampled competitive matchup result.

An additional collaborator contributed a [three-Special-Energy fixture](../../simulation/twinleaf/raichu-multi-energy-regression.cjs), verifying `Reversal Energy PAL + Counter Energy CIN + Unit Energy LPM UPR` behind on Prizes. Its test was repaired to assert a single 180-point damage allocation prompt representing six selections, rather than six prompts. Both checks passed in [manual pinned CI 38856300813](https://github.com/FlareZ123/experiment-01/actions/runs/38856300813), at source SHA `860620a779e3aa99dca823f2e5bd5011ed7b1eda`: the source-correct three-card Energy mix generated **one damage prompt containing 180 total damage**, six 30-point target selections, and a corrected **210 with Telescopic Sight on the single selected Benched VMAX**. Unpatched with the same Tool remained 180. The [Lugia V SIT Lightning-Weakness control](../../simulation/twinleaf/raichu-electro-rain-weakness-regression.cjs) also passed: the corrected attack still dealt **30** to a Lightning-weak Active Lugia V, as Electro Rain ignores Weakness and Telescopic Sight applies only to Benched targets. These are staged source-rule tests; actual full-match performance remains unqualified.

For the benchmark, this defect applies directly to [published rank-4 and rank-17 Raichu/Electrode](agent46-electro-rain-energy-frontier.md), a meaningful part of the Aichi field. **No matchup win rate has been estimated or certified.** Until the semantics pass adversarial fixtures, apparent benchmark results against these lists should be labeled engine/policy diagnostics.
