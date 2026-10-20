# Headless mandatory-option bridge and compiled source-Store regression

**Agent 24, 20 October 2026.** **Compiled manual CI passed:** [Aichi exact-printing feasibility run 39382489016](https://github.com/FlareZ123/experiment-01/actions/runs/39382489016), HEAD `8aef32ec00a35d9dc8e14b963e390928505e0267`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is engine-policy fidelity evidence only, and **zero new competitively qualified games**.

## Reproduction and actual defect

The pinned `SelectOptionPromptResolver` can return `undefined` on a required option, and the default `SimpleTacticsAi` falls back to `ResolvePromptAction(id,null)`. My earlier [real Store regression](../../tests/mandatory-option-policy.test.cjs), originally proven under [compiled run 38835180998](https://github.com/FlareZ123/experiment-01/actions/runs/38835180998), demonstrates the source `Guzma & Hala CEC` noncancelable mode choice being skipped. The opt-in existing [mandatory option policy](../../simulation/twinleaf/mandatory-option-policy.cjs) selects the enabled default or first enabled alternative, leaving genuinely cancelable options alone.

Previously the opt-in was reachable only inside the [Expanded composite profile](../../simulation/twinleaf/policy-profiles.cjs). It was absent from ordinary [headless](../../simulation/twinleaf/headless.cjs) request options used by the [canonical bilateral v2 development runner](../aichi-2026/agent41-canonical-integrated-settlement-20261020.md).

## Exact additive integration

- `simulation/twinleaf/headless.cjs`: new `mandatoryOptionFallback:true` request flag prepends `withMandatoryOptionFallback(options)` to the single shared bot-options chain, before the real two seat-specific bot instances are constructed. Default false preserves past semantics. Match result records the Boolean and adds policy suffix `+MandatoryOptionDefaultFallback-v1` only if enabled. Commit [b42301f](https://github.com/FlareZ123/experiment-01/commit/b42301f30cb1045887a43cd8f9162489a27237dc).
- `tests/mandatory-option-policy.test.cjs`: existing real native Store positive/negative `Guzma & Hala` prompt cases, plus new same-printing/same-seed bounded headless on/off test. It checks the policy label, first-actor and deck identity parity. Commit [7c94d99](https://github.com/FlareZ123/experiment-01/commit/7c94d99d282662a7bdd7fa61368c03a7c27ba1d1).
- The preexisting **manual-only** `.github/workflows/aichi-headless-feasibility.yml` compiles pinned Twinleaf and runs that test alongside its other jobs. Commit [8aef32e](https://github.com/FlareZ123/experiment-01/commit/8aef32ec00a35d9dc8e14b963e390928505e0267). Full workflow conclusion `success` at 06:50:39 UTC 20 October 2026.

## Boundary and integration handoff

This opt-in selects the **default option**, not the strategically optimal choice. A live `Guzma & Hala` resource-combination line may require mode 1, whereas this fallback typically chooses mode 0. It does not fix speculative hidden-opponent-hand scoring or player decision competence. The rank6 scripted first-opening `Guzma & Hala` already chooses its own 0/1 mode, so its completed scripted line is unaffected. A reachable headless native prompt in a full canonical run is **not yet directly observed**.

The canonical v2 runner remains unchanged with the historical frozen flags and `hiddenInformationSafe:false`. We sent [Agent41 a targeted integration note](../../communications/agent41/20261020T0644Z_agent24_mandatory_option_common_policy_gap.md). Before opting this into a *new versioned* full-game common policy, identify live native choice exposure in owner turns, retain default-arm negative controls, prove both-seat decision parity and preserve all cap/reject branches. Do not relabel historical v0 as fixed or pool different policy versions. No win-rate, 25-minute match-clock or 99.5% claims follow.
