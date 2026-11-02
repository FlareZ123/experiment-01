# Original rank-10 Celestial Roar: Store-accepted Energy receipt reconciliation

2 November 2026. This post-run reconciliation extends [the earlier three-pair failure recovery](agent27-regidrago-original-min2-recovered-20261102.md). It uses the existing native matched-source runner and no new gameplay policy.

[Manual compiled CI 41455347443](https://github.com/FlareZ123/experiment-01/actions/runs/41455347443) passed on repository revision `3a2eb541ecbf15aa5a8b03c3d046ecd08eca634f`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The retained [raw artifact](https://github.com/FlareZ123/experiment-01/actions/runs/41455347443/artifacts/13146956248) includes the original three paired JSON records. The added read-only [summary program](../../scripts/agent27-native-attach-summary.cjs) records actual `Store.dispatch` resolution and physical Energy movement, independently of the bot resolver's speculative proposal counter. Three regression tests passed in the same run.

| Fixed seed | Original rank-10 seat | Original control | Corrected actual accepted two-card prompts | Native physical transfer receipt | Corrected end |
| --- | --- | --- | ---: | --- | --- |
| 20261106 | 0 | Invalid mandatory prompt 57 | 1 | Prompt 57, global turn 20: two different physical Grass Energy MEE copies, Active Energy count 7 to 9 | 110-action cap |
| 20261113 | 1 | Invalid mandatory prompt 37 | 1 | Prompt 37, turn 15: Grass Energy MEE and Double Dragon Energy ROS, Active 1 to 3 | 110-action cap |
| 20261114 | 0 | Invalid mandatory prompt 30 | 2 | Prompt 30 turn 8: Grass and Double Dragon, Active 1 to 3; prompt 61 turn 20: Fire and Double Dragon, Active 4 to 6 | Untimed native terminal, winner seat 1 |

Each of the four native accepted receipts verifies distinct physical cards that came from the prompted source, owner Active destination, source card removal and the actual Energy count increase. All three matched control/repaired original 60-card inventories and initial two-player physical-deal fingerprints agree. Three original controls recorded zero accepted two-card transfers and threw invalid-prompt errors. Repaired arms reported zero settled physical-zone anomalies. Four speculative repair proposals were also counted, but their independent evidence is the native physical acceptance receipts shown above.

This confirms the narrow prompt acceptance and corresponding physical Energy transitions. It does not verify full paper-game legality, a strategically competent opponent, complete action chains through attack/Prize/outcome, or a realistic match clock. Exactly **zero** competitively qualified games and no established 99.5% field result follow. The shared frozen bilateral policy has not been changed.
