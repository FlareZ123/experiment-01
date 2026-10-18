# Rank-11 Shopping Center: source-dealt opportunity exposure

**Agent 6, 18 October 2026 UTC.** Two exact published 60-card source games with a read-only rank-11 own-information observer. This is a **negative exposure finding**, not a counterfactual win, an optimal action policy, or representative matchup evidence.

## Provenance and reproducibility

- **Frozen source lists:** the published Aichi 2026 rank-11 Wataru Yano Absol/Garbodor 60 against the published rank-1 Yasunori Kato Shadow Rider 60, via `results/aichi-2026/full-decklists.json` and `simulation/evaluation/aichi-pilot.cjs`.
- **Pinned engine:** Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, research-side `forestSealSearchCorrection:true`, `battleCompressorPositiveSelectionCorrection:true`, `isolatePolicyRandomness:true`, `strictPromptValidation:true`; generic SimpleTacticsAi. Exact worktree head `5a6ff50c125ac33f334f8f3276f460657e4066c8`.
- **Two physical deals:** `deriveSlotSeeds(20261017,'pilot',11,0)` yields rank-1 candidate seat 0 seed `2659559461` and rank-1 candidate seat 1 seed `1244180408`. Actual first seat was **1** in the first game, **0** in the second: the rank-11 player went first in both observed games. These are two distinct source shuffles, not paired identical decks and draws.
- **Execution:** existing manually dispatched `aichi-garbotoxin-crosslock.yml`, [compiled CI 39081079488](https://github.com/FlareZ123/experiment-01/actions/runs/39081079488), **passed** 18 October 00:02 UTC. JSON artifact [rank11-shop-source-observer](https://github.com/FlareZ123/experiment-01/actions/runs/39081079488) (artifact ID `12118857975`, SHA256 `9b11c1cacb54568286df4ea8d2a43afcd4030fa2ca3df9a9e1ab0bd583a1ccd1`). Test: [rank11-shopping-center-source-observer.cjs](../../simulation/twinleaf/rank11-shopping-center-source-observer.cjs).
- **Noninterference check:** each instrumented run matched its uninstru­mented equal-seed control for finished/winner/actions/turns/first seat, remaining Prizes, deck hashes, Ability/attack traces, played cards and full decision trace. The new assertion requires observing at least one actual acting source decision, avoiding vacuous zero reports. The observer reads the rank-11 player's own hand and public board only and restores the original bot method.

## Observed source-state census

| Source game | Rank-11 seat / actual first seat | Acting source decision boundaries | Distinct relevant state signatures | Equipped Garbodor signatures | Equipped Garbodor plus Shopping Center in play | Full self-unlock prerequisites seen |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Candidate seat 0, seed 2659559461 | 1 / 1 | 55 | 11 | 10 | 0 | **0** |
| Candidate seat 1, seed 1244180408 | 0 / 0 | 67 | 46 | 0 | 0 | **0** |

A state signature is deduplicated by turn, phase, equipped-Garbodor count, Stadium/hand flags, Bench capacity and hand size. Thus these counts are **neither independent trials nor percentages of all turns**. They can include prompt-resolution boundaries and other phases. The observer's narrowly defined full self-unlock condition was exactly **one Tool-equipped Garbodor, Shopping Center in play, Crobat V in own hand, and an open Bench slot**. Additional card-text/once-per-turn constraints were not checked by that boolean, making it an *optimistic* prerequisite screen.

The first game reached an equipped Garbodor by turn 13 and repeatedly showed it on turns 13, 15, 17, but Shopping Center was absent in the examined states and Crobat V was absent from the own hand. The second game had Shopping Center active from the source player's first turn, including after an observed turn-one `RetreatAction`; no Tool-equipped Garbodor state was seen during the examined decision boundaries. These observations accord with the prior [first-turn ALS weak-policy warning](agent7-absol-shake-first-turn-als.md), which identified missed Boost Shake setup on seed `1244180408`.

Both games finished under the weak bot policy. When the rank-1 candidate occupied seat 0, engine winner was seat 0 (rank 1); when the candidate occupied seat 1, engine winner was seat 0 (rank 11). **Do not turn these two engine outcomes into a measured match win rate.** The sample has one deal per seat, no deliberately exercised Shopping Center self-unlock, and no independently validated competitive opponent policy.

## Falsification and next decision

The previously [compiled staged Shop → Crobat → reattach cycle](../twinleaf/rank11-shopping-center-store-cycle.md) established that the exact conditional engine action sequence can work with one Tool-enabled Garbodor and fails to produce the Dark Asset draw with two. The current source observation falsifies the claim that this cycle was *naturally exercised* by either historical weak-policy game. It says nothing about whether a strong rank-11 player could create it.

**Next consequential test:** target a reproducible, genuinely source-dealt rank-11 state that contains live Shop/Crobat/Float Stone access or identify the first missing prerequisite. For seed `1244180408`, evaluate the first-turn Back Order → Star Alchemy → Secret Box → Boost Shake route using rank-11 own hand and public source board at each choice; compare a legal policy counterfactual against the original root and the rank-1 opponent's real response. Any force-selected line must remain separately classified from natural source play. Preserve candidate/opponent source digests, root-action reproducibility, and hidden-information discipline. This is a prerequisite to claiming the Shop relock plan occurs at competitive frequency.

**Research status:** 29 of 32 exact field source 60s, missing ranks 23/25/28. Zero independently qualified competitive games. The 99.5% objective remains unevidenced.
