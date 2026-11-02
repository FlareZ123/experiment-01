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

## Retrospective public terminal projection, compiled 05:06 UTC

The post-hoc read-only output expansion at `d4894c280c02f058f0b2709356c91a48146c0026` was verified in the existing native job on [manual one-input run 41391811173](https://github.com/FlareZ123/experiment-01/actions/runs/41391811173). Crucially, the **single `agent24_natural_replay_prize_panel=true` dispatch now actually starts the native job**, validating the job-level predicate fix. The `agent24-original-physical-native` job succeeded, while unrelated test-job failure keeps the entire workflow red. Artifact ID `13117557576`, ZIP SHA-256 `18323607af0c88e76fca6553449aede24fbd9d0cf8e7f7c3a0c25075095b1889`.

All four replays reproduce the initial archive's exact `nativeActions` counts (136, 57, 155, 166), winner-seat indices (1,1,0,0), and settled replay-root counts (113,34,132,143). Their final public counters are:

| Physical A/B | End Prizes A/B | End deck cards A/B | Active present A/B | Benched Pokémon A/B | Native winner |
| --- | --- | --- | --- | --- | --- |
| Rank20 / Rank11 | [6,6] | [35,32] | [false,true] | [3,2] | B |
| Rank11 / Rank20 | [6,6] | [42,41] | [false,true] | [0,1] | B |
| Rank5 / Rank26 | [6,6] | [32,31] | [true,false] | [4,3] | A |
| Rank26 / Rank5 | [6,6] | [29,29] | [true,false] | [4,5] | A |

Every row has `nativeEndReason=engine-game-end` and `nativeTerminalWithoutObservedPrizeLead=true`. The losing player's Active is empty on all four; three losing players still have a Bench (3, 3, or 5 Pokémon). These counters initially raised a premature no-Active-loss concern. **The follow-up attack lineage and exact pinned reducer establish a more specific explanation**: the native sudden-death KO Prize branch explicitly terminates the game *before Prize-card movement and mandatory promotion*. The earlier speculative cause is superseded by the investigation below.

The panel records the existing headless `nativeTerminalTransition` public before/after states, final dispatch, and action lineage (added at `1d300d1f85f380313a4579aeaf0632cae8fccc8c`). These observations demonstrate an important accounting gap in the original physical-count-based replay stop witness.

## Third native run: terminal root confirms early KO-Prize winner path

[Manual run 41392259327](https://github.com/FlareZ123/experiment-01/actions/runs/41392259327), head `830dd229c63b5cb04055a792e8af3aad1167f956`, compiled and completed the exact same four registered original rank/deal combinations with a new **read-only terminal-transition sidecar**. Agent24 native job succeeded, while the separate benchmark test job failed. Archived artifact ID `13118210748`, ZIP SHA-256 `59e74e5b70d561a0d2b2de498112150ca59ce6fbd80e29cf56d2af989aca6986`. All four action counts, original registered source decks, native winners, 6/6 final Prize counts, original owner reference checks and no-first-physical-lead observations were unchanged.

| Ranks A/B | Initiating attack root, seat | Last native accepted root | Public in-play Pokémon before → after | Winner seat | Prize totals after |
| --- | --- | --- | --- | --- | --- |
| 20/11 | 133, B | 135, B `ResolvePromptAction/WaitPrompt` | [4,3] → [3,3] | B | [6,6] |
| 11/20 | 55, B | 56, B `ResolvePromptAction/WaitPrompt` | [1,2] → [0,2] | B | [6,6] |
| 5/26 | 152, A | 154, A `ResolvePromptAction/WaitPrompt` | [5,4] → [5,3] | A | [6,6] |
| 26/5 | 164, A | 165, A `ResolvePromptAction/WaitPrompt` | [5,6] → [5,5] | A | [6,6] |

The actual pinned Twinleaf `ptcg-server/src/game/store/effect-reducers/check-effect.ts` at `a9905a76...` has an explicit `choosePrizeCards` branch: `if (group.count > 0 && state.isSuddenDeath) { endGame(...winner...); return []; }`. In `executeCheckState`, it resolves Knock Outs, computes their `prizeGroups`, calls `choosePrizeCards` **before** the usual new Active selection, and immediately returns if the phase became `FINISHED`. Consequently an engine tiebreak winner can have **all six physical Prize objects untouched** and the KO'd Active vacated even with a nonempty Bench. This source control flow directly explains the previously suspicious shape; ordinary `checkWinner` alone is not the actual deciding mechanism for these authentic attack-root terminations.

**Finding:** The native tiebreak engine has a **virtual pending-KO-Prize victory**, represented as a winner but not as a changed physical Prize count. Our read-only `paperReplayFirstPrizeLeadWitness` only recognizes physically moved Prize cards, so its zero signals on these four wins are **false negatives for the native first-KO-Prize pathway**. This does **not** demonstrate that the native winner is contrary to the paper tiebreaker winner, because a legally pending Prize from an actual KO would establish the first lead if physically taken. It does establish a concrete native physical-Prize settlement and audit-observability difference. The staged direct `checkWinner` negative fixture remains correct for its *artificially moved* Prize state, but it is not the relevant full KO path. Avoid describing the engine as unable to adjudicate an actual first tiebreak Prize.

The explicit remaining gap is a **KO entitlement-to-paper-lead bridge** grounded in authentic settled native attack and Prize group formation, with simultaneous KO/tie handling and other card-effect exceptions considered. A public attack+in-play-count decrease alone is only a necessary hint; do not automatically certify a paper Prize taken or competitive winner from it. No paper-compliant end-to-end game, official event clock, policy competency, or fixed-deck win-rate certification follows.
