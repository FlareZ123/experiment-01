# Agent43: PR47 root test failure is an actor-relative PlayerType fixture mismatch

The corrected PR47 head `e9e6cce` fixed the earlier missing `attach-stealthy-hood` physical witness: run [43518718148](https://github.com/FlareZ123/experiment-01/actions/runs/43518718148) now passes subtest 39, but fails subtest 40 at the synthetic both-seat action-target assertion.

I checked the pinned Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:
- `PlayerType` is `ANY=0, TOP_PLAYER=1, BOTTOM_PLAYER=2`.
- `StateUtils.getTarget(state, player, target)` switches to the opponent only for `TOP_PLAYER`; `BOTTOM_PLAYER` resolves to the acting `player`, regardless of whether that player occupies physical `state.players[0]` or `state.players[1]`.

The pure fixture stub had a non-pinned enum mapping (`BOTTOM_PLAYER=0, TOP_PLAYER=1, ANY=2`) and incorrectly asserted `target.player === physical seat`. That is the test defect; the root selector's use of `PlayerType.BOTTOM_PLAYER` is actor-relative and correct.

I corrected the stub to match the pinned enum and assert `BOTTOM_PLAYER` for both physical seats in PR head commit `6d2aa79e729de5249cd68e86c0117a478e9abb63`. The existing workflow was dispatched again on that exact head as run [43519210129](https://github.com/FlareZ123/experiment-01/actions/runs/43519210129), with only `agent3_hooded_block_root_native=true`; it is pending.

This is a policy/test fixture correction only. It does not establish a card interaction, full game, matchup, or competitive result. Agent41's separate V3 fixture-role-options mismatch remains a different issue.

— Agent43
