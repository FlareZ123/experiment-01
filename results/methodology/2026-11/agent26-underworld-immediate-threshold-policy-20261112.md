# Immediate Max Geist payability gate for Underworld Door resource arbitration

**Agent 26 | 12 November 2026 | policy correction and prospective preregistration.**

## Concrete counterexample

The broad v1 Active-funding priority did not establish that its proposed attachment would make an attack payable.

In the matched native archive from [run 42727670892](https://github.com/FlareZ123/experiment-01/actions/runs/42727670892), artifact [13722752967](https://github.com/FlareZ123/experiment-01/actions/runs/42727670892/artifacts/13722752967), exact trial `1:1:A:hood-shield-v1` (rank 1, seed 763024993), the first divergent native root was action 77 on turn 15:

- Control: `UseAbilityAction` — Underworld Door.
- Treatment: `PlayCardAction` — Psychic Energy to the Active Shadow Rider Calyrex VMAX.

The public pass receipt immediately after the treatment showed the Active VMAX with **one Psychic Energy**. Its printed Max Geist cost is three Colorless. The attachment therefore left it **two Energy short**; it did not cross an attack threshold. Control instead used Underworld Door on a Benched Psychic Pokémon and drew two cards. In this matched developmental game, control settled five candidate attacks and won; treatment settled zero candidate attacks and lost. This is one native counterexample, not a paper-qualified game or a win-rate estimate.

Archive SHA256: ZIP `d4420844e9a5a68ddb356c79c29254a7fd3ba036ed80a1d2aa422d9683b00141`; contained JSON `315bc8debad383ae9ff4990928e383c75c9cc186ffed4a0574655e09894480a6` (58,548,775 bytes).

## Correction

Added `simulation/twinleaf/2026-11/agent26-underworld-immediate-max-geist-payability-v1.cjs`. It is a separate default-off alternative to the historical broad v1 policy. It proposes manual Active attachment only when the single held Basic Psychic changes the Active Shadow Rider VMAX from **Max Geist unpayable** to **Max Geist payable this turn**.

The threshold accounts for:
- printed Max Geist cost of three Colorless;
- Dimension Valley (-1) and Wondrous Labyrinth (+1);
- the slot's `attackCostIncreaseWhileActive` and stored `attackCostIncreaseNextTurn` state (the latter has an explicit pinned-engine support gap; see below);
- player-wide `ignoreAttackCostCardTypes` and `cannotAttackMaxEnergy` restrictions;
- first-turn attack prohibition, Energy attachment quota, attack locks, named attack blocks, and Asleep/Paralyzed status.

The actor observation contract now exposes those public cost/lock fields without revealing concealed opponent zones. The policy still abstains unless exactly one Basic Psychic is held and all attached Active Energy is Basic Psychic. It runs only after the shared policy has authenticated a genuine Underworld Door source and Benched Psychic recipient. Native Store acceptance remains authoritative.

## Known simulator support gap

The pinned Twinleaf revision stores `attackCostIncreaseNextTurn` on the Pokémon slot, but its `CheckAttackCostEffect` in `vendor/twinleaf/ptcg-server/src/game/store/effect-reducers/check-effect.ts` consumes `attackCostIncreaseWhileActive` and `ignoreAttackCostCardTypes` without reading `attackCostIncreaseNextTurn`. The helper adds the stored next-turn modifier conservatively from public slot state; this is **not** evidence that the pinned native Store enforces it. If a registered trial has this field nonzero, mark that trial's attack-cost semantics paper-unresolved until a targeted native test and research-side adapter hook reconcile the engine. Do not treat such a native outcome as paper-qualified.

This is a **payability gate**, not a complete attack-value evaluator: it does not estimate damage, KO value, or the opportunity value of drawing two cards. A payable Max Geist is not automatically the strategically best action.

## Tests and prospective evaluation

Seven pure policy tests pass locally, covering the original false positive, immediate payment threshold, Dimension Valley, Wondrous Labyrinth, public slot/player cost effects, attack restrictions, first-turn rules, and hidden-information isolation. The legacy v1 helper and its tests remain intact for historical comparison.

A new immutable 24-pair registration is committed at `results/aichi-2026/registrations/2026-11/agent26-underworld-immediate-max-geist-payability-fresh24-20261112.json`: 24 fresh, unique seeds across original ranks 1, 11 and 13; both candidate seats; 48 native attempts; unchanged `hood-shield-v1` and original printed sixties; 260-root action cap; same policy in both physical seats. Seeds were checked against the prior Agent26 fresh24 and Agent33 fresh16 registrations.

The manual workflow is `.github/workflows/agent26-hood-immediate-threshold-fresh24.yml`. Run [43143437578](https://github.com/FlareZ123/experiment-01/actions/runs/43143437578) completed successfully. Pinned-engine compilation, seven policy tests, actor-observation contract tests, unchanged v1 tests, paired-censor arithmetic tests, and immutable-registration preflight all passed. Its 24 paired groups (48 native attempts) completed with zero errors. The [native artifact 13911196316](https://github.com/FlareZ123/experiment-01/actions/runs/43143437578/artifacts/13911196316) contains the full 61,241,736-byte JSON output; ZIP SHA256 `8f33ac67fb106dd7b982f99314833133411f0b08a952be013b2a2a327c9abf80`, inner JSON SHA256 `20290a63694fbe1f1ae379f7948df5cde75cbb8573a314108832c5d740b38930`.

## Native results

Across 24 exact physical pairs (8 each from source ranks 1, 11 and 13), the threshold selected three times and changed three paired decisions. There were zero native errors. Candidate settled attacks were **178 control vs 179 treatment** (+1); Active Psychic funding roots were **50 vs 48**. Terminal outcomes were unchanged: candidate wins **13 vs 13**, source wins **7 vs 7**, and action-limit censored games **4 vs 4**. The aggregate candidate-win difference bound remains **[-4, +4]** because of censoring.

By source rank:
- Rank 1: 2/8 decisions changed; 61 candidate attacks in each arm; candidate wins 3/3, source wins 3/3, censored 2/2.
- Rank 11: 0/8 decisions changed; 61 candidate attacks in each arm; candidate wins 5/5, source wins 2/2, censored 1/1.
- Rank 13: 1/8 decisions changed; candidate attacks 56 control vs 57 treatment; candidate wins 5/5, source wins 2/2, censored 1/1.

The three changed pairs were `1:2:B` (source won both, 6 attacks each), `1:3:B` (candidate won both, 3 attacks each), and `13:2:B` (candidate won both, 5 vs 6 attacks). Thus the threshold produced one extra settled attack in one game but **no terminal win change** in this small panel. It is a neutral/very-low-frequency policy result, not evidence of a win-rate improvement. The artifact reports 24/24 physical-zone integrity passes, but **zero independently paper-qualified competitive games**.

## Objective status

This is an action-policy correction, not a deck selection. It does not change the fixed 60-card candidate, authenticate the three missing Aichi lists, qualify a paper game, or establish competitive win rate. The benchmark remains 29/32 authenticated original lists and zero independently paper-qualified competitive games. Do not describe this policy as validated competitive strength until the fresh paired native panel and the independent paper-admission requirements are satisfied.
