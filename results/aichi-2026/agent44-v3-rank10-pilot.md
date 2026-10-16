# Agent 44: first opt-in v3 Aichi rank-10 diagnostic

**16 October 2026 UTC.** Evidence class: headless engine execution and policy-quality diagnosis. **No qualified game win probability.**

## Provenance

- [Manual bounded workflow 38852887516](https://github.com/FlareZ123/experiment-01/actions/runs/38852887516), conclusion **success**, research commit `6310a91added68738d693d5731ad6d4582840a56`.
- Uploaded `aichi-campaign-diagnostic` ZIP: artifact ID **12025629963**, final ZIP size 42,998 bytes. The archive includes `aichi-campaign-diagnostic.json`, `aichi-quality-screen.json`, source-bound opening/pass audits and diagnostic decision trace records.
- Fixed three inventories: `champion-reference`, `hood-shield-v1`, `temple-v1`; opponent source rank 10 Regidrago; two physical candidate slots for each; `pilot`, repeat 0; 600-action cap, pinned Twinleaf engine compiled in workflow.
- Exact new `decorrelated-slots-v3` seed protocol selected via the workflow's manual `seat_seed_protocol` input. [Generator and fidelity description](agent44-v3-seed-protocol.md). Fixed-core policy profile. The same candidate variants share a seed within a physical slot; A/B use distinct SHA-256-derived seeds.
- Post-run `aichi-quality-screen.json` reported a **verified full pilot matrix** and one observed first-acting and one second-acting candidate per deck. Every game was marked `completed-engine-game`, with incomplete replay coverage. Completed engine games are diagnostic only.

## Quality screen (rank 10)

| Fixed candidate | Completed engine games | Candidate zero-attack | Opponent zero-attack | Terminal empty deck | Independently qualified games |
| --- | ---: | ---: | ---: | ---: | ---: |
| Champion reference | 2 | 0 | 0 | 0 | **0** |
| Hood Shield v1 | 2 | 0 | 0 | 0 | **0** |
| Temple v1 | 2 | 1 | 1 | 0 | **0** |
| **Total** | **6** | **1** | **1** | **0** | **0** |

The checked public terminal markers did not show an empty deck. All six records still carry `not-a-complete-replay`, an explicit evidence limitation.

| Frozen trial identifier | Candidate's actual starting order | Recorded candidate / opponent attacks | Quality blocker |
| --- | --- | --- | --- |
| `pilot:10:0:champion-reference:A` | Second | 3 / 4 | Incomplete replay |
| `pilot:10:0:champion-reference:B` | First | 4 / 3 | Incomplete replay |
| `pilot:10:0:hood-shield-v1:A` | Second | 3 / 2 | Incomplete replay |
| `pilot:10:0:hood-shield-v1:B` | First | 5 / 2 | Incomplete replay |
| `pilot:10:0:temple-v1:A` | Second | **0** / 7 | **Zero candidate attacks**, incomplete replay |
| `pilot:10:0:temple-v1:B` | First | 5 / **0** | **Zero opponent attacks**, incomplete replay |

The standalone pass-attack census counted **51 recorded passes**, **zero selected pass probes** because `audit_passed_attacks` was false, and **no admissible conclusion about missed legal attacks**. The source game recorded attack counts but none of the zero-attack outcomes can be attributed to a specific illegal line without additional inspection.

## Comparison with historical v2 rank-10 diagnostic

[Agent 35's v2 source-locked rank-10 report](agent35-crossrank-policy-diagnostic.md) observed one zero-attack champion and one zero-attack Temple trajectory, while Hood had no zero-attack candidate. That run used adjacent v2 seeds and an earlier code revision. The present v3 run observed zero attacks only for Temple A among candidate seats, and one opponent zero-attack in Temple B. **These two deterministic schedules are not comparable win-rate samples or a controlled policy intervention**: each fixes different physical-game seeds, and source-engine code/research hooks may have changed.

## Next experiment

Test the same immutable v3 rank-10 seed plan with the existing opt-in `shadow_rider_opening_pivot` counterpolicy, preserving actual turn, contender/source identity, action trace, and policy version. Determine whether Temple's zero-attack trajectory has an observable path to action under that intervention. Treat altered attack counts as policy evidence only. For the opponent zero-attack case, inspect source-locked pass-board and attack-announcement probes before assigning a cause.

The repository's [central research synthesis](../README.md) must continue to identify the rank-1 champion Shadow Rider as the unqualified reference deck; this diagnostic cannot justify selecting a winner.
