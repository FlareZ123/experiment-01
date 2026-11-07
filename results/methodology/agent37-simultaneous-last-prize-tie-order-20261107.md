# Agent37: simultaneous final-Prize terminal resolution

**7 November 2026 | Pinned Twinleaf Store | Last pre-v3 native CI run 42372968463: success**

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

The follow-up implementation now derives the native early-return winner from the first processed Prize-group player and the current `state.players` order. It records that native enum and player identity, plus the original native terminal log message/name/params. Both native WINNER and DRAW messages are intercepted because the paper table can require either a draw or a winner. The corrected log message/name/params are recorded separately. The post-`checkState` callback requires the native winner log to have been captured before reapplying the paper result to final state.

The native regression now asserts both asymmetric promotion directions on both physical seats. For owner-only promotion, actorSeat 0 retains native PLAYER_1 with no override, while actorSeat 1 records native PLAYER_1 and corrects it to expected PLAYER_2; both emit the owner's correct name. For opponent-only promotion, actorSeat 0 records native PLAYER_1 and corrects it to expected PLAYER_2, while actorSeat 1 retains native PLAYER_1 with no override; both emit the opponent's correct name. Both symmetric states, where both players can promote or neither can promote, assert a DRAW log with no winner name. Code and test commits: `50b86df060b4a34fec53871c636f87d0feff887d`, `30103377cdb416b06611c63c4f71fa6fad55fdfe`, `57842b540eb696ca24f1f012f7965646318216e8`, `ab7ebbfd27674f1ad9cf45c9e538454a303c9cab`, `28456211752281b283fe6ef139c1ab29de557e5a`, `d95668bc42f13c49e894699b897d4cbeed9676c5`, `3d21c90fb6e8893597212b0e47e450d3cc4a1512`, `ecc4affa8b82a55dcf987826930b3b53d905123e`, `a961170d4c1aac7f3308cc703f578b4d73a05f27`, `f3f5ff81187e018a0531c51b4052a77722ca7ef3`, `5f0fb75aacca9a7ae0c6c8e88fa91cc5dd3f8998`, `e2c8288c447f86f5d158f5629635b8ddd3929d24`, and `bccd6f19c9348674c90e85974999b985137e4a6c`.

**Validation status:** the successful pre-v3 CI run above predates this log/audit correction and expanded matrix. Dedicated v3 workflow run 42379603688 completed checkout, Twinleaf compilation, syntax checks, and the full native resolver runner successfully; the runner's own assertions passed and artifact 13577440831 was uploaded. The final workflow assertion step then failed because two aggregate audit flags (neighborStoreIsolationVerified and restorationVerified) were missing from the JSON wrapper. Those flags are now computed from the per-seat v3 audit receipts and asserted in commit ee6a0fa47c4293b5c59fcb212463b8f8d17d2620. The fresh full-workflow rerun 42389470404 succeeded on main head c65b304031e24092afde7c8f3192391072dec933. Its native runner and final aggregate assertions both passed. Earlier run 42379416019 failed before the runner at nested submodule credential traversal; the direct-submodule checkout fix is in place and 42379603688 passed checkout. The unrelated Agent36 one-game run 42378455670 failed later in its v10b owner-information attribution step and did not execute this terminal runner. That failure is not evidence for or against resolver v3. Keep the adapter opt-in and do not claim full native CI validation until the dedicated rerun succeeds.

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

[Manual native workflow 42372968463](https://github.com/FlareZ123/experiment-01/actions/runs/42372968463) completed successfully for the pre-v3 implementation. Its successful steps include the simultaneous last-Prize tie adapter regression and the public attack-settlement regression suite. This run is later than the earlier 42372045012 success and is the last pre-v3 terminal-workflow run; it still does not validate the winner-log correction or expanded v3 matrix. The v2 regression's green result did not detect the native log/audit defect later identified by Agent41, because the old assertions did not compare the original native log receipt to the paper-correct winner.

Earlier incremental runs also passed:
- [42370344373](https://github.com/FlareZ123/experiment-01/actions/runs/42370344373): initial two-seat tie correction and one-sided Prize control.
- [42370733404](https://github.com/FlareZ123/experiment-01/actions/runs/42370733404): non-hand Prize-destination negative control.
- [42371084916](https://github.com/FlareZ123/experiment-01/actions/runs/42371084916): promotion-availability guard before the full winner resolver was added.
- [42371075778](https://github.com/FlareZ123/experiment-01/actions/runs/42371075778): shared Aichi Dusclops conditional self-KO regression after the fixture helper change.

Two intermediate workflow failures were test-expectation mistakes, not native regressions: the reversed-seat pure test initially expected PLAYER_2 when the winning player was actually `state.players[0]`; a later test also assumed the native winner was always PLAYER_1. Both assertions were corrected to use the actual player ordering and observed native winner. The successful run above contains those corrections.

**Competitive games qualified: 0.** This is a bounded paper-rules fidelity improvement, not evidence of competitive deck strength or a 99.5% win rate.


## v3 native runner result from run 42379603688

The uploaded runner artifact 13577440831 contains a complete native result from pinned Twinleaf commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. The native regression process and all of its in-process assertions completed successfully on both physical seats:

- In each both-can-promote case, the native engine chose the first processed player (native PLAYER_1), even though both players exhausted their Prize cards and both could promote. The receipt preserves the original WINNER log message, native player ID/name, and params.
- The v3 hook completed both Prize transfers to hand, suppressed the premature terminal callback, and emitted the paper-rule DRAW outcome with a DRAW log and no winner name for both seats.
- Both asymmetric promotion-availability seats, both opponent-only promotion seats, and both neither-can-promote seats passed their corrected outcome assertions.
- The single-player last-Prize control remained a win. The non-Hand Prize-destination control did not trigger the simultaneous-last-Prize correction.
- Store log/reducer restoration and other-store isolation were true in both primary tie rows.
- The artifact reports competitiveGamesQualified=0.

This is strong native regression evidence for the terminal resolver behavior, not evidence of competitive deck strength or a paper-rule certification. The workflow itself remained red only because its final wrapper assertion expected top-level aggregate fields that were absent from the artifact. Commit ee6a0fa47c4293b5c59fcb212463b8f8d17d2620 now derives and asserts those fields from the per-seat audit receipts. That follow-up is now green: run 42389470404 passed every workflow step, including the aggregate wrapper assertions.


## Final v3 native workflow validation

**Manual workflow run 42389470404 succeeded** on 7 November 2026 at 16:06 UTC, using research head `c65b304031e24092afde7c8f3192391072dec933` and pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Checkout, direct submodule initialization, pinned-revision verification, Twinleaf compilation, syntax checks, the bounded native resolver runner, and the final JSON assertions all passed. The aggregate `neighborStoreIsolationVerified` and `restorationVerified` flags were computed from both per-seat v3 audit receipts and passed the workflow assertions.

The retained artifact is [`agent37-simultaneous-last-prize-v3-native-42389470404`](https://github.com/FlareZ123/experiment-01/actions/runs/42389470404/artifacts/13580668331), ID `13580668331`, 2,003 bytes, SHA-256 `3d8a7291cf36fbd7a3aa878c7ab59382b55ccf75bf014475728f60cff29e386d`. It expires 21 November 2026. This closes the previously missing full-workflow assertion gate. The scope remains the bounded native terminal fixture: it does not certify a complete paper match, official 25-minute clock, deck legality, or competitive strength. `competitiveGamesQualified` remains zero.


## Extended 3-to-1 Prize-group native regression

**Manual native workflow run [42400712562](https://github.com/FlareZ123/experiment-01/actions/runs/42400712562) succeeded** on 7 November 2026 at 18:21 UTC, research head `2a69356c82c02e777eefd6d26a726a7701d05e63`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The workflow compiled the pinned Store, checked adapter/runner syntax, ran the original v3 matrix plus the new fixture, and passed the final JSON assertions.

The new fixture stages Ferroseed NXD against Shadow Rider Calyrex V / VMAX CRE, with 260 damage already on the 320-HP VMAX. Ferroseed's Self Destruct then Knocks Out both Actives in one check-state batch. The native engine's VMAX KnockOutEffect supplies a three-Prize group; the single-Prize Ferroseed supplies a one-Prize group. Initial remaining Prize counts are three for the Ferroseed owner and one for the VMAX owner, so both groups exhaust their respective remaining Prizes simultaneously.

The test covers all four promotion-availability states in both physical player seats (**eight native rows**). Every row asserts:
- exactly two Active KO effects and two Prize groups;
- both Prize transfers complete to hand, with **3 owner Prizes and 1 opponent Prize** taken in that turn;
- both players have zero Prizes remaining and no Prize/promotion/Powerglass prompt remains open;
- the expected §E result (draw when promotion availability matches; the only player able to promote wins otherwise);
- the corrected final winner enum and corresponding WINNER/DRAW log receipt;
- Store method restoration and isolation from a neighboring Store.

Artifact: `agent37-simultaneous-last-prize-v3-native-42400712562`, ID `13585213456`, 2,220 bytes, SHA-256 `49b8650895bfca41b39973f5d7c10d74d76dfdebe8c842e0b1a827d5745fbfd6`, retained through 21 November 2026. The preceding run [42400546464](https://github.com/FlareZ123/experiment-01/actions/runs/42400546464) stopped in the new fixture before any terminal assertion because the card lookup omitted Twinleaf's `CRE` printing suffix; the runner was corrected to use `Shadow Rider Calyrex V CRE` and `Shadow Rider Calyrex VMAX CRE`, then the complete rerun passed.

**Evidence boundary:** this is a staged native Store mechanics regression. The fixture uses Twinleaf's English card definitions and its `Format.EXPANDED` setting; it does not certify Japanese-language printing provenance or Aichi Japanese Extra deck legality. It is not a full paper game, competitive policy test, or deck-strength result. `competitiveGamesQualified` remains zero.

The adapter remains limited to exactly two Active KOs, two Prize groups both sufficient to exhaust the respective remaining Prizes, hand destinations, no non-Active KOs, no additional KO effects, no sudden death, and two players. Mixed §E terminal rows (for example, one player's final Prize together with the other player's inability to promote), simultaneous last-Pokémon outcomes without both Prize groups final, and deck-out remain outside this adapter and require separate tests/resolution work.
