# Original rank5 Mew/Genesect: fresh-seed paper Energy Mix A/B yields zero completed opportunities

**Agent 19 | 5 November 2026 | developmental native evidence only**

## Protocol and provenance

We preregistered eight distinct fresh 32-bit physical seed groups before observing a prospective match. Each group was repeated under the two unchanged 60-card candidates, champion-reference and new-moon-lockbreaker-v1. The **exact original rank5 Aichi Mew/Genesect printed 60** remained unchanged, with no substituted cards. Each of the 16 resulting physical matches was run in two arms, totaling **32 genuine headless matches**.

- Control: printed-recipient guard applied, pinned native Mew V FST **Energy Mix** missing-final-shuffle implementation.
- Treatment: same guard and independently keyed per-seat physical-shuffle and speculative-policy RNG, with a reversible paper final-shuffle correction enabled after copied Energy Mix.
- Both arms use the same opponent, candidate, starting physical seed and RNG protocol. The global native coin RNG is **not** independently isolated.
- The owner policy and two decklists had been informed by historical developmental research. The **seeds** were fresh; this does not make the policy a prospective competitive trial.

The first frozen [v6 registration](../aichi-2026/registrations/agent19-rank5-energy-mix-independent-seat-rng-prospective-seeds-20261105.json) is preserved. [CI 42106137923](https://github.com/FlareZ123/experiment-01/actions/runs/42106137923) failed **before any match** because another agent had changed the shared headless file's Git blob. A separately frozen [v6b registration](../aichi-2026/registrations/agent19-rank5-energy-mix-independent-seat-rng-prospective-seeds-v6b-20261105.json) pins the new headless blob `975c748c698dcd5d701062e53631266dc1768da3`, explicitly reuses all eight already committed seeds and records that earlier no-match abort. [CI 42106810691](https://github.com/FlareZ123/experiment-01/actions/runs/42106810691) also failed before any match because the initial v6b script misspelled the registration filename as `v6bb`; that typo was fixed and preserved in Git history before execution.

**Compiled v6b evidence:** [CI run 42107292223](https://github.com/FlareZ123/experiment-01/actions/runs/42107292223), commit `9620f173711f37c32adc2caae497dd4fb784c472`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Targeted **step 18 succeeded** (three pure tests, syntax, manifest and native replay). Complete [artifact 13451453951](https://github.com/FlareZ123/experiment-01/actions/runs/42107292223/artifacts/13451453951), ZIP SHA-256 `b31db71d0c7159d0a613c983dc0b7aeb77c6ef7e7cf296870789204a7d79dfc0`, contains a 33.6 MB full action/board JSON and summary. The **overall** shared CI workflow remains red due unrelated later steps. The [v6b runner](../../simulation/evaluation/agent19-rank5-independent-seat-rng-prospective-v6b-native.cjs) stores outputs with an exclusive lock and atomic rename.

## Complete prospective native observations

| Registered observation | Guard-only control | Guard + paper shuffle |
| --- | ---: | ---: |
| Original-source native attempts executed | **16** | **16** |
| Two-seat matched physical initial deals and starting player | **16/16** | **16/16** |
| Same native root-action digest across paired A/B | **16/16** | **16/16** |
| Source-owned settled Cross Fusion Strike attacks | 44 | 44 |
| Source-owned borrowed Genesect V Techno Blast menu choices | 32 | 32 |
| Borrowed Mew V Energy Mix menu choices | **1** | **1** |
| Borrowed Energy Mix with observed same-root Energy attachment | **0** | **0** |
| Settled final ShuffleDeckPrompt from borrowed Energy Mix | **0** | **0** |
| Printed-shuffle omission proven on a completed Energy Mix line | **0** | **0** |
| Native engine terminal | **12** | **12** |
| Native 260-root action cap | **4** | **4** |
| Paper-competitively qualified games | **0** | **0** |

The single apparent original-source Energy Mix opportunity was from **`5:1:A:champion-reference`**, source physical seat **1**, on global turn **63**. The genuine original-source `AttackAction` appeared at root **258** and borrowed `Energy Mix` was selected at root **259**. The run hit the 260-root cap immediately thereafter. No same-root `AttachEnergyPrompt` or shuffle was witnessed. Its lineage status was **`ATTACH_PROMPT_UNOBSERVED`** in both arms. The hook's treatment audit counted one Energy Mix effect entry but **zero** created or settled shuffle prompts; that counted entry is **not** a completed paper correction.

All **16** A/B pairs matched full physical initial-deal fingerprints, source-deal fingerprints and actual starting player. All **16** paired root-action hashes remained identical. No valid source-paid Energy Mix then-shuffle line occurred within this prospectively selected cohort. Treat the treatment-effect denominator as **zero completed opportunities**, despite having 16 physical comparisons. This result **neither replicates nor refutes** the historical positive shuffle effect.

## What the contrast with historical data means

The earlier [retrospective paper-shuffle study](agent19-rank5-independent-physical-rng-copied-energy-mix-20261105.md) used four historically chosen seed groups and observed two completed original-source copied Energy Mix attachments and genuine corrected final shuffles per arm, with exact next-opponent replies. It provides a useful positive regression case. The current fresh-seed study uses eight different uniform physical seed groups, and no such completed line occurred. Do not pool the historical two positive events with the prospective 16 paired attempts as if they were representative independent games.

The earlier code-pin preflight failure and filename failure do **not** increase the native attempts or reduce the denominator of already registered trials. They are separately visible audit failures with **zero games executed**. The successfully executed frozen source seeds were never replaced after seeing native results.

**Qualification boundary:** 29/32 original Aichi opponent name/count 60s authenticated; ranks 23, 25 and 28 still missing; zero competitively qualified games, no chosen final fixed 60, no evidence of a 99.5% field win rate. Source opponent policy, full paper effects, global coin independence, event clock and full Top32 coverage remain unresolved.
