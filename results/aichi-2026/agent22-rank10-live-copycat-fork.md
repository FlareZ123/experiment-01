# Agent 22: source-dealt rank-10 Mimikyu/Copycat full-turn fork

**16 October 2026. Qualification remains FALSE.** This is a live-action, pinned-engine, deterministic single-source-deal policy counterfactual, with the initial observation reproduced and the control rerun after intervention. It is **not** a competitive win-rate estimate or complete machine-replay certificate.

## Reproduced source provenance

- [Manual compiled CI 38908041710](https://github.com/FlareZ123/experiment-01/actions/runs/38908041710), [complete recorder artifact 12050005212](https://github.com/FlareZ123/experiment-01/actions/runs/38908041710/artifacts/12050005212), revision `f1ebb2bd9f775a186c751f11fb60a0398513774c`.
- Source: published Aichi 2026 **rank 1 Shadow Rider** versus **rank 10 Regidrago**, two immutable 60-card lists in `results/aichi-2026/full-decklists.json`, resolved by `simulation/twinleaf/resolve-field.cjs` with documented basic-Energy and Japanese-promo allowances. Engine fullName-array hashes: rank1 `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`; rank10 `527f78a6ed10b7895c34b230d900974aa2b94db3ef2eee9f970d5eab9c875db9`.
- `pilot:10:0:champion-reference:B`, physical champion seat1, champion **actually first**, v3 seed `4246551499`, schedule digest `01ab9959e9b94f8d89fe6dc010072b9959ce3dfa2c4d670f9864ed3d237c9d60`.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; opt-in post-super v2 experimental clone, strict prompts, isolated policy RNG, source-ranked attack history and lock correction flags per `simulation/twinleaf/rank10-source-branch-transcript.cjs`.

## Authentic turn-27 fork

**Source start before first decision:** Regidrago VSTAR used **Apex Dragon** on turn 26. On champion's turn 27, a Benched Mimikyu GRI had **one Psychic Energy**, the Active Latias ex had two Psychic Energy, GX power remained unused, Dialga-GX UPR was in champion's hand (zero in discard), one Night Stretcher and two Mysterious Treasure were in hand, three Psychic Energy in discard, and no Stadium. Baseline and alternate had **exactly equal detached public/own-hand turn-27 start snapshots**.

**First full live Store divergence:** dispatch index **183** (global turn 27), after identical prior recorded live dispatches. Baseline played Dialga-GX from hand onto Bench. Alternate played Mysterious Treasure, and the next live ChooseCardsPrompt selected the **exact Dialga-GX UPR** from hand for discard (selection index 2 among 14 source hand cards). A second prompt selected Lillie's Clefairy ex from deck; Night Stretcher recovered a Psychic, normal attachment powered Benched Mimikyu, and RetreatAction promoted it. The alternate announced **Copycat** on turn 27. The engine then advanced into **another champion turn (28)**, consistent with copying the intended Dialga Timeless-GX via Regidrago Apex Dragon; however the original recorder had **not serialized the chosen Attack object**, so the specific copied attack was inferred from policy and extra turn rather than directly proven by that initial artifact.

**Consequential response:** after the additional champion turn, opposing Regidrago announced Apex Dragon on turns **29 and 31**. The alternate **lost** with engine winner seat0, terminal remaining Prizes [rank10=0, champion=4] on turn31. The original control also **lost** with engine winner seat0, terminal Prizes [rank10=1, champion=2] on turn65. The differing final results are deterministic engine diagnostics with different subsequent policies and RNG event consumption, not evidence of win-rate improvement.

## Live capture validation and limitations

- The same uninstrumented control and instrumented control produced exactly equal `runMatch` return objects; repeating the instrumented original after the alternate produced a **byte-equal entire original return and live diagnostic dispatch array**.
- Recorder baseline: **350** live dispatches (two player entries + **348** root game actions), **2519** speculative/nonlive Store dispatches excluded. Alternate: **235** live dispatches (two entries + **233** root game actions), **1175** nonlive dispatches excluded. Full live action histograms match the independent engine-loop action counters; ordered events, limited pre/post public counts, player choices and first divergences are in the artifact.
- **Crucial:** `parametersCaptured:false` for both arms. Baseline has **221** capture failures; alternate **149**. Numerous ResolvePromptAction `log:undefined`, selected live Card instances and the attack choice object lack portable argument representations. `traceSha256:null`; the nonnull *diagnostic* trace digest is not replay-eligible. The artifact does not contain complete prompt payloads, hidden-state checkpoints, complete reducers or exact source-Store graph equivalence.
- Actual full-game terminal identity is an engine observation, not a paper-rule certification. Bot policy competence for both seats, opponent counterplay quality, hidden-information fairness and independent review are unresolved. This is **one physical B seed**, not two-seat or fresh-seed matchup coverage.
- Therefore `sourceReplayMechanicsVerified:false`, `qualifiedForCompetitiveInference:false`, readiness ledger **unchanged**.

## Follow-up (in progress)

Agent 22 added `simulation/twinleaf/choose-attack-reference.cjs`, pure tests and a nonmutating extension to Agent14's `store-dispatch-transcript.cjs` capturing exact `ChooseAttackPrompt` source card, physical source index, and Attack object index/name. The branch runner now requires the actual chosen **Dialga-GX UPR / Timeless-GX** and verifies next-turn candidate control and opponent response. This follow-up was submitted to existing manual-only `.github/workflows/aichi-dispatch-transcript.yml`; results must be checked before considering attack-choice capture proven. Independently assess any adverse effects or conflicts with Agent14's continuing recorder changes. No winner or matchup promotion is permitted from this one diagnostic.

Reproducers: `simulation/twinleaf/rank10-source-branch-transcript.cjs`, `tests/rank10-source-branch-transcript.test.cjs`, `simulation/twinleaf/choose-attack-reference.cjs`, `tests/choose-attack-reference.test.cjs`. For subsequent replay qualification see [the shared acceptance contract](critic-qualification-critical-path.md) and [rank10 working packet](qualification-packets/rank-10/README.md).
