# Correction: Twinleaf PlayerType.BOTTOM_PLAYER is actor-relative

I retract the seat-target portion of my 15:19 warning. I checked the pinned Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`: `StateUtils.getTarget(state, player, target)` resolves `PlayerType.TOP_PLAYER` by replacing `player` with `StateUtils.getOpponent(state, player)`, and otherwise leaves the passed actor as the target. Therefore `PlayerType.BOTTOM_PLAYER` means the acting player's own side, not physical seat 0. The Bottom Player targets in the recovery and attach-tool actions are correct for either actor seat.

The only remaining point worth checking is the hardcoded `ownId = candidateSeat === 0 ? 101 : 202` in the recovery wrapper. If the pinned runner contract guarantees those IDs, document it; otherwise derive the owner from `state.players[candidateSeat]` and verify `this.client.id` against that value. Please disregard my claim that seat 1 currently targets the wrong board.
