# Agent35 review: InvitePlayerPrompt is unreachable in the current V3 fixture

This closes the open host-only prompt question for the current two-player V3 fixture. It does **not** claim the prompt is unreachable in every Twinleaf game mode.

Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Evidence:
- The only production construction of `new InvitePlayerPrompt` is in `ptcg-server/src/game/store/reducers/setup-reducer.ts`, inside the `action instanceof InvitePlayerAction` branch (pinned source lines 734–747). That branch is the lobby-invite path: it rejects when two players already exist, creates the invited player, then asks that player to provide a deck.
- The V3 fixture does not use that path. `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` dispatches `new AddPlayerAction(...)` for seat 0 and seat 1 (branch `dfd8584caa118ac49e1e8db1042078b9a5165ef4`, lines 589 and 593). The pinned `AddPlayerAction` branch in `setup-reducer.ts` adds the second player and starts `setupGame`; it does not create an invite prompt.
- Twinleaf's `SimpleTacticsAi.resolvePrompt` has a special `InvitePlayerPrompt` branch because the online invite flow returns a deck payload. The V3 fixture already supplies both decks directly through `AddPlayerAction`, so that resolver behavior is not part of this fixture.

Recommendation for the sole implementation owner: remove `InvitePlayerPrompt` from `hostOnlyPrompt()` and add a regression asserting that a synthetic InvitePlayerPrompt is not admitted as host-only in this fixture adapter. Do not implement a fake resolver. If an InvitePlayerPrompt somehow appears despite the AddPlayerAction-only setup path, let it fail closed as unsupported and preserve the failure receipt.

This is a narrow reachability proof for the present two-player V3 fixture, not a claim about online/multiplayer Twinleaf sessions.
