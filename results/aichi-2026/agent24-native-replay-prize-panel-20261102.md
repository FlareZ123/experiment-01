# Native replay after authentic fresh six-Prize deal: four zero-lead terminals

**Agent 24, 2 November 2026.** This is a failure-inclusive, retrospective development experiment, not competitive win-rate evidence. It extends the [staged negative paper first-Prize witness](agent24-native-replay-paper-first-prize-stop-20261102.md) without fabricating a natural Prize-taking event.

## Registered setup and exact evidence

The [original-source replay panel](../../simulation/twinleaf/agent24-natural-replay-prize-stop-panel.cjs), v1, used unchanged published 60s for Aichi ranks 20, 11, 5, and 26, two rank pairs and both physical-seat orientations. All four used native seed `1847000101`, max `260` root actions, paper Expanded rules option, strict prompt validation, decision trace, original 120-reference ownership and settled physical-conservation checks. Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Each trial began from a genuine original 60/60 Store source setup, then **experimenter-staged the initial simultaneous tie** by relocating its 12 genuine original Prize objects to their respective original owners' hands. From there the **native engine itself** restarted and executed a fresh six-Prize-per-seat tiebreaker setup. There was **no experimenter-injected Prize move after that second deal**. The existing actor policy and engine played the continuation. Such games remain artificial-antecedent diagnostics and do not model the official event clock.

[Manual workflow run 41391366855](https://github.com/FlareZ123/experiment-01/actions/runs/41391366855) used main head `1f8eda12d028b91229a56d784ac7ebf9c965e253`; its **`agent24-original-physical-native` job succeeded** and its `Seek paper stop on actual native tiebreaker Prize-taking roots` step succeeded. The distinct `test-benchmark` job failed elsewhere; the workflow as a whole is **not** green. Artifact: `agent24-threecase-original-physical-native`, ID `13117761609`, ZIP SHA-256 `04a0b78841ad787eac38750b95d89d87b88ad5d382beb77a30ae3f090b7bd527`. Raw file inside archive: `agent24-natural-replay-prize-panel.json`.

## Complete four-attempt native results

| Native physical seats A/B | Fresh replay [Prizes A, B] | Settled replay roots observed | Total native actions | Native winner seat | Native terminal | Native error | First settled strict Prize lead |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| Rank 20 / Rank 11 | [6,6] | 113 | 136 | 1 | yes | none | none |
| Rank 11 / Rank 20 | [6,6] | 34 | 57 | 1 | yes | none | none |
| Rank 5 / Rank 26 | [6,6] | 132 | 155 | 0 | yes | none | none |
| Rank 26 / Rank 5 | [6,6] | 143 | 166 | 0 | yes | none | none |

**4/4** staged original ties, genuine native replay resets and native new six-Prize deals; **4/4** native engine terminals, **0/4** engine aborts and **0/4** action caps. There are **0/4 observed settled strict Prize leads**, so `paperReplayFirstPrizeLeads=[]` and `paperReplayFirstPrizeLeadVeto=false` in all four. These are not four positive paper-qualified outcomes: the read-only first-Prize sentinel has no positive natural action to witness.

The trial order uses the same seed across four different seat/deck orders. Results are not independent samples of field performance. A native winner with no observed first strict Prize lead is **an unqualified terminal**, not a demonstration that paper's tiebreaker winner condition was satisfied. This first archived panel does not capture final terminal Prize totals, each deck's remaining cards, or final Active presence. Hence the exact native terminal mechanism is **unresolved** in this artifact. The result should guide actor/paper-stop fidelity testing; it does not establish a board win or a defeat under paper adjudication.

## Follow-up and reproducibility correction

An earlier dispatch [41391308460](https://github.com/FlareZ123/experiment-01/actions/runs/41391308460) enabled only `agent24_natural_replay_prize_panel`. The native job was skipped because the workflow job itself required `agent24_original_physical_native`. That skip yielded **zero attempted games**, distinct from the four attempts above.

Fixed the job-level predicate in [the existing manual workflow](../../.github/workflows/aichi-benchmark-stats.yml) at commit `d916b395bbda7589d6e7a1c084b6a0a72608799c`: any of its five declared Agent24 native subpanel inputs now starts the same job, without adding a 17th dispatch input or creating a new workflow. GitHub's [workflow condition documentation](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-jobs-with-conditions) supports such boolean input expressions. A one-input rerun of the fixed predicate is separately pending and will be reported on its own evidence.

Added **read-only terminal projection** to the native replay panel at `d4894c280c02f058f0b2709356c91a48146c0026`: final Prize totals, deck counts, Active/Bench occupancy and the headless end reason, plus an explicit native-terminal-with-no-observed-lead flag. It changes neither decisions nor game rules. These new fields do not exist in the first four-attempt archive, and any replay to obtain them is a retrospective diagnostic under a new code revision, not the same recorded trial.

**Release status:** 29/32 authenticated original field 60s, ranks 23/25/28 missing, **zero competitively qualified games**, no verified fixed best 60, and no demonstrated 99.5% rate.
