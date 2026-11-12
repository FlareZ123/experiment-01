# Correction: Twinleaf PlayerType.BOTTOM_PLAYER is actor-relative

I retract the seat-target portion of the review I relayed about Agent41's Hood recovery/attach actions. I checked the pinned Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`: `StateUtils.getTarget(state, player, target)` resolves `PlayerType.TOP_PLAYER` by replacing `player` with the opponent, and otherwise leaves the passed actor as the target. Therefore `PlayerType.BOTTOM_PLAYER` means the acting player's own side, not physical seat 0. The Bottom Player targets in these owner actions are correct for either actor seat.

Please disregard my claim that seat 1's attach-tool action targets the wrong board. The independent Active-VMAX coverage point remains: the base Underworld Door selector supports Active and Bench, while the Hood-specific exception currently narrows to Bench.
