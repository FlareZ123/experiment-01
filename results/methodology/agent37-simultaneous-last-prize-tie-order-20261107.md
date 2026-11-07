# Agent37: simultaneous final-Prize terminal resolution

**7 November 2026 | Pinned Twinleaf Store | Last pre-review native CI run 42372045012: success**

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

## Research-owned terminal resolver v3

Implementation: `simulation/twinleaf/agent37-paper-ko-simultaneous-last-prize-tie-v1.cjs`.

Public entry point: `withInstanceScopedSimultaneousLastPrizeResolutionV3`. The `withInstanceScopedSimultaneousLastPrizeResolutionV2` and older `withInstanceScopedSimultaneousLastPrizeTieV1` exports remain compatibility aliases to the corrected v3 implementation.

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

The Store's winner log is handled at the same interception boundary as the resolved state winner. Original Store methods are restored after the intercepted EndTurnEffect/checkState transaction. No upstream Twinleaf files are modified.

## Independent review follow-up: native winner-log ordering

Agent41's 13:17 UTC review found that pinned `endGame` emits `LOG_GAME_FINISHED_WINNER` **before** assigning `state.winner`. The previous implementation's audit therefore captured the preterminal `GameWinner.NONE` sentinel. In the mixed-promotion case where only the owner in `state.players[1]` can promote, the final state could be corrected to PLAYER_2 while the already-emitted native log still named the first player (PLAYER_1). The previous audit's `winnerOverridden` value was consequently unreliable.

The follow-up implementation now derives the native early-return winner from the first processed Prize-group player and the current `state.players` order. It records that native enum and player identity, plus the original native log message/name/params, before rewriting the log to either the paper-correct DRAW message or the paper-correct winner's name. The corrected log message/name/params are recorded separately. The post-`checkState` callback requires the native winner log to have been captured before reapplying the paper result to final state.

The native regression now asserts both asymmetric promotion directions on both physical seats. For owner-only promotion, actorSeat 0 retains native PLAYER_1 with no override, while actorSeat 1 records native PLAYER_1 and corrects it to expected PLAYER_2; both emit the owner's correct name. For opponent-only promotion, actorSeat 0 records native PLAYER_1 and corrects it to expected PLAYER_2, while actorSeat 1 retains native PLAYER_1 with no override; both emit the opponent's correct name. Both symmetric states, where both players can promote or neither can promote, assert a DRAW log with no winner name. Code and test commits: `50b86df060b4a34fec53871c636f87d0feff887d`, `30103377cdb416b06611c63c4f71fa6fad55fdfe`, `57842b540eb696ca24f1f012f7965646318216e8`, `ab7ebbfd27674f1ad9cf45c9e538454a303c9cab`, `28456211752281b283fe6ef139c1ab29de557e5a`, `d95668bc42f13c49e894699b897d4cbeed9676c5`, `3d21c90fb6e8893597212b0e47e450d3cc4a1512`, `ecc4affa8b82a55dcf987826930b3b53d905123e`, and `a961170d4c1aac7f3308cc703f578b4d73a05f27`.

**Validation status:** the successful CI run above predates this log/audit correction. A fresh manual native rerun is pending; the updated implementation and assertions are committed but not yet revalidated by CI. Keep the adapter opt-in and do not claim the corrected winner-log behavior as passed until that rerun succeeds.

### Scope and limitations

This is a one-attack EndTurnEffect/checkState adapter, not a whole-match wrapper. A multi-turn runner must apply it around each attack transaction separately.

Promotion availability is currently inferred from whether the player's Bench contains a Pokémon. Effect-based promotion restrictions are not modeled. The adapter also deliberately excludes non-hand Prize destinations, non-Active KOs, additional KO effects, more than two players, sudden death, and other simultaneous loss conditions such as deck-out. These are explicit unsupported cases, not evidence that the native implementation handles them correctly.

## Native regression coverage

Runner: `simulation/twinleaf/agent37-simultaneous-last-prize-tie-native.cjs`.

The regression now covers, on both physical actor seats:

- Both players able to promote: both Prize groups transfer and the outcome is a draw.
- Only the owner able to promote: both Prize groups transfer and the owner wins.
- Only the opponent able to promote: both Prize groups transfer and the opponent wins.
- Neither player able to promote: both Prize groups transfer and the outcome is a draw.
- Pure terminal-table checks for both players able to promote, neither able to promote, first-only promotion, second-only promotion, and reversed player ordering.
- A one-sided last-Prize control: an ordinary single-player Prize win remains a win.
- A non-hand Prize-destination control: the adapter declines to arm and does not perform the second Prize transfer.

The shared fixture helper `simulation/twinleaf/agent37-simultaneous-ko-e21-promotion-native.cjs` accepts optional `enemyHasBench` and `ownerHasBench` parameters; existing callers retain the default of `true`.

The four native promotion-availability families were added after the winner-log correction. They are committed in v3, but the expanded suite has not yet been rerun in CI.

## CI evidence

[Manual native workflow 42372045012](https://github.com/FlareZ123/experiment-01/actions/runs/42372045012) completed successfully for the pre-v3 implementation. It includes the earlier simultaneous last-Prize resolver regression and the public attack-settlement regression suite, but does not validate the winner-log correction or expanded native outcome matrix.

Earlier incremental runs also passed:
- [42370344373](https://github.com/FlareZ123/experiment-01/actions/runs/42370344373): initial two-seat tie correction and one-sided Prize control.
- [42370733404](https://github.com/FlareZ123/experiment-01/actions/runs/42370733404): non-hand Prize-destination negative control.
- [42371084916](https://github.com/FlareZ123/experiment-01/actions/runs/42371084916): promotion-availability guard before the full winner resolver was added.
- [42371075778](https://github.com/FlareZ123/experiment-01/actions/runs/42371075778): shared Aichi Dusclops conditional self-KO regression after the fixture helper change.

Two intermediate workflow failures were test-expectation mistakes, not native regressions: the reversed-seat pure test initially expected PLAYER_2 when the winning player was actually `state.players[0]`; a later test also assumed the native winner was always PLAYER_1. Both assertions were corrected to use the actual player ordering and observed native winner. The successful run above contains those corrections.

**Competitive games qualified: 0.** This is a bounded paper-rules fidelity improvement, not evidence of competitive deck strength or a 99.5% win rate.
