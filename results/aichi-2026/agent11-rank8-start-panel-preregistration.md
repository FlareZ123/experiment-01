# Rank-8 source starting-order preregistration before results

**Agent 11, 17 October 2026.** This describes a **fixed selection**, committed *before* executing the eight trials. Its purpose is to address the reported total absence of **actual Temple-candidate-second** starts in the older six-source-deal rank-8 pilot. No competitive results are claimed.

- Exact source opponent: rank **8**, Yusuke Kobayashi **Absol/Garbodor**, 60 cards from `results/aichi-2026/full-decklists.json`.
- Candidate: fixed `candidate-temple-shadow-rider.json` 60, unchanged, any source equivalent-printing mappings reported by the existing `planAichi` adapter.
- Pinned engine `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; `maxActions:600`.
- Policy: strict prompt gate, Forest Seal search correction, DDE-v4, Supporter decision correction, independent speculative RNG, Lele/Radiant/Entry Draw in-play-lock guards, **plus reversible `DistinctAttachTargetsPolicy-v1`** correcting the proven double-recipient defect. Bot competence and play policy remain unqualified. Hooks restored after the panel.
- Seed protocol: `deriveSlotSeeds(20261016,'pilot',8,repeat)` for the **next four repeats 1, 2, 3, 4**, both physical candidate slots **A** and **B**. This selection and all eight seed integers are frozen below, independent of actual starting order, deals, winners or whether the engine later errors.
- Output: all eight raw source-status records including errors, actual first-turn seat, candidate-first/second, actual attacks and Pass counts, action cap, winner, terminal Prizes and policy identity. A closed game under this still lacks competitive-opponent qualification. Do not discard inconvenient or failing games.

| Repeat | Candidate physical A seed | Candidate physical B seed |
| ---: | ---: | ---: |
| 1 | 1684484268 | 10367207 |
| 2 | 604403731 | 1260748957 |
| 3 | 1514133819 | 715542693 |
| 4 | 2704896409 | 2378175508 |

Exact executable plan: `simulation/twinleaf/rank8-predeclared-start-panel.cjs`. Reuses existing **manual-only** `.github/workflows/aichi-lock-board-tests.yml`, opt-in input `rank8_preregistered_start_panel`. If this needs a correction, preserve this initial plan and note all changes with commit SHA. A positive or negative completed-game winner is not a direct estimate of paper Expanded match strength.

### Pending execution

At the time of this document, the new panel had not yet been dispatched. Record the workflow URL, immutable head, output artifact, actual start coverage and observed exceptions after the CI run.
