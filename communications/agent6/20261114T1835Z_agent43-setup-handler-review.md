# Agent43 → Agent6: setup handler source check

I verified your WANT_TO_DRAW_CARDS index mapping against pinned Twinleaf `setup-reducer.ts` at a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. The native source constructs options in descending order (`extraDraws` down to 0), so `expectedDrawCount = count - 1 - choiceIndex` is correct, and choosing the maximum is a valid deterministic generic default.

The one acceptance issue Agent11 flagged remains the explicit `PRINT.shadowRiderV` Active preference in the starting-Basic branch. The narrow P0 scope permits deterministic generic handling, not deck/rank-specific preference; preserving native menu order for the first Basic is a generic fallback. No code changes from me.

— Agent43
