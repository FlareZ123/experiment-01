# Regidrago Double Dragon v4: two-seat authentic-source clone compatibility

**Agent 20, 17 October 2026. Compiled pinned-engine experimental diagnostics.** Full manual [CI 39031471155](https://github.com/FlareZ123/experiment-01/actions/runs/39031471155), head `14bd43865a8c99b34a72f99e40c2c247f37fcbc1`, passed all steps, including the new `SOURCE_DDE_V4_CLONE_SEAT_PANEL` test in [`tests/dde-attach-priority.test.cjs`](../../tests/dde-attach-priority.test.cjs).

## Question and test design

The previous [clone-local identity fix](dde-clone-local-card-identity.md) established a correct attachment decision in a staged state under the pinned and experimental prototype-safe Simulator classes. Does this change also preserve bounded **source-dealt** observations with the exact published Rank 10 **Haruku Yoshioka Regidrago 60** against Rank 1 **Yasunori Kato Shadow Rider Calyrex 60**, in both actual starting orders?

[Reproduction](../../simulation/twinleaf/dde-source-clone-seat-panel.cjs) resolves the two source 60s through the field resolver; the **same list** is used under both Simulator profiles. It enables only `doubleDragonRecovery:true` and per-seat experimental policy RNG separation; otherwise the weak `SimpleTacticsAi` remains. At each fixed physical-seat/seed pair, run exactly one pinned-Simulator and one `prototypeSafeSimulatorIsolation:true` match, each bounded to **350 live actions**. The starting order is recorded only when corroborated by the engine's **draw-log** evidence. Source card counts, source ranks, seed, actual starting identity, engine revision and policy version are fixed and asserted.

**Engine revision:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. **Research policy:** `DoubleDragonAttachTactic-v4` (live/cloned attachment card identity correction), shared tag between headless and evaluator. Seed plan is the previously published decorrelated-v3 pair used for Rank10. This test establishes neither source-policy competence nor semantics of all Expanded cards.

## Engine-observed outcomes (clone pair per starting condition)

| Rank10 physical slot | Frozen seed | Verified Rank10 actual start | Engine profile | Match finish at cap | DDE played by Rank10 | Rank10 Apex Dragon attacks | Rank10 / opponent printed attack counts | Prizes remaining Rank10 / opponent |
| --- | ---: | --- | --- | --- | ---: | ---: | --- | --- |
| A | 3162592764 | **second** | pinned | action limit at 350 | 3 | 30 | 30 / 2 | 2 / 4 |
| A | 3162592764 | second | prototype-safe | action limit at 350 | 3 | 30 | 30 / 2 | 2 / 4 |
| B | 4246551499 | **first** | pinned | finished at 211 actions | 2 | 0 | 2 / 4 | 3 / 0 |
| B | 4246551499 | first | prototype-safe | finished at 211 actions | 2 | 0 | 2 / 4 | 3 / 0 |

Both paired seeds had **`verifiedByDrawLog:true`**, with engine `firstTurnSlot:1` for both physical seeds; because Regidrago's physical slot differs, the two selected deals cover its *actual* first and second starts. Both simulator profiles produced identical deck hashes, first-turn attribution, actions, turns, attack counts, DDE plays, printed Apex attacks and terminal Prize counts within each pair. The source 60 deck hashes were:

- Regidrago: `527f78a6ed10b7895c34b230d900974aa2b94db3ef2eee9f970d5eab9c875db9`
- Shadow Rider: `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`

The rank10-second **350-action cap is a timeout**, so its remaining Prizes are a diagnostic only. In the rank10-first game, the source-engine termination has Regidrago at three remaining Prizes against zero opposing Prizes; such an outcome is a weak-policy simulator result rather than a qualified game loss for a competitive comparison. The extreme **30-Apex-versus-zero-Apex difference** across the two seeds is a warning about play policy, context and setup dependencies. It cannot be attributed to starting order alone, because the two independent seeds yield different hands and trajectories.

The panel compares selected aggregate observations rather than full time-stamped action traces and every intermediate Store state. Numerical equality under the experimental clone is therefore a **bounded compatibility observation**, and must not be mistaken for proof that cloning is fully effect- or information-set-equivalent.

## Data integrity and non-inference

This is four engine trajectories from **two source-dealt initial conditions**. Paired profiles were deliberately correlated, and opponent play is not demonstrated strategically credible. One game hits the action cap, the other shows no Apex attack and an engine loss for the Regidrago seat. **Competitive qualified games: 0.** In particular, neither these two source states nor their mechanical parity supports a win fraction, confidence interval or any advancement toward 99.5% against the full Top 32.

The [compiled regression](../../tests/dde-attach-priority.test.cjs) also contains the separate single-action DDE clone test and the pre-existing effective-Energy matcher tests. The console log exposes the machine-readable `SOURCE_DDE_V4_CLONE_SEAT_PANEL` JSON with each game's deck hashes, seeds, start flags, counts and mode. To strengthen the gate, compare full action and Store-state histories under each clone mode, check actual source decisions against informed policy choices, then repeat across multiple predeclared deals and opponents without changing the candidate list.

## Relevant source-field prevalence

For scope, [the 29 published Top32 source lists](../aichi-2026/full-decklists.json) contain **nine Regidrago complete 60s**, at ranks 10, 12, 13, 14, 18, 20, 21, 27 and 32. They hold **34 Double Dragon Energy across 88 total printed Energy slots (38.636%)**; seven of the nine lists play four DDE, while ranks 13 and 21 play three. The other two Regidrago placements, **ranks 23 and 28**, lack registered lists and are expressly excluded. This census explains why dynamic DDE scoring is a relevant opponent-policy quality gate; it says nothing about tactical decision accuracy, card value or matchup results.
