# Agent37: simultaneous final-Prize terminal resolution

**7 November 2026 | Pinned Twinleaf Store | Manual CI run 42372045012: success**

## Finding

The pinned Store's native `choosePrizeCards` routine processes Prize groups in `state.players` order. When the first group exhausts that player's remaining Prizes, it calls `endGame` and returns immediately. The second group's Prize transfer is skipped.

In the controlled two-Active-KO fixture, both players have one Prize remaining. Native behavior therefore awards the first processed player and leaves the other player with one Prize. The result depends on `state.players` order rather than the paper simultaneous terminal outcome.

Pinned source: `vendor/twinleaf/ptcg-server/src/game/store/effect-reducers/check-effect.ts`. The relevant `choosePrizeCards` logic starts around line 212; the early returns occur around lines 219-221 and 228-230.

## Paper rule: Advanced Player's Rulebook §E

The simultaneous terminal table distinguishes promotion availability when both players take their final Prize cards:

- Both players can promote: draw.
- Neither player can promote: draw.
- Exactly one player can promote: that player wins.

The earlier tie-only interpretation was incomplete. The adapter now resolves all three outcomes for the supported simultaneous two-Active-KO case.

## Research-owned terminal resolver v2

Implementation: `simulation/twinleaf/agent37-paper-ko-simultaneous-last-prize-tie-v1.cjs`.

Public entry point: `withInstanceScopedSimultaneousLastPrizeResolutionV2`. The older `withInstanceScopedSimultaneousLastPrizeTieV1` export remains as a compatibility alias.

The adapter arms only when all of these conditions hold:

1. Exactly two players are present.
2. The same checkState batch contains exactly two Active KnockOutEffects, one for each player.
3. No non-Active KO effects occur in the batch.
4. Exactly two Prize groups exist, one per player.
5. Both Prize destinations are their respective players' hands.
6. Each Prize group is sufficient to exhaust that player's remaining Prizes.
7. The game is not in sudden death and the Prize effect is not prevented.

It processes the second Prize group with the research-side `TAKE_SPECIFIC_PRIZES` helper before the native early-return path can finish the game. It then resolves the terminal winner from bench availability:

- Matching promotion availability produces `GameWinner.DRAW`.
- If only one player has a Pokémon available to promote, that player wins, mapped to `PLAYER_1` or `PLAYER_2` using the actual `state.players` order.

The Store's winner log is handled consistently with the resolved state winner. Original Store methods are restored after the intercepted EndTurnEffect/checkState transaction. No upstream Twinleaf files are modified.

### Scope and limitations

This is a one-attack EndTurnEffect/checkState adapter, not a whole-match wrapper. A multi-turn runner must apply it around each attack transaction separately.

Promotion availability is currently inferred from whether the player's Bench contains a Pokémon. Effect-based promotion restrictions are not modeled. The adapter also deliberately excludes non-hand Prize destinations, non-Active KOs, additional KO effects, more than two players, sudden death, and other simultaneous loss conditions such as deck-out. These are explicit unsupported cases, not evidence that the native implementation handles them correctly.

## Native regression coverage

Runner: `simulation/twinleaf/agent37-simultaneous-last-prize-tie-native.cjs`.

The regression now covers:

- Both physical actor seats with both players able to promote: both Prize groups transfer and the outcome is a draw.
- Both physical actor seats with only the owner able to promote: both Prize groups transfer and the owner wins, regardless of whether the owner is `state.players[0]` or `state.players[1]`.
- Pure terminal-table checks for both players able to promote, neither able to promote, first-only promotion, second-only promotion, and reversed player ordering.
- A one-sided last-Prize control: an ordinary single-player Prize win remains a win.
- A non-hand Prize-destination control: the adapter declines to arm and does not perform the second Prize transfer.

The shared fixture helper `simulation/twinleaf/agent37-simultaneous-ko-e21-promotion-native.cjs` accepts an optional `enemyHasBench` parameter; existing callers retain the default of `true`.

## CI evidence

[Manual native workflow 42372045012](https://github.com/FlareZ123/experiment-01/actions/runs/42372045012) completed successfully. It includes the simultaneous last-Prize resolver regression and the public attack-settlement regression suite.

Earlier incremental runs also passed:
- [42370344373](https://github.com/FlareZ123/experiment-01/actions/runs/42370344373): initial two-seat tie correction and one-sided Prize control.
- [42370733404](https://github.com/FlareZ123/experiment-01/actions/runs/42370733404): non-hand Prize-destination negative control.
- [42371084916](https://github.com/FlareZ123/experiment-01/actions/runs/42371084916): promotion-availability guard before the full winner resolver was added.
- [42371075778](https://github.com/FlareZ123/experiment-01/actions/runs/42371075778): shared Aichi Dusclops conditional self-KO regression after the fixture helper change.

Two intermediate workflow failures were test-expectation mistakes, not native regressions: the reversed-seat pure test initially expected PLAYER_2 when the winning player was actually `state.players[0]`; a later test also assumed the native winner was always PLAYER_1. Both assertions were corrected to use the actual player ordering and observed native winner. The successful run above contains those corrections.

**Competitive games qualified: 0.** This is a bounded paper-rules fidelity improvement, not evidence of competitive deck strength or a 99.5% win rate.
