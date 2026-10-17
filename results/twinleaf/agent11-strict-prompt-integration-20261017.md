# Frozen 17 October strict-prompt integration and rank-10 source replay

**Agent 11, 17 October 2026 UTC.** Scope: one frozen, reproducible source pair and a current-guard compiled regression. All results are source mechanics and tool-validation evidence. **Qualified competitive games: zero.**

## Immutable identification

| Field | Value |
| --- | --- |
| Research commit | `3c2b55f032b50995fee938837403d05cfbba001a` |
| Frozen replay branch | `agent11-strict-prompt-integration-20261017` |
| Pinned Twinleaf | `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` |
| Research prompt guard file | `simulation/twinleaf/prompt-integrity.cjs` (Git blob `12ce87a8e38cfc9e820768f93d8714b8993b2c2e` at inspected head) |
| Seed / candidate position | `4246551499`, champion-reference in physical Store slot B |
| Source plan digest | `01ab9959e9b94f8d89fe6dc010072b9959ce3dfa2c4d670f9864ed3d237c9d60` |
| Source replay CI | [39013954286](https://github.com/FlareZ123/experiment-01/actions/runs/39013954286), **success** |
| Full source archive | CI artifact `12093664616`, `rank10-source-branch-live-dispatch.json` |
| Separate-process replay | CI artifact `12094322137`, `rank10-fresh-process-input-replay.json` |
| Headless feasibility CI | [39013891160](https://github.com/FlareZ123/experiment-01/actions/runs/39013891160), **failed**; independent second run [39013934813](https://github.com/FlareZ123/experiment-01/actions/runs/39013934813), **failed at same assertion** |

## Replay integration result

The [source-only manual replay workflow](../../.github/workflows/aichi-dispatch-transcript.yml) compiled pinned Twinleaf at the frozen head. Its archived-action acceptance step succeeded in a fresh process.

| Source arm | Actual root dispatches | Source inputs reproduced | Store own-data graph matched | Match summary |
| --- | ---: | ---: | ---: | --- |
| Unchanged champion-B vs rank-10 Regidrago | 350 | 350 | 350 | Identical |
| Copycat alternate, same source deal | 235 | 235 | 235 | Identical |

The acceptance contract is `live-store-own-data-stats-clock-normalized-v2`. Both arms' Pale Moon-GX queued-KO exposure observer returned `not-exercised` and **zero** queued dispatches. Those effect and guard families do not inherit paper-fidelity clearance merely because the replay succeeded. The replay JSON explicitly states `sourceReplayMechanicsVerified:false` and `controlsAndForksQualifiedForCompetitiveInference:false`.

## Strict guard exposure by actual source action

From each arm's `fullLiveDispatchTrace`, count only actions named `ResolvePromptAction`, grouped by the immediately preceding `pendingPrompt.kind`. This includes the actual source action's awaited prompt, rather than hypothetical prompt types from unit tests.

| Pending prompt kind | Control (219 resolved) | Alternate (147 resolved) |
| --- | ---: | ---: |
| WaitPrompt | 150 | 85 |
| ShuffleDeckPrompt | 17 | 15 |
| ChooseCardsPrompt | 17 | 16 |
| ShowCardsPrompt | 11 | 11 |
| ChoosePokemonPrompt | 9 | 5 |
| ChoosePrizePrompt | 4 | 3 |
| ConfirmPrompt | 3 | 4 |
| SelectPrompt | 3 | 2 |
| AttachEnergyPrompt | 2 | 1 |
| ChooseAttackPrompt | 2 | 4 |
| CoinFlipPrompt | 1 | 1 |
| **ShufflePrizesPrompt, ShuffleHandPrompt, OrderCardsPrompt, MoveEnergyPrompt, ChooseEnergyPrompt** | **0 each** | **0 each** |

The positive counts mean those legal/accepted source prompts passed this particular strict guard + full-dispatch replay; they **do not** validate the rejection of illegal result variants. The five zero-count kinds did not get source-trajectory exposure here. The locked rank-10 source is only one field match and one deal; applying these counts to the other 31 placements would be unsupported.

## Separate headless failure and classification

The [headless feasibility workflow](../../.github/workflows/aichi-headless-feasibility.yml) completed its new pinned-class tests through strict-prompt MoveEnergy and ChooseEnergy at the same frozen head. Its last `tests/battle-compressor-minimum.test.cjs` step failed on line 30 in both independent runs, expecting `baseline.discardedItem === true` directly after the empty ChooseCards selection. Actual compiled Store state:
- Uncorrected source: selection `accepted`; `ShuffleDeckPrompt` still unresolved; Battle Compressor remains in the temporary Supporter/action zone; `discardedItem:false`.
- Opt-in correction: selection `rejected` with `CANNOT_PLAY_THIS_CARD`; `ChooseCardsPrompt` still unresolved; deck unchanged.

**Classification:** premature assertion before an unresolved shuffle continuation. This specific failure neither invalidates the strict prompt unit tests that already passed nor demonstrates successful completed Item cleanup. To test discard placement, resolve the actual pending shuffle before checking the final discard zone. Reproducing this same red test twice with identical head confirms the fixture boundary, while the separate frozen source replay independently passed. A direct message documenting the first CI red gate was sent to Agent 47.

## Next qualification gate

Preserve the frozen replay, add true source-exercised guard-family counters to the replay tooling when justified, and verify the paper effects and both players' decisions on consequential source turns. A replay that reproduces weak decisions faithfully is still competitively unqualified. Do not promote a fixed deck or report win rates from these tests.
