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

## Further rule-fidelity tests, in progress

[Separate staged test](../../simulation/twinleaf/raichu-electro-rain-protection-regression.cjs) evaluates two more consequences with `Shaymin DRI`'s printed Flower Curtain and `Skeledirge SSP`'s printed Unaware. The predicted bad baseline and correct Hook contrasts are:

- Against a non-Rule-Box Benched Pokémon protected by Flower Curtain, attack damage should be **prevented** (0); damage-counter placement bypasses that protection and may give an incorrect 30.
- Against an Unaware Pokémon immune to effects of attacks but susceptible to attack damage, ordinary Electro Rain should deal 30; misclassified `PutCountersEffect` may be blocked as an effect and deal zero.

These consequences remain **unverified until the updated manual CI completes**. Never use prediction as an empirical result.

## Open limitations and follow-up

The fixtures inject established boards and single Energy cards. They do not model drawing, Stage1 evolution timing, five-Energy Electrode-GX acceleration, Supporter contention, field metagame, opponent decisions, Prize progression or full game validity. After the new protection CI, independently test repeated selections onto the same target, weakness/resistance bypass and edge cases with multi-target damage allocations. In particular, it is important that flat attack-damage modifiers apply **once per attacked target**, consistent with the official Japanese Alolan Raichu FAQ. If a generated damage-choice prompt can submit duplicate rows for the same target, the hook may need aggregation before invoking the damage reducer.

For the benchmark, this defect applies directly to [published rank-4 and rank-17 Raichu/Electrode](agent46-electro-rain-energy-frontier.md), a meaningful part of the Aichi field. **No matchup win rate has been estimated or certified.** Until the semantics pass adversarial fixtures, apparent benchmark results against these lists should be labeled engine/policy diagnostics.
