# Compiled rank-11 turn-49 Quick Ball policy reversal

**Agent 10, 19 October 2026.** This report supersedes the pending-status paragraph in [the registered protocol](rank11-turn49-quick-ball-live-store-fork.md). Evidence classification: retrospectively selected, source-dealt, single-seed simulator counterfactual.

[Manual CI 39184733634](https://github.com/FlareZ123/experiment-01/actions/runs/39184733634) passed on pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Archived Actions artifact 12157717358 has ZIP SHA256 `16e0ac5075eb218dac5fd9c4785509289017782a499fc1d9ee5754673f29810f` and inner JSON SHA256 `01831a9a4b800ad5f3548a0fd4667c7ec7d30d9065fc4d51724d272a4e2de82a`. Source rank11 and New Moon deck hashes remained `ca1a7ce02983c438146f30bf01f303cf8210836f9e442e0d21a2513850ffcb18` and `99969539010abfa11c4e671a5744ed4d97f23cf2f7f275399ac35f5bc1013c0f`.

## Results

| Source seed 1244180408 | Baseline rank11 policy | Live Quick Ball alternative |
| --- | --- | --- |
| Real rank11 Quick Ball Items played on global turn 49 | 0 | 3 |
| All three actual discard and search prompts complete | N/A | Yes |
| Store Item legality failures | N/A | 0 |
| Final engine winner | New Moon, seat B | Rank11, seat A |
| End global turn / root action | 50 / 300 | 55 / 342 |
| Remaining Prize cards: rank11 / New Moon | 6 / 0 | 0 / 1 |

The source opponent's authentic first turn and **every root action before global turn 49** matched the original baseline. Its three Quick Ball Store dispatches appeared at root ordinals **288, 293, 298**. The genuine discard choices were Boost Shake, VS Seeker, and Carmine. The three restricted Basic deck searches each selected zero cards and completed. A third arm checked that removing all policy wrappers reproduced the baseline root ledger identically.

The owner started turn 49 with ten Trainer cards and one Darkness Energy. After discarding three Quick Balls plus three other Trainers, its physical hand retained **Secret Box, Guzma, Carmine, Dark Patch and Darkness Energy**. The research runner's incidental `trainersLeft:0` counter is incorrectly computed from the compiled card-category representation; the recorded physical hand inventories show **four Trainers**. Treat the field as a known reporting bug and prefer the authenticated hand list.

The baseline New Moon selected delegated Poltergeist on turn 50 while rank11 held ten Trainers, with 500 printed base and a Knock Out. The alternative source trajectory made the same natural candidate bot **play Forest Seal Stone and pass on turn 50**. There is therefore **no real turn-50 Poltergeist damage measurement** in the fork. Rank11 continued Claw of Darkness at global turns **49, 51, 53, 55**, eventually taking all its Prizes.

## Interpretation and open qualification

This is an executed opponent-resource-to-candidate-response counterexample demonstrating that the historic New Moon engine winner is highly sensitive to a legal, owner-information-constrained opponent decision. It directly challenges any assertion that the earlier 50-turn New Moon win establishes strong competitive gameplay.

The changed hand composition may affect attack selection. Legitimate deck-search shuffles also change subsequent random trajectories, and the existing bots may make weak decisions. Consequently, the result **does not isolate one hand-count mechanism or demonstrate a human-quality policy**. The seed was chosen retrospectively, simulation is untimed, the challenger uses an English-printing proxy, and the full paper rules reducer has not been independently certified. All such games remain excluded from win-rate estimates.

**Research status remains 29/32 exact opposing field lists, zero competitively qualified games, and no evidenced fixed-deck 99.5% performance.**
