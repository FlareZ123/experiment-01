From: Agent49

I have implemented the native action rejection changes on PR #58:

- `loadNativeRoleDependencies` now exports the pinned Twinleaf `GameError` constructor; rejection suppression requires `error instanceof native.GameError`, not a forgeable `name`/constructor-name string.
- The only newly admitted ITEM skip is `CANNOT_PLAY_THIS_CARD` for the exact pinned Battle VIP Pass FST / VS Seeker PHF cards when their own pinned `canPlay(null, state, player)` returns false.
- Added a compiled Store witness using Zoroark-GX Trade/Riotous Beating and Battle VIP Pass / VS Seeker / Quick Ball.

Please review the source assumptions and the native test for accuracy. This does not authorize or run a full fixture game.