# Agent26: separated setup shuffle streams reveal two independent sources of paired-world divergence

**30 October 2026 | Evidence: complete pinned native Store 32-setup diagnostic, an alternative randomization protocol; no full-game outcomes.** All 32 planned source/candidate pairings came from the **unchanged original Agent41 frozen 16 seed/seat pairs**, printed source/candidate 60s, and pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. We deliberately changed **only the physical player's setup deck-shuffle randomization protocol** for a new posthoc setup-only study. These are **new setup worlds**, distinct from the originally archived native games. No old games were edited, retrospectively excluded or presented as competitive wins.

## Method and raw verification

The research-side [per-seat native ShuffleDeckPrompt hook](../../simulation/evaluation/agent26-per-seat-setup-shuffle-streams.cjs) installs a scoped Store dispatch hook for `ResolvePromptAction` during turn-zero setup, routing player A and player B to their own seeded xorshift32/Fisher-Yates shuffled deck streams. The original headless global seeded random stream still advances for initially proposed shuffles and other stochastic actions. Its native action effects resolve with isolated physical-seat shuffle permutations. The hook restores the Store dispatch method even if the operation fails, and does not modify vendor Twinleaf.

The [full original-registration source-setup runner](../../simulation/evaluation/agent26-perseat-all32-setup-census.cjs) audited **all 32 arms**, preserving per-arm failures, original rank, physical seat, seed and source printings. Every real setup stopped at first settled PLAYER_TURN before gameplay decisions, used exact 60-card inventory conservation and a native first-draw log to verify actual starter.

[Existing manually dispatched CI **40997055073**, SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/40997055073), head `74217d89605f6c4c5ad8d1cff7acf0e7c27ece1a`, archive [artifact **12951647825**](https://github.com/FlareZ123/experiment-01/actions/runs/40997055073/artifacts/12951647825), ZIP SHA256 `70e752d78e01dd42675627762d56227782b4bb27557e9dfe32f7c84b286bf029`, inner JSON SHA256 `813c7331e80472cc31b96c695ea3bee9f1f3b8495192e56fd47ab5b88db30011`. The second [CI **40997285415**, SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/40997285415), head `d0f8403fa83a115ace3ea7226ba230b6749447da`, added **source hand size and deck size** to every setup record without changing the experimental policy; raw [artifact **12951743369**](https://github.com/FlareZ123/experiment-01/actions/runs/40997285415/artifacts/12951743369), ZIP SHA256 `9d940e30ce8e08907d4bdd188c450cf159cd826b864afc2eb7e82d2cad2f22e2`, inner JSON SHA256 `c943f2138672600d6ee5f9cb54e1818931922867540326a0766c966fb13522ef`.

## Exact frozen 16-pair comparison under alternative per-seat shuffle coupling

| Paired original source positions in new randomization protocol | Pairs |
| --- | ---: |
| Eligible rank/seat/seed matched candidate pairs | **16** |
| Pairs with **identical source shuffle permutation sequences** | **16** |
| Pairs with identical source mulligan counts | **16** |
| Pairs with different candidate mulligan counts | **4** |
| Pairs with identical source Active and Bench starting Pokémon | **16** |
| Pairs with identical **complete source physical state** | **15** |
| Pairs with different complete source physical state | **1** |
| Failed or missing original-registration setups | **0** |
| Completed full games / qualified competitive games | **0 / 0** |

This establishes a sharp **mechanistic contrast** to [the original unchanged shared-stream cohort](agent26-all32-original-native-source-setup-reproduction-20261030.md). In the original cohort, **15/16** physical source deals matched and the remaining discrepancy arose from candidate extra redraws shifting the source's final shuffle RNG 59 outputs. In the **per-seat shuffled alternative**, the source permutation sequence matched in **16/16**, including the former problematic `6:3:B`. However, **source final physical state still differed in 1/16**, now `11:1:B`.

### Residual cause: real source mulligan bonus card, despite identical shuffle

For alternate-protocol pair `11:1:B`, source is original rank11 Absol Garbodor, physical seat0, and is the first-turn player in both candidate arms. Both real native setups produce an identical source shuffle permutation SHA sequence (`403707e3...`), source mulligans **zero**, source Active `Mega Absol ex M1L`, source Benched `Oranguru V ASR`, six Prize cards, and **the exact same starting board**.

| Direct real Store source observation | Champion reference opposing | New Moon opposing |
| --- | ---: | ---: |
| Source mulligans | 0 | 0 |
| Candidate mulligans | **1** | **0** |
| Source postsetup hand count (including ordinary first-turn draw) | **7** | **6** |
| Source remaining deck count | **45** | **46** |
| Source Prize copies | 6 | 6 |
| Source complete physical-deal SHA256 | `f5c55f837d64e6dd3093d16d32d8f10d1320dedab0025b0c14bdccc77edef062` | `50b283b8c3e8a73e24da330bca11ccd0969f223b0f5286cef10a878cc72a47c9` |

The source selected **two starting Basics** in both arms (Active plus Bench); the first player's ordinary first-turn draw adds **one** card in each. When the champion candidate mulligans once, the original source opponent has the right to draw one extra card. The **one-card increase in the real source's hand and corresponding one-card decrease in its real deck**, with identical shuffles and board, directly confirms that this optional bonus was **taken** in the champion arm. New Moon's candidate did not mulligan, so the source had no such bonus.

This validates **Agent39's independent post-treatment causal warning** in actual pinned-engine setup states: even perfectly identical source deck shuffle permutations can yield different final source positions, because a candidate inventory's mulligan changes the opponent's legal bonus-draw opportunities. The original source mismatch `6:3:B` arose via **shared game PRNG shuffle advancement with no source bonus draw**. The alternate residual mismatch `11:1:B` arose via an **actual source bonus card with unchanged source shuffle sequence**. These are distinct mechanisms which need independent observability.

### Conclusion for future comparative deck optimization

Use the original frozen cohort to diagnose specific policy/rule failures under the historically implemented shared game RNG. A prospective design with separate per-player shuffle streams can reduce shared-RNG path entanglement, although it cannot force all source positions to be identical without controlling or suppressing the legitimate opponent-mulligan bonus. Any forced identical final-deal filter then selects on a variable partly caused by the candidate 60 and is **not an unconditional candidate inventory comparison**.

**Experimental handoff:** in the canonical two-player candidate-versus-source trace, record (1) preregistered source rank/seed/seat and physical 60s, (2) per-player real setup mulligan counts, (3) source optional bonus offer/choice and actual hand/deck delta, (4) actual first-turn identity, and (5) postsetup source physical fingerprint. Label identical-initial-world counterfactuals separately from unconditional game comparisons. The present original 32 native scout remains **20 engine-completed games, 12 action caps, zero competitively qualified games**. The full target still has missing authentic original lists 23, 25, 28 (29/32); a single fixed 99.5% deck is **unproven**.

## Direct native bonus-prompt verification

The existing read-only Store mulligan-compensation observer was independently connected to our 32 native setup-only captures. [Manual CI run 40997931866](https://github.com/FlareZ123/experiment-01/actions/runs/40997931866) **SUCCESS** on commit `0615399d44bec4f7be63945f13adcec42c8fea9d`, [artifact 12951923973](https://github.com/FlareZ123/experiment-01/actions/runs/40997931866/artifacts/12951923973), ZIP SHA256 `5615b8fe7c9a0bf633b4bb6c7a5964a4b5d3621014e86350123983f0206d01fe`, inner JSON SHA256 `63b5130cf266aaf47c54059a11688123a8a968432e95cf4da223499acf136cac`. All 32 setups verified with zero failures; observed per-player native mulligan counts matched independent native shuffle counts. Rank11 `11:1:B` source actual opponent-bonus **offered/selected/drawn 1/1/1** against champion and **0/0/0** against New Moon. Exactly **1/16** pairs differs in directly observed source bonus cards drawn, exactly matching the only unequal complete source physical deal. This is a real native prompt witness confirming the source hand/deck size interpretation. All results remain setup only and competitively unqualified.
