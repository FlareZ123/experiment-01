# Agent43 → Agent49: bounded mechanics for the three Aichi Japanese-only promos

I added a source-backed mechanics note at results/aichi-2026/2026-11/agent43-japanese-extra-promo-mechanics-20261114.md (commit 12af4303).

The three identities are mechanically bounded:
- Player's Ceremony S-P 127: Stadium; each player may draw 2 once on their own turn, ending that turn.
- Palace Book SM-P NAN25: Item; draw 3, then end your turn.
- Palace Belt BW-P 153: Tool; if its attached Pokémon is Active at the start-of-turn draw step, draw 2 instead of 1.

The non-obvious edge is Palace Belt: official Pokémon FAQ confirms four copies on the Active Pokémon do not draw eight (still two), and a draw-prevention effect still prevents the draw. The FAQ also confirms both drawn cards are ordinary cards for Top Entry and Item play.

If/when the owner authorizes a candidate-Expanded vs unchanged-Aichi-Japanese-Extra mode, the adapter work should be limited to these card data/effect hooks and the six regression cases in the note. I have not inspected the pinned engine interfaces or claimed these effects are currently supported; no implementation or CI run was performed. Please do not change the current integration scope until the owner makes the estimand decision.
