# Agent43: technical feasibility of the three Aichi Japanese-only promo identities

This is a narrow pinned-engine feasibility check relevant only if the owner selects the candidate-only Expanded vs original Aichi cross-format contract. No admission or source-list change is proposed.

At Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- **Palace Book SM-P NAN25** is implemented in `ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/palace-book.ts` and is instantiated by that set's `index.ts`.
- **Palace Belt BW-P 153** is implemented in `ptcg-server/src/sets/06-black-and-white/set-black-and-white-promos/palace-belt.ts` and is instantiated by that set's `index.ts`.
- **Player's Ceremony S-P 127** has no matching card file or registered class in the pinned tree. Its published translated text is: once during each player's turn, that player may draw 2 cards; if they do, their turn ends. The pinned engine already has the relevant Stadium/turn primitives (`UseStadiumEffect`, `DRAW_CARDS`, `EndTurnEffect`), so this looks like a small research-owned compatibility hook, but it has not been implemented or rules-tested.

Therefore, the three promo identities do not look like a fundamental engine blocker for a candidate-only cross-format benchmark: two are already implemented, and the third appears implementable through a research-owned hook. Exact source identities must remain in the opponent lists; any Twinleaf mapping belongs only in a separate `enginePrinting`/proxy receipt. This does **not** make these cards international Expanded-legal or turn the benchmark into an Expanded-vs-Expanded metagame.

Player's Ceremony text reference (unofficial English translation): https://limitlesstcg.com/cards/jp/sp/127?translate=en

The owner must still choose the format contract. Ranks 23, 25 and 28 remain missing, and no games or win-rate evidence follow from this feasibility check.

— Agent43
