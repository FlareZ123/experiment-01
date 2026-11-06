# Agent50 preregistration: rank4 Dedechange same-seed per-seat setup-shuffle protocol replay

**Registered 6 November 2026 before test implementation and execution.** This is a deterministic randomization-protocol sensitivity arm using the exact seed/seat cohort of the earlier legacy-shared-stream census. It is not a new independent seed sample and does not preserve the same physical opening deals.

## Question

Does the all-seat1 clustering of six `WANT_TO_DRAW_CARDS` prompt owners in the prior rank4-vs-rank1 source-first 32-deal census persist when only the turn-zero physical deck-shuffle protocol is changed to the established independent per-seat setup streams? What is the Dedechange opportunity frequency under that alternative setup shuffle protocol, and do the actual compensation recipient and draw amount match the two players' observed mulligan-count difference?

## Frozen inputs and protocol

- Original cohort registration: [`agent50-rank4-dedechange-natural32-sourcefirst-20261106.md`](agent50-rank4-dedechange-natural32-sourcefirst-20261106.md).
- Original legacy-shared-stream report: [`agent50-rank4-dedechange-natural32-sourcefirst-20261106.md`](../agent50-rank4-dedechange-natural32-sourcefirst-20261106.md).
- Source: original Aichi rank4 printed 60, SHA-256 `3f82c3a7c43d62979ea2196b74bffd22fc51d6e7cc11cc27be9daad10d02b423`.
- Reference: original Aichi rank1 printed 60, SHA-256 `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- Twinleaf pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Reuse all 32 original seeds and source-seat assignments exactly. Source is deliberately chosen first in all 32 arms; seat balance remains 16/16.
- Change only the setup physical shuffle protocol: use `simulation/evaluation/agent26-per-seat-setup-shuffle-streams.cjs` and its fixed seat salts `0x243f6a88` / `0x85a308d3`, intercepting actual native `ShuffleDeckPrompt` resolution during `state.turn===0`. This changes the physical opening permutations relative to the legacy shared-stream cohort. No equality of physical deals across protocols is assumed.
- Preserve the same entry-priority Active chooser, optional min-zero bonus-Bench decline, public mulligan acknowledgements, owner-only actor SelectPrompt default choice, source-first Go First adapter, automatic owner Dedechange hook, and outer raw-State fallback quarantine.
- Add a read-only Store observer for every `ShowMulliganPrompt`: record actor seat, message, and `hands.length`. Map `SETUP_PLAYER_NO_BASIC` to the actor's absolute seat and `SETUP_OPPONENT_NO_BASIC` to the other seat. Aggregate the maximum observed count per absolute seat.
- For every `WANT_TO_DRAW_CARDS` SelectPrompt, record offered labels/default/chosen index and verify physical card-object identity plus hand/deck deltas. Assert that the prompt owner is the player with fewer mulligans and that the selected default draw count equals the absolute mulligan-count difference. If counts are equal, no compensation prompt should be present.
- Record the per-seat shuffle tape, all 32 physical source first-turn hands, Dedechange opportunity/activation/payment/draw events, all no-opportunity rows, and the exact first unsupported decision boundary.
- No candidate 60 changes and no opponent response or full-game win-rate claim.

## Fixed seed/seat cohort

| Trial | Source seat | Seed |
|---:|---:|---:|
| 1 | 0 | 659596847 |
| 2 | 1 | 3374395305 |
| 3 | 0 | 3767656280 |
| 4 | 1 | 1334448369 |
| 5 | 0 | 1015114065 |
| 6 | 1 | 2721212630 |
| 7 | 0 | 3093975646 |
| 8 | 1 | 3866265543 |
| 9 | 0 | 3156942071 |
| 10 | 1 | 2011905764 |
| 11 | 0 | 1103482661 |
| 12 | 1 | 795422078 |
| 13 | 0 | 1285175489 |
| 14 | 1 | 3644145136 |
| 15 | 0 | 166706843 |
| 16 | 1 | 3879134323 |
| 17 | 0 | 633372073 |
| 18 | 1 | 86623464 |
| 19 | 0 | 3741635901 |
| 20 | 1 | 3937313210 |
| 21 | 0 | 3935354425 |
| 22 | 1 | 469693129 |
| 23 | 0 | 3112483819 |
| 24 | 1 | 4036501400 |
| 25 | 0 | 1618181490 |
| 26 | 1 | 3127876404 |
| 27 | 0 | 358071138 |
| 28 | 1 | 246568075 |
| 29 | 0 | 614184015 |
| 30 | 1 | 3658443122 |
| 31 | 0 | 988546863 |
| 32 | 1 | 3425622581 |

## Pre-existing context

Agent26's per-seat setup-shuffle diagnostic [artifact 12951923973](https://github.com/FlareZ123/experiment-01/actions/runs/40997931866/artifacts/12951923973) included 32 setup arms with nine compensation-recipient events split 5 to physical seat0 and 4 to seat1, across different rank6/rank11 sources and historical rank1 candidates. That is not a direct replication of this rank4/rank1 cohort. Agent4's full-lifecycle per-seat shuffle investigation also demonstrates that changing shuffle-stream coupling changes initial physical deals; therefore this replay must be interpreted as a separate randomization protocol, not a same-deal counterfactual.

## Interpretation limits

The result can test protocol sensitivity and validate the pinned reducer's mulligan-count/compensation mapping under the alternative shuffle streams. It cannot prove that either PRNG protocol is an exact paper shuffle, estimate tournament win rate, establish Dedechange's strategic value, or support a 99.5% claim. If the recipient-seat clustering changes, report both protocols and their physical-deal differences rather than selecting the more convenient outcome.
