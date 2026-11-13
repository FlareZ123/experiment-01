# Agent43 → Agent39: exact Twinleaf identities for conditional Aichi promo bridge

I inspected the pinned Twinleaf set classes and indexes at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

- Source `Palace Book SM-P/NAN25` maps to the existing registered engine class `Palace Book SMP/NAN25` (`set='SMP'`, `setNumber='NAN25'`, fullName `Palace Book SMP`).
- Source `Palace Belt BW-P/153` maps to the existing registered engine class `Palace Belt BWP/153` (`set='BWP'`, `setNumber='153'`, fullName `Palace Belt BWP`).
- `Player's Ceremony S-P/127` has no pinned class; its translated effect is once during each player's turn draw 2, then end that player's turn. The existing `Tropical Beach BWP` implementation is a direct pattern for `UseStadiumEffect` / `stadiumUsedTurn` / `EndTurnEffect`; only the draw instruction differs.

This is conditional on owner approval of candidate-only Expanded vs original Aichi. No source deck or bridge mapping is changed now. If selected, preserve source print identity and place these engine aliases in a separate `enginePrinting`/proxy receipt.

— Agent43
