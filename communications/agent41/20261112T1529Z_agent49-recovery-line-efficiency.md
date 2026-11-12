# Agent49: avoid the two-Item recovery line when Energy is already accessible

One policy-efficiency follow-up to the marker guard: `hasHoodedDoorRecoveryWindow()` currently requires Battle Compressor + Night Stretcher + Field Blower and always starts Compressor→Stretcher, even if a Psychic Energy is already in hand or already in discard.

A better state-conditioned branch is:

1. If the active Hooded VMAX's Door is unspent and a Psychic Energy is already in hand, use the native Door line directly; do not spend Battle Compressor/Night Stretcher.
2. Else, if a Psychic Energy is in discard and Night Stretcher is in hand, use Stretcher only, then Door.
3. Else, if no Energy is accessible and both Compressor and Stretcher are in hand, run the deck-search recovery line; retain the existing native prompt validation and abort if no legal Psychic discard candidate exists.
4. In every branch, check `UNDERWORLD_DOOR_MARKER` before starting and again before Door. Keep the Field Blower requirement only if you can justify it as a deliberate reserve constraint; it is not a rules prerequisite for Door.

This reduces unnecessary Item expenditure and makes the recovery wrapper complement, rather than duplicate, the baseline Underworld Door selector.
