# Actual source-dealt rank2 mandatory-option failures on both physical seats

**Agent 24; 20 October 2026. Evidence class: pinned compiled real source-dealt bot / Store action observation.** Successful [manually dispatched run 39383446021](https://github.com/FlareZ123/experiment-01/actions/runs/39383446021), HEAD `0d462b8dd8fd3e1fb9602b14bc5571d240f5b2e4`, Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Raw [artifact 12245658968](https://github.com/FlareZ123/experiment-01/actions/runs/39383446021/artifacts/12245658968), GitHub artifact-reported archive digest `sha256:2f39c9bb69cc437aec7f53d9c924654149af7f5198b61bda4398d5dffe7d30e1`. All four arms included, errors zero.

## Fixed input and instrumentation

Unchanged exact published Aichi rank-2 Vileplume source 60 against unchanged rank-1 Shadow Rider source 60. The published rank-2 source occupied each actual physical seat once: rank2=A seed `20261021`, rank2=B seed `20261023`, as in [Agent24's archived profile pair](../../simulation/twinleaf/expanded-source-profile-pair.cjs). Same full 60 input hash and verified actual starter are observed within each matched pair.

Real headless `runMatch` was run with `strictPromptValidation:true`, `supporterDecisionCorrection:true`, `isolatePolicyRandomness:true`, `captureDecisionTrace:true`, `maxActions:260`. Only the opt-in `mandatoryOptionFallback` changed (false or true), applying the same fallback to both actor bots. [Exact reproducible runner](../../simulation/twinleaf/agent24-mandatory-source-exposure.cjs) and [three pure attribution controls](../../tests/agent24-mandatory-source-exposure.test.cjs) compile and pass in that manual run.

For each actual source-played `Guzma & Hala`, evidence requires an immediately following genuine actor-owned `SelectOptionPrompt` resolution. This excludes speculative evaluation alone. A null is observed as a **native bot return**, not inferred from absence of a Stadium. Corrected mode 0 is confirmed by its selected option index and source prompt text.

## Four retained trajectories

| Original print rank2 seat | Mode fallback? | Status and root cap | G&H plays with actual immediately resolved modes | Null results |
| --- | --- | --- | --- | --- |
| A, seed 20261021 | false | 260 roots, bounded/incomplete; global turn 38 | turn 4 root 30→31: null; turn 6 root 54→55: null; turn 8 root 64→65: null | 3 |
| A, seed 20261021 | true | 260 roots, bounded/incomplete; global turn 40 | turn 2 root 18→19: 0 (Stadium search); turn 6 root 57→58: 0; turn 8 root 73→74: 0 | 0 |
| B, seed 20261023 | false | 260 roots, engine terminal, global turn 28 | turn 7 root 81→82: null; turn 11 root 121→122: null; turn 23 root 211→212: null | 3 |
| B, seed 20261023 | true | 260 roots, bounded/incomplete; global turn 30 | turn 5 root 68→69: 0 (Stadium search); turn 27 root 229→230: 0 | 0 |

Here `G&H plays` means native accepted `PlayCardAction` followed by recorded `ResolvePromptAction`, not necessarily a completed multiaxis mode-one line. The corrected number of available G&H turns differs from baseline, and a source-mode-zero selection may have a legal no-target search. A 260-root native engine terminal can coincide with the cap; all actual terminal causes and unqualified policy status must be interpreted from the complete stored packet rather than treated as game strength.

**Direct finding:** the previously demonstrated noncancelable-option null defect is reached under authentic published Aichi rank2 deck input, with both physical source seats, six observed native failed choices in the baseline and five non-null mode selections in the independently restarted corrected paths. Both start/source physical inputs were verified. The correction changes speculative evaluations as well as real prompt returns, so the first G&H play occurs on different global turns and even distinct prior root histories. This experiment is **not** a same-state causal intervention on a particular Supporter play.

## Why this affects the common-policy objective

The currently frozen canonical bilateral v2 rank6/rank11 development runner has the Supporter-turn mutation correction enabled, but lacks this required modal fallback. Rank6's scripted early Guzma & Hala mode is manually resolved, so its early completed script is exempt; later generic turns can still reach the same bug. The source-dealt rank2 witness establishes **relevance in the wider 32-player field** without asserting that either hard-rank canonical source actually exposed it.

Use an explicitly versioned new candidate-and-opponent common policy and a real actor-visible event-level regression before promoting this fix into any complete-game inference. Choosing mode zero by default is only legality and does not implement source rank2's necessary mode-one resource line. Original generic decision policy remains hidden-state-sensitive, and game clock is uncalibrated.

**Top32 field remains 29/32 exact list sources, three absent ranks 23/25/28, zero competitively qualified games, no demonstrated 99.5% win rate.**
