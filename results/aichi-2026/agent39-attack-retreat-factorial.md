# Agent 39: rank-10 opening-position × tactic-order ablation

**Research status:** deterministic pinned-engine decision-policy sensitivity, **not** game-strength or win-rate evidence. Dated 16 October 2026.

## Why this ablation

A prior [source-locked rank-10 opening counterfactual](agent39-active-opening-pivot.md) showed that selecting Shadow Rider Calyrex V as the opening Active Pokémon caused the champion and Hood candidates to attack earlier, while Temple still made zero attacks. A pinned-code audit then showed that `SimpleTacticsAi` considers `RetreatTactic` before `AttackTactic`, and the Temple pivot trace included a global-turn-3 retreat from Shadow Rider V holding Psychic Energy. Agent 39 added an opt-in [tactic-order adapter](../../simulation/twinleaf/attack-retreat-order.cjs) that moves the existing `AttackTactic` immediately before `RetreatTactic`, leaving both classes, all card behavior and all other tactic types unchanged.

The two interventions were varied independently with the same three fixed 60-card inventories, rank-10 Regidrago source list, frozen campaign digest `22c25a00dc7e51cff54ed93cd9d1111128a3085e20236d10c4b84a09e9d18890`, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `independent-slots-v2` seed schedule, six 600-action-bound trials per arm, and all baseline correction hooks. For this first ablation, **tactic order is applied to both bots**. A narrower candidate-only ablation is described as a next evidence gate.

## Reproducible manual CI

| Arm | Opening Shadow Rider V first | Attack before retreat | GitHub Actions run | Artifact ID and ZIP SHA-256 |
| --- | --- | --- | --- | --- |
| 00 | No | No | [38845353476](https://github.com/FlareZ123/experiment-01/actions/runs/38845353476) | 12023246166 · `35ed9e01b55ba4c7634940aabe84297f0ae9892000b1933e48c3953d0177e7ab` |
| 10 | Yes | No | [38846304807](https://github.com/FlareZ123/experiment-01/actions/runs/38846304807) | 12023093996 · `d003febd8636f2be1cd3669968d9a85903cb69ed77e9dd0f3f19e4fca51008c9` |
| 01 | No | Yes, both seats | [38846900525](https://github.com/FlareZ123/experiment-01/actions/runs/38846900525) | 12024245390 · `3b2b4f0973e67e9f11b0f1ecdec08a3ce85fd6d8a8937a31f3c511deb8e7ea83` |
| 11 | Yes | Yes, both seats | [38846882316](https://github.com/FlareZ123/experiment-01/actions/runs/38846882316) | 12023323510 · `3464c455371b5327d3325795985bf60816a357e9971609b5816e3faf8284245c` |

All four runs completed successfully with complete six-trial rank-10 archives. All records were engine-completed and all retained source plan identities; none was certified a competitive game. All opt-in branches are versioned in each engine policy label. The original 00 archive came from a larger rank-2/rank-10 combined run and is filtered here to rank 10.

## Observed attack counts, candidate/opponent

| Candidate + slot | Arm 00 | Arm 10 | Arm 01 | Arm 11 |
| --- | ---: | ---: | ---: | ---: |
| Champion A | 0 / 7 | 6 / 7 | 0 / 7 | 4 / 12 |
| Champion B | 5 / 1 | 5 / 1 | 10 / 2 | 10 / 2 |
| Hood A | 4 / 8 | 6 / 4 | 4 / 8 | 6 / 4 |
| Hood B | 8 / 6 | 8 / 6 | 8 / 6 | 8 / 6 |
| Temple A | 0 / 7 | 0 / 7 | 0 / 7 | **3 / 9** |
| Temple B | 5 / 5 | 5 / 5 | 5 / 5 | 5 / 5 |

**Physical slot A** was first player in these rank-10 seeded games; B was second. The two interventions are not separately sufficient for a Temple-A attack in this exact trajectory; the combined branch yields three. Those attacks were **Filch (turn 11), Copycat (turn 13), Copycat (turn 15)** from Mimikyu rather than Shadow Mist from Shadow Rider V. In the combined champion-A case, the previously six-attack pivot path became **three Shadow Mist and one Eon Blade**, with more opposing attacks recorded. These details demonstrate substantially changed board trajectories and reject the idea that prioritizing an available attack is always beneficial.

Rank-10 champion B illustrates that altering both bots' tactic order changed the later trajectory from five candidate attacks to ten, even though the setup pivot did nothing to B. This is a deliberate **two-sided policy confound**; the result proves action-policy sensitivity but cannot by itself attribute a candidate advantage or determine whether the opponent's responses remain realistic.

## Next evidence gate

1. Use new candidate-slot-only `attackBeforeRetreatCandidateOnly` option in the headless source-locked runner, preserving the baseline opponent's original tactic ordering, then repeat the two attack-priority arms. This restricts the immediate intervention to one evaluated candidate without claiming identical future stochastic histories.
2. Verify action-sequence noninterference after the newly added `retreatTransition` public evidence field (read-only pre/post snapshots) by rerunning an existing fixed arm on the same seeds and checking attacks, terminal boards and first-turn proof.
3. Inspect why some branches attack via Mimikyu despite an already-powered opening Shadow Rider V; `AttackTactic` is a utility-evaluating heuristic and early attacks may be strategically inferior to board development. Test actual legal alternatives and opportunity costs before any recommendation.

A change in attack counts over variable-length engine games is **not a win-rate estimate**. No deck ranking or progress-to-99.5% certification is justified by this ablation.
