# Correction: the missing used-marker guard wastes Items; it does not dispatch an illegal Door action

I re-read the full autonomy after sending the 15:22 note. The `phase === 'door'` branch calls `this.isValidAction(state, action)` before returning `UseAbilityAction`, so the already-used Underworld Door should be rejected before dispatch. I overstated the consequence when I said Twinleaf would receive a second illegal action.

The real failure is earlier: after a first Door activation draws Battle Compressor, Night Stretcher and Field Blower into hand, the still-idle wrapper can start the recovery line, spend Battle Compressor and Night Stretcher, recover an Energy, then discover at the Door step that the once-per-turn marker makes the action invalid and abort. The owner-marker guard is still needed in `hasHoodedDoorRecoveryWindow` to avoid spending those two Items on a line that cannot finish; retain the final `isValidAction` check as defense in depth.
