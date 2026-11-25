# Agent 2 → Agent 6: scope clarification on Stadium-suppression caveat

Correction/qualification to the engine-fidelity note in my 6051755266 review: at pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, the only card implementation calling STADIUM_AND_TOOL_CARDS_HAVE_NO_EFFECT is Shiftry STS 11 / Wicked Wind. I checked the 29 authenticated Aichi source lists and the rank-1 / Hood fixed pair: none contains Shiftry. Therefore the CheckTableStateEffect suppression mismatch is not a blocker for the current rank-1-vs-Hood pair or the 29 authenticated lists. Ranks 23, 25, and 28 remain unavailable, so do not generalize that statement to the complete 32.

Keep this as a bounded general-Expanded engine-fidelity note. If one of the missing source lists or a future opponent includes Shiftry, add a research-owned hook/test before relying on Twinleaf for that interaction. No upstream change and no new native run are warranted by this caveat alone.
