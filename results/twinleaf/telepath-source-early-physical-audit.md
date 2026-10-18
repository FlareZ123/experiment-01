# Early source Telepath physical-zone audit (18 October 2026)

Agent 3. Evidence: [successful compiled manual CI 39083352390](https://github.com/FlareZ123/experiment-01/actions/runs/39083352390), head `c1b1e46bbeaaffcba2b55d5f5559264b2d13f809`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Machine-readable artifact 12119542290](https://github.com/FlareZ123/experiment-01/actions/runs/39083352390/artifacts/12119542290). [Reproduction source](../../simulation/twinleaf/aichi-telepath-physical-source.cjs). Both physical seats of published ranks 9, 30, 31 versus published rank 1, fixed seeds `2026101818, 2026101819, 2026101860, 2026101861, 2026101862, 2026101863`. Each game was capped at 120 root actions. No optional Telepath correction.

| Rank | Champion seat | Seed | Live actions | End | Anomalous actions |
| --- | ---: | ---: | ---: | --- | ---: |
| 9 | 0 | 2026101818 | 120 | cap | 0 |
| 9 | 1 | 2026101819 | 120 | cap | 0 |
| 30 | 0 | 2026101860 | 96 | engine-finished | 0 |
| 30 | 1 | 2026101861 | 120 | cap | 0 |
| 31 | 0 | 2026101862 | 120 | cap | 0 |
| 31 | 1 | 2026101863 | 120 | cap | 0 |

Across **696** live root actions the read-only diagnostic detected no canonical duplicate card references, ghost Energy indexes, or repeated Energy indexes. Five trajectories reached the bound and only one finished. This tests card ownership consistency during the examined horizon. It neither measures win rate nor determines whether non-hand Telepath attachments occurred. The separately reproduced staged [origin defect](telepath-attachment-source-confusion.md) remains confirmed.

**Detector improvement initiated:** the first instrument did not flag a card absent from all scanned zones. A separate `fixedDeckCountAnomalies` check now requires the canonical card count to equal 60 for each seat at an actual root boundary and adds a pure regression for missing and excess cards. Verify this extended invariant against the same source seeds in a new compiled run before drawing conclusions. An observed count mismatch requires analysis for possible temporary card custody.

**Outstanding:** distinguish root non-hand `AttachEnergyEffect` from speculative policy clones and confirm printed from-hand trigger semantics. 29/32 Top 32 exact lists exist, zero competitively qualified games, and no 99.5% performance evidence.

## Compiled fixed-60 conservation follow-up

[CI 39092289866](https://github.com/FlareZ123/experiment-01/actions/runs/39092289866) passed, head `545ebc57c92d28326f8d8259d78cd73fd12cf60e`, [machine artifact 12122274960](https://github.com/FlareZ123/experiment-01/actions/runs/39092289866/artifacts/12122274960). Same six authentic source seeds, 696 live root actions. The stronger fixed-60 conservation check found **269 root boundaries with at least one count mismatch**, divided by rank/champion-seat as 9: 108/1; 30: 70/0; 31: 0/90. First mismatches: 59 cards at rank9 seat0 action13, 56 at rank9 seat1 action15, 59 at rank30 seat0 action9, and 59 at rank31 seat1 action31. Each first mismatch followed a PlayCardAction. No separate canonical-reference duplicate or attached-Energy index anomaly appeared.

This red invariant is presently **unattributed**. The scanned canonical zones might omit a legitimate card-custody area. A count below 60 is a detector observation rather than proof of engine card loss. An additional seeded source action-context rerun is testing the first offending card play; its result must be inspected before asserting a bug. The game win-rate qualification status remains zero.
