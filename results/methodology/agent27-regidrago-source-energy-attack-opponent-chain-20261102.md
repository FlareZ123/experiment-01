# Original Regidrago source Energy-to-attack-to-opponent chain

> **Qualification update (later same-day post-choice audit):** [Original champion Pass context](agent27-champion-post-roar-pass-context-20261102.md) finds zero held Basic or Special Energy in all four rank-1 Pass hands. No same-root proof of a missed legal attack has been established. Interpret the observed Passes as limited game response, without attributing them to a defective decision policy.

**2 November 2026. Developmental native Store observation of existing three original-source matched replays.** This evidence extends [the accepted two-Energy payment receipts](agent27-regidrago-native-accepted-receipts-20261102.md), without altering either actor's decision-making.

The compiled [manual CI run 41456854080](https://github.com/FlareZ123/experiment-01/actions/runs/41456854080), source revision `017f9ab03c2700ecf8636406e4530d2f99db0329`, succeeded with the earlier original rank10/1 printed 60s, the same source seeds/physical seat orders and pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Pure regression tests](../../tests/agent27-energy-attack-continuation.test.cjs) were executed successfully. The unchanged source-deal SHA matches persisted within every untreated/repaired pair, and the native game status/control repair count remained three failed controls, two repaired action caps and one repaired untimed engine terminal. The only new game instrumentation was read-only `captureDecisionTrace` and `capturePublicAttackTransitions`, with [a fail-closed join helper](../../simulation/evaluation/agent27-energy-attack-continuation.cjs). The raw source's action and public-board traces are retained in the CI artifact, while the [summary](../../scripts/agent27-native-attach-summary.cjs) is printed in the CI job log.

## Actual source and opponent sequence

Each accepted physical `min=max=2` Celestial Roar attachment was joined to exactly one source-ranked Regidrago V *Celestial Roar* declaration in the same global turn, whose attack episode had a natively settled completion root. The opponent was the unchanged original rank-1 Shadow Rider champion list in all three replays.

| Source seed and source seat | Native source attack ordinal, settlement | Prize counts after attack (seat0,seat1) | Immediately following opponent global turn, nonprompt actions |
| --- | --- | --- | --- |
| 20261106, rank10 seat0 | Celestial Roar 85, completed root 89; prompt57 | (6,6) | Turn21: **PassTurn** at root90 |
| 20261113, rank10 seat1 | Celestial Roar 59, completed root 63; prompt37 | (6,6) | Turn16: Play Dialga-GX root64, **PassTurn** root65 |
| 20261114, rank10 seat0 | Celestial Roar 40, completed root 44; prompt30 | (6,6) | Turn9: Play Psychic Energy root45, **PassTurn** root46 |
| 20261114, rank10 seat0 | Celestial Roar 87, completed root 91; prompt61 | (6,6) | Turn21: **PassTurn** at root92 |

Thus four of four corrected prompts have a witnessed matching source attack and a subsequent original-opponent root; all four opposing turns ultimately **passed without an attack**. Two opponent turns did one ordinary resource action first. The four Celestial Roar attacks took zero Prize cards, as expected from a resource-attachment rather than damage attack. These are four episodes contained within **three already-selected original source games**, with shared opponent and action-capped horizons.

## Strategic interpretation and qualification

The repair has genuine physical-mechanics value: invalid native mandatory selection became actual complete Energy movement during a real printed attack, and the opponent actor was permitted to resume. Opponent continuation is **extremely weak** in these episodes, despite the rank-1 original source inventory; native success of this local resource chain therefore provides no estimate of its strength in a human match.

A real paper-compatible two-player release still needs strong owner-only action selection for both players, full payment/rule validation beyond this one printed attack, subsequent attacking damage and KO/Prize opportunity checks, the official match clock, and the missing original ranks 23/25/28. Every recorded game remains competitively **unqualified**. Exactly zero competitive wins are demonstrated.
