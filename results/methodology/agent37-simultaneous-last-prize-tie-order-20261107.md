# Agent37: simultaneous last-Prize resolution awards a false winner in the pinned Store

**7 November 2026 | Pinned Twinleaf Store | Manual CI run 42362862568 | Native regression reproduced**

## Finding

When both players' Active Pokémon are Knocked Out by the same attack and each player has exactly one Prize card remaining, the pinned Store declares the first element of `state.players` the winner. The other player retains their final Prize card.

This is inconsistent with the supplied Advanced Player's Rulebook, §E, “Win and Loss”. The simultaneous-loss table states that when both players have taken all their Prize cards, the result is a tie (rulebook lines 565-575, especially row 574).

The result is seat-order dependent. In both physical actor-seat fixtures, `state.winner` is `GameWinner.PLAYER_1`, corresponding to `state.players[0]`. The attacking player is not consistently the winner.

## Source-level explanation

Pinned source: `vendor/twinleaf/ptcg-server/src/game/store/effect-reducers/check-effect.ts`.

- `choosePrizeCards` begins at line 212 and iterates the Prize groups in `state.players` order.
- At lines 219-221, if the first group's Prize count is at least the first player's remaining Prize count, the routine calls `autoTakePrizeCards`, calls `endGame` with `PLAYER_1`, and immediately returns an empty prompt list.
- The second Prize group is never processed.
- The second early-return path at lines 228-230 similarly awards `PLAYER_2` when its group is processed first.
- The `GameWinner` enum includes `DRAW`, but this Prize-resolution path never evaluates the simultaneous two-player condition.

The direct headless fixture uses physical seat order in `state.players` and the attacking seat in `state.activePlayer`, consistent with `simulation/twinleaf/headless.cjs`. No shuffle or RNG is involved.

## Native regression

The test is included in [`simulation/twinleaf/agent37-simultaneous-ko-promotion-v2-native.cjs`](../../simulation/twinleaf/agent37-simultaneous-ko-promotion-v2-native.cjs). Its fixture runner now supports a one-Prize terminal mode in [`agent37-simultaneous-ko-e21-promotion-native.cjs`](../../simulation/twinleaf/agent37-simultaneous-ko-e21-promotion-native.cjs).

[Manual CI run 42362862568](https://github.com/FlareZ123/experiment-01/actions/runs/42362862568), job **128374693395**, completed successfully. The regression asserts the observed engine defect as an expected failure of paper-rule fidelity, so the workflow itself passes.

For both actor seats, it verifies:

- The game enters the finished phase.
- `state.players[0]` is recorded as the winner.
- The first player's Prize count reaches zero.
- The second player's Prize count remains one.
- No ChoosePrizePrompt or promotion prompt is created.
- The v2 adapter does not arm and does not change the native result.
- The terminal path suppresses E-21.

The paper-expected outcome is a tie in both seats. The native outcome therefore fails the paper rule.

## Relationship to the v2 promotion adapter

The [v2 adapter report](agent37-simultaneous-ko-promotion-v2-adapter-20261107.md) covers a nonterminal event with two single-Prize groups and more than one Prize remaining for each player. This last-Prize case terminates inside `choosePrizeCards` before any ChoosePrizePrompt is created. The current v2 adapter intentionally leaves it unchanged.

The two issues are distinct:
1. Nonterminal simultaneous Active KOs can produce the wrong promotion order.
2. Simultaneous final-Prize resolution can produce a false winner instead of a tie.

Both arise in the same native `checkState` path, so a future research adapter should model the complete simultaneous outcome before declaring the game finished.

## Recommended follow-up

Build a separately tested research-owned correction that resolves all Prize groups arising from the same simultaneous KO batch before applying the Win/Loss table. It should award the tie when both players take their final Prize cards simultaneously, preserve the actual Prize-card transfers for both players, and avoid emitting promotion prompts after a terminal result.

Test both physical seats, both players reaching zero Prizes, mixed terminal conditions from §E, and cases where only one player reaches a loss condition. Keep this correction separate from v2 until its card movement and winner semantics are validated. Do not edit upstream Twinleaf.

**Competitive games qualified: 0.** This is a paper-rules fidelity finding, not evidence about deck strength or win rate.
