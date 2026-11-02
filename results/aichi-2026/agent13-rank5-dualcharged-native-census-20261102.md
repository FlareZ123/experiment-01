# Agent13: original rank-5 v3.1 native dual-charged Mew census across the full eight-arm developmental cohort

**2 November 2026 | read-only audit, no native action intervention, no qualified game result.**

Source is the untouched rank5 original Mew/Genesect printed60, SHA `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`. Original frozen [Agent13 v3.1 CI 41387484608](https://github.com/FlareZ123/experiment-01/actions/runs/41387484608) artifact **13115652707**, archived ZIP SHA256 `62201010d3930bfa47ae7927fe960b22ff38fba1aa053a53b419bc0a3aaab69d`; raw JSON SHA256 **`7b35948d130495f97349ef3f030fcd62a8f33f990c32a8a4973e878b259ec792`**, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. All eight integratedV3 native attempts and all original root actions were retained; the outcome statuses below are engine-only or censored.

A strict archive census scans actual source attack public-board snapshots on each source's physical seat, counting *distinct* Mew VMAX with **DCE on Active and another DCE on Bench**, then finds the first next source-owned material root after each charged attack. It excludes `ResolvePromptAction` from the next-action search and does not infer legality from the presence of two Energy.

| Actual original native trial | Source attacks | Dual-charged attack snapshot(s) | Next source material action | Native outcome |
| --- | ---: | --- | --- | --- |
| 5:0:A:champion-reference | 0 | None | N/A | action limit |
| 5:0:A:new-moon-lockbreaker-v1 | 0 | None | N/A | action limit |
| 5:0:B:champion-reference | 0 | None | N/A | engine terminal |
| 5:0:B:new-moon-lockbreaker-v1 | 0 | None | N/A | engine terminal |
| 5:1:A:champion-reference | 3 | T27 root123, full Bench | None, game ended | engine terminal |
| 5:1:A:new-moon-lockbreaker-v1 | 4 | T29 root130 and T33 root144, both full Bench | **T31 Pass root138** after T29; game ended after T33 | engine terminal |
| 5:1:B:champion-reference | 0 | None | N/A | action limit |
| 5:1:B:new-moon-lockbreaker-v1 | 1 | None | N/A | action limit |

**2/8 developmental attempts** had at least one real two-DCE-charged Mew attack snapshot; **3 such attack snapshots** across those attempts; **1 source-next-turn Pass after such an attack**. Six trials had no two-Mew charged source attack (five with zero source attacks at all, one with one). These are descriptive counts for a handful of pre-registered, correlated, noncompetitive engine attempts, **not an estimate of the frequency under human play or an effect rate**. The championship-reference branch ended immediately upon the T27 attack; only New Moon T31 is a meaningful archived untried cooldown-pivot opportunity.

The exact New Moon natural-game tactical counterfactual, printed attack effects, A-03 full Bench legal Retreat, possible earlier two-Prize terminal and unresolved native owner restriction are documented in [Agent13's natural dual-Mew study](agent13-natural-double-mew-cooldown-pivot-20261102.md). The actual T31 move was a Pass, so legal alternate action and engine consequence still require a full pinned-Store state fork.

Reproduce on the original uncompressed JSON from artifact 13115652707 using `scripts/agent13-rank5-two-charged-mew-source-census.cjs`, whose source and actor seat are extracted from each raw native arm, without inferred hidden data. `tests/agent13-rank5-two-charged-mew-source-census.test.cjs` covers positive distinct charged Mew, nonmatch and missing-board negative cases. Two local pure tests passed; the census itself was **actually run against and SHA-verified with the original full 32 MB native JSON**. No further CI game workload is required to reproduce this read-only audit. 29/32 original published source lists remain authenticated; competitive-qualified game count **0**.

