# Native source-60 Battle Compressor and shuffle contract

Agent 17, 19 October 2026. **Evidence class:** constructed pinned-Store mechanical regression, with no game-win inference.

## Motivation
The rank-26 Aichi published 60 has Exeggcute PLF ×2 and Battle Compressor PHF ×4. The New Moon provisional 60-card English proxy uses Gengar & Mimikyu-GX TEU and Trevenant & Dusknoir-GX SMP as Perfection attack donors. Pinned generic PlayTrainerTactic chooses only immediate positive-score Item plays; ChooseCardsPromptResolver scores deck discard targets as if they were hand acquisitions. Our source-locked resource-priced selector tests these mechanical gaps.

## Code and invariants
- [Destination-aware discard planner](../../simulation/twinleaf/setup-discard-prompt-planner.cjs): reads only the actor's deck after the actual search prompt is pending; uses explicit discard utility and native prompt validation; reports mandatory off-plan discard. It cannot decide from a concealed deck whether to play the initiating Item.
- [Seven regression tests](../../tests/setup-discard-prompt-planner.test.cjs) passed in compiled CI, including mandatory minimum, blocked targets, multiple Exeggcute, New Moon GX donors and hidden-observation independence.
- [Source-inventory staging](../../simulation/twinleaf/setup-discard-stage.cjs) conserves all 60 exact printed cards and partitions real zones, with targets deliberately in the deck as an affirmative mechanical fixture.
- [Native Store witness](../../simulation/twinleaf/setup-discard-native.cjs) actually dispatches Battle Compressor, closes the printed minimum-1 selection, shuffle and WaitPrompt, and confirms the selected cards and Item reach discard. It uses the existing paper-rule Compressor minimum hook.

## Independent pinned shuffle bug
The **first compiled run [39328326400](https://github.com/FlareZ123/experiment-01/actions/runs/39328326400) failed** because pinned Twinleaf a9905a76's `ptcg-server/src/game/store/prompts/shuffle-prompt.ts` calls `s.sort()` on a numeric index array. JavaScript sorts without a comparator lexicographically, so legal permutations with 11+ indexes fail the validator.

Our [reversible research adapter](../../simulation/twinleaf/shuffle-deck-numeric-order-hook.cjs) validates true full integer permutations, rejects duplicate/out-of-range/noninteger values and restores the original method. Upstream vendor files are unchanged.

## Successful full prompt evidence
**Second compiled [manual CI 39328901605](https://github.com/FlareZ123/experiment-01/actions/runs/39328901605) PASSED**, with all seven tests passing. [Archived exact two-case output](https://github.com/FlareZ123/experiment-01/actions/runs/39328901605/artifacts/12223711442) records:

| Staged exact-60 inventory | Selected actual native discard | Original legal shuffle accepted? | Corrected lifecycle |
| --- | --- | --- | --- |
| Aichi source rank 26 | Exeggcute PLF ×2 | No | Accepted; 0 pending prompts |
| Provisional New Moon English proxy | Gengar & Mimikyu-GX TEU and Trevenant & Dusknoir-GX SMP | No | Accepted; 0 pending prompts |

Both rows affirm 60-card conservation, native Store acceptance, corrected shuffle and zero competitively qualified games. The archive preserves the unchanged pinned engine ID and workflow SHA 66fbadf794aa136703d49025239f02268143cfbd.

## Boundaries and handoff
The manually staged hands, prizes and deck targets are **positive controls**, not random source-dealt game states. Utility values (+9 Exeggcute, +9 Gengar, +7 Trevenant, -100 elsewhere) are uncalibrated examples. No evidence here proves that the full bot initiates Battle Compressor, reaches Perfection, is hidden-information-safe, or wins a matchup. Source rank26 actual held-Item failures and New Moon payload failures remain to be paired with this positive control under the common source-owner policy.

Agent 4 / Agent 9: reuse native target-selection control with the frozen held-Item cohorts and retain negatives. Agent 10: consider the shuffle fix as an **opt-in engine compatibility hook** for a versioned bilateral policy, with a separate owner-visible decision layer to initiate Items. Verify both actors' action and hidden-state parity before any win-rate claim.

**Benchmark remains 29/32 exact published opposing lists, zero competitively qualified games and no demonstrated fixed-60 99.5% result.**
