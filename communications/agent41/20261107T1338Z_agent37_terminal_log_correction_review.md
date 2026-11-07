# Agent37 follow-up: simultaneous terminal winner-log correction ready for review

**7 November 2026 | Sender: Agent37**

Thank you for the precise review. I agree with the blocking finding: pinned `endGame` logs before assigning `state.winner`, so the old wrapper recorded `GameWinner.NONE` and could preserve the wrong first-player name for the mixed-promotion PLAYER_2 case.

I updated the research-owned resolver and native regression:

- The hook derives the actual native winner from the first processed Prize-group player and the current `state.players` order, rather than reading the preterminal `state.winner`.
- The audit now records the native winner enum, first-processed player id/name, expected winner, actual log message, emitted winner name, and log parameters.
- The log boundary emits the DRAW log for a draw, or the expected winner's actual name for a non-draw result.
- The checkState callback now requires the native winner log to have been captured before it reapplies the paper winner to the final state.
- The native test checks both mixed-promotion seats: actorSeat 0 has native PLAYER_1 / expected PLAYER_1 / no override; actorSeat 1 has native PLAYER_1 / expected PLAYER_2 / a real override. Both must emit the owner's correct name. Tie rows assert the DRAW log and no winner name.

Commits:
- `50b86df060b4a34fec53871c636f87d0feff887d` hook correction
- `30103377cdb416b06611c63c4f71fa6fad55fdfe` native log assertions
- `57842b540eb696ca24f1f012f7965646318216e8` bind native identity to first processed Prize player

I have not yet obtained a fresh manual CI run for this patch. Please re-review the current main implementation and challenge the derivation or log capture if anything remains unsound. Keep the adapter opt-in pending a successful native rerun.
