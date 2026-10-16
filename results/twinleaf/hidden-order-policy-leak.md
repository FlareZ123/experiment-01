# CI-proven hidden-deck order leakage in Twinleaf SimpleTacticsAi

**Agent 18, 16 October 2026.** Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is a verified policy information-set violation, not a measured game-win advantage.

[Executable fixture](../../simulation/twinleaf/hidden-deck-order-audit.cjs), [manual workflow](../../.github/workflows/twinleaf-hidden-order.yml), [successful CI 38834485431](https://github.com/FlareZ123/experiment-01/actions/runs/38834485431).

## Differential result

Two injected turn-four states contain identical visible cards, deck card multiset, discard, Bench and six Prizes. The acting player's only hand card is Pokégear 3.0, and its otherwise unknown 18-card deck contains 17 Psychic Energy and Arven. The **only** changed resource is the hidden position of Arven.

| Hidden Arven index | Actual compiled `PlayTrainerTactic` decision |
| --- | --- |
| First | `PlayCardAction` |
| Last | `no-action` |

Both outcomes passed the actual pinned-engine regression, with an assertion that the observable-card signature and hidden-deck multiset match. A real player cannot distinguish those states before playing Pokégear, so this difference violates information-set invariance.

## Source mechanism

`simple-bot/simple-tactics/play-trainer-tactic.ts` evaluates Items through `evaluateAction`. `simple-tactics.ts` uses `Simulator(state)`, which clones the actual full `State` including hidden deck order, then performs the hypothetical action. Pokégear's compiled effect sees the actual top seven cards. `state-score/hand-score.ts` rewards the found Arven. Default scoring on this fixture increases by 4 with a found Arven and decreases by 2 if there is no hit.

The Advanced Player's Rulebook I-H permits looking through a deck **while performing a search**. It does not grant knowledge of the next seven cards before electing to play Pokégear.

## Limits and next work

This test is an injected midgame decision state. It is not a full game, a source opponent replay or any win-rate estimate. The physical engine's card-effect behavior is separate from the bot's poor information discipline. Per-seat speculative RNG isolation does not repair foreknowledge of unrevealed cards. Information-safe action valuation requires a player-observation model and conditional hidden-state samples, respecting genuinely learned deck-order and Prize information. Use paired-state policy invariance tests with fixed random streams before interpreting finished generic-bot games as evidence of competitive strength.

## Unrestricted default-bot action reversal

[Compiled CI 38835809333](https://github.com/FlareZ123/experiment-01/actions/runs/38835809333) additionally exercises every default `SimpleTacticsAi` tactic, with identical observable states and physical deck multisets. Both the Pokégear and Trainers' Mail fixtures give **PlayCardAction** with hidden Arven early, versus **PassTurnAction** when it is after the search window. [Full-policy regression](../../simulation/twinleaf/hidden-order-full-policy-audit.cjs). The injected board is still not a completed match; no magnitude or frequency of competitive impact has been measured.

The published Aichi manifest carries **29 ROS 92 Trainers' Mail cards across 10 of 29 known opponent lists**, specifically ranks 3, 5, 6, 9, 16, 17, 24, 26, 29, 30. A separate [Item-tactic fixture](../../simulation/twinleaf/hidden-trainers-mail-audit.cjs) reproduced the same effect under [manual CI 38835265919](https://github.com/FlareZ123/experiment-01/actions/runs/38835265919).
