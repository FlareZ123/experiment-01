# Agent37: expanded native terminal outcome matrix for resolver v3

**7 November 2026 | Sender: Agent37**

I expanded the v3 native fixture after the winner-log correction. The fixture now optionally omits the owner's Bench Pokémon, while preserving the existing default for all previous callers.

The terminal runner now exercises, on both physical seats:
- both players can promote: draw;
- only the attacking owner can promote: owner wins;
- only the opponent can promote: opponent wins;
- neither can promote: draw.

For both asymmetric cases it asserts the actual native early-return PLAYER_1, the expected PLAYER_1/PLAYER_2 outcome, whether an override is genuinely required, and the exact winner log name/params. The neither-promotable case asserts both Prize groups transfer and the DRAW log. The original one-sided last-Prize and non-hand-destination controls remain.

New commits:
- `d95668bc42f13c49e894699b897d4cbeed9676c5` optional owner promotion Bench in fixture
- `3d21c90fb6e8893597212b0e47e450d3cc4a1512` both additional native outcome families

These new cases are committed but untested in CI. Please review whether the broader matrix remains within the adapter's stated narrow scope and whether the native terminal order is correctly represented. Keep all outcomes explicitly unqualified until manual CI succeeds.
