# Rank-10 post-Shred one-Prize Retreat: source-bounded negative control

**Agent 28, 18 October 2026. Classification: pre-existing compiled single-deal intervention, now synthesized. No qualified competitive games.**

## Provenance

The source is the published rank-1 Shadow Rider 60 in physical seat B versus the published rank-10 Regidrago 60 in seat A, seed `4246551499`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and explicitly archived `DoubleDragonAttachTactic-v3-archive`. A previous real Store action at root 215 was replaced by the conditional Mimikyu `Copycat → Apex Dragon → Shred` branch. The generic opponent then proposed a root-231 Retreat to Dialga-GX.

[Compiled manual CI run 39089110191](https://github.com/FlareZ123/experiment-01/actions/runs/39089110191) at head `e7f8dfca` passed the paired source fork and four pure regressions. [Archived output artifact 12122036462](https://github.com/FlareZ123/experiment-01/actions/runs/39089110191/artifacts/12122036462) contains `rank10-turn29-guzma-fork.json`. Source runner: [rank10-turn29-guzma-source.cjs](../../simulation/twinleaf/rank10-turn29-guzma-source.cjs). The printed deck hashes were `527f78a6ed10b7895c34b230d900974aa2b94db3ef2eee9f970d5eab9c875db9` for Regidrago and `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311` for Shadow Rider.

## Two authentic-root arms

At live source root **231** in turn 29, the experiment held the initial game and all previous root Store actions identical, then selected one of two physically available Retreat destinations. A separate attempted use of held `Guzma BUS` was correctly rejected: the opponent had already spent its single Supporter this turn (`supporterTurn:1`). The proposal to play that held Guzma is **illegal at the source decision**.

| Arm | Real root 231 move | Finished | Turns | Runner actions | Winner | Remaining Prizes (Regidrago / champion) |
| --- | --- | --- | ---: | ---: | --- | --- |
| Control | Retreat to `Dialga-GX UPR` | Yes | 38 | 287 | Champion B | 3 / 0 |
| Counterfactual | Retreat to `Wobbuffet PHF` | Yes | 38 | 287 | Champion B | 3 / 0 |

The alternative did reach the real Store: the physical source-zone hash changed *after* root231, while the exact pre-dispatch source-zone hash matched the control. The observer reported **58 later root actions with differing zone digests**, no exact source-zone reconvergence, and unequal final zone hashes. Thus this was a consequentially different physical board path even though the two generic-bot game summaries and their printed attack traces were identical.

## Interpretation

The natural-sounding recommendation to promote a one-Prize Wobbuffet instead of a two-Prize Dialga **did not rescue this fixed-seed Regidrago game under the frozen opponent bot**. The result does not establish the alternative is generally inferior, that it cannot disrupt the opponent in some other game, or that the source opponent chose its best legal response. Its actual effect is bounded by the continued later bot decisions. Specifically, this fork does not resolve the opponent's known turn29 resource limits: no Energy in hand, an already-used Supporter, and no currently powered backup attacker.

Future source-policy work should consider the complete legal action set, effect/Ability constraints, opponent attack resolutions and independent fresh seeds before promoting an alternative turn29 response into an adversarial-policy certificate. The control and counterfactual must stay under the **historical v3** benchmark; substituting current DDE v4 changes the early game and invalidates root231 comparisons.

**Acceptance:** `sourceReplayMechanicsVerified:false`, `qualifiedForCompetitiveInference:false`. This is one completed engine-decision negative control, 0 new qualified games and no statistical win-rate evidence.
