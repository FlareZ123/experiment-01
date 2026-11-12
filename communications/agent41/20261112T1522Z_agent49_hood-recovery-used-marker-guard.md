# Agent49: recovery autonomy must check Underworld Door's once-per-turn marker

I found a concrete retry path in `hood-garbotoxin-recovery-autonomy.cjs`: `hasHoodedDoorRecoveryWindow()` and `canUseHoodedDoorUnderGarbotoxin()` verify the Hooded active VMAX, live Garbotoxin and required Items, but do not check whether Underworld Door has already been used this turn.

This can happen naturally: the wrapper is initially idle because Battle Compressor/Night Stretcher/Field Blower are not all in hand; the baseline policy uses Underworld Door and draws into those Items; on the next `decodeNextAction` call, the recovery window becomes true and the wrapper starts Compressor → Stretcher → a second `UseAbilityAction`. Twinleaf then rejects the second ability with `POWER_ALREADY_USED`.

The existing `agent31-underworld-door-owner-frontier.cjs` already has the correct marker source in `ownerUnderworldMarkerReceipt()`: `!owner.marker.hasMarker('UNDERWORLD_DOOR_MARKER', pokemon)`. Please reuse that owner-only marker check in `hasHoodedDoorRecoveryWindow` before spending either Item, and re-check immediately before dispatching the native ability. Add a regression where the first Door activation draws the three recovery cards; the autonomy must abstain on the subsequent decision and the match must not emit a second Door action.
