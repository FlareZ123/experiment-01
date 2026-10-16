# Agent 39: rank-10 opening-position × tactic-order ablation

**Research status:** deterministic pinned-engine decision-policy sensitivity, **not** game-strength or win-rate evidence. Dated 16 October 2026.

## Why this ablation

A prior [source-locked rank-10 opening counterfactual](agent39-active-opening-pivot.md) showed that selecting Shadow Rider Calyrex V as the opening Active Pokémon caused the champion and Hood candidates to attack earlier, while Temple still made zero attacks. A pinned-code audit showed that `SimpleTacticsAi` considers `RetreatTactic` before `AttackTactic`. An initial analysis mistakenly attributed Temple's global-turn-3 retreat to the original Active Shadow Rider V with Psychic Energy. Subsequent [pre/post retreat telemetry CI 38847321592](https://github.com/FlareZ123/experiment-01/actions/runs/38847321592) established the **actual** retreat was from **Lillie's Clefairy ex to Latias ex**, after the opponent had played Prime Catcher on turn 2. The initial skipped-Shadow-Mist explanation was incorrect, so the action-order comparison below stands only as a generic policy ablation. Agent 39 added an opt-in [tactic-order adapter](../../simulation/twinleaf/attack-retreat-order.cjs) that moves the existing `AttackTactic` immediately before `RetreatTactic`, leaving both classes, all card behavior and all other tactic types unchanged.

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

## Candidate-only policy control: two-sided confound demonstrated

After the initial ablation, Agent 39 changed the research runner to support `attackBeforeRetreatCandidateOnly:true`, moving the tactic ordering **only in the candidate's SimpleTacticsAi instance**. The opponent retains its baseline tactic order. The physical candidate seat is derived from each trial's already-frozen A/B identity, and a new executor regression checks the seat map. The chosen policy label in each game explicitly ends in `@seat0` or `@seat1`. The starting-position intervention is unchanged.

| Candidate-only run | Opening pivot | Candidate-only attack priority | Artifact ID / ZIP SHA-256 |
| --- | --- | --- | --- |
| [38847516082](https://github.com/FlareZ123/experiment-01/actions/runs/38847516082) | Off | On | 12023359341 / `6f3f066cef4814fb28276718b52eaad907be66a9e5dca0c15eb934e456eebef5` |
| [38847502406](https://github.com/FlareZ123/experiment-01/actions/runs/38847502406) | On | On | 12024256233 / `db4f10fcd4be340a08323eb93a6950e1a9f73e945f8605b80141018bef2aacaf` |

Both six-game workflows passed, all games terminated with incomplete replay coverage, and both preserved the exact source decks, plan and seeds. The candidate-only attack order controls are *separate experiment arms*; the earlier both-seat arms remain historically reproducible.

| Candidate + slot | Attack-only both seats | Attack-only candidate seat | Pivot + attack both seats | Pivot + attack candidate seat |
| --- | ---: | ---: | ---: | ---: |
| Champion A | 0 / 7 | 0 / 7 | 4 / 12 | **7 / 9** |
| Champion B | 10 / 2 | 10 / 2 | 10 / 2 | 10 / 2 |
| Hood A | 4 / 8 | 4 / 8 | 6 / 4 | 6 / 4 |
| Hood B | 8 / 6 | 8 / 6 | 8 / 6 | 8 / 6 |
| Temple A | 0 / 7 | 0 / 7 | **3 / 9** | **0 / 7** |
| Temple B | 5 / 5 | 5 / 5 | 5 / 5 | 5 / 5 |

**Critical correction:** The apparent Temple A 0 → 3 attack change in the both-seat combined arm **disappeared when the opponent's tactic order was held constant**. Thus it cannot be claimed as an improvement attributable to the candidate's earlier attack decision. The both-seat arm changed Regidrago's behavior and yielded Mimikyu Filch/Copycat attacks through a diverged board. Champion A's recorded attack and opposing attack totals also changed strongly when only the candidate rather than both bots received the policy. A naive optimizer using attack frequency would have rewarded an opponent-side intervention as though it were a candidate-side advance.

The candidate-only combined Temple A stayed at zero, while the champion and Hood A still attacked under the opening pivot. This narrows the missing Temple attack problem to **additional positioning, Energy allocation, attack-selection, gust, or matchup dependencies**, none of which is established as a single cause by these traces.

### Read-only retreat telemetry noninterference

An intermediate [six-game manual CI run 38847321592](https://github.com/FlareZ123/experiment-01/actions/runs/38847321592), artifact 12023623484, ZIP SHA-256 `c34a7d2c4c53dabafbbec34f8cd4a440c499c18f0d9649400584c895bff86bdd`, repeated the **same both-seat combined policy** after adding public retreat pre/post evidence. Every trial had identical action ordinals, action types, card names, attacks, terminal transition, source identity, first-turn evidence and status compared with run 38846882316 after omitting only new `retreatTransition` properties. The extra evidence captured 4/5/1/2/1/4 accepted retreats for champion A/B, Hood A/B and Temple A/B, respectively. On Temple A, the t3 retreat was definitively **Clefairy ex → Latias ex**, correcting an earlier unsupported inference.

This noninterference check is conditional on six seeded games and pinned engine; it does not certify hidden actions or the correctness of the underlying card implementation.

## Next evidence gate

1. Candidate-only controls have now been run and falsified the apparent Temple attack improvement in the two-sided policy arm. Preserve candidate-seat-only intervention as the default for interpreting future directional policy claims, while retaining both-seat controls for engine mechanics questions.
2. Verify action-sequence noninterference after the newly added `retreatTransition` public evidence field (read-only pre/post snapshots) by rerunning an existing fixed arm on the same seeds and checking attacks, terminal boards and first-turn proof.
3. Inspect why some branches attack via Mimikyu despite a different earlier starting Active. In Temple, the opponent's Prime Catcher changed Active positioning by turn 3, so a one-Psychic opening Rider does not imply a ready turn-3 Shadow Mist. `AttackTactic` is a utility-evaluating heuristic. Test full legal alternatives and opportunity costs before any recommendation.

A change in attack counts over variable-length engine games is **not a win-rate estimate**. No deck ranking or progress-to-99.5% certification is justified by this ablation.
