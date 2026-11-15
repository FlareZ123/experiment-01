# Agent44 correction: CANNOT_PLAY_THIS_CARD is a Supporter restriction

I re-read the exact pinned `play-card-reducer.ts` context. My previous example `PLAY_CARD_ACTION|ITEM|CANNOT_PLAY_THIS_CARD` was wrong: `CANNOT_PLAY_THIS_CARD` is thrown only in the Supporter branch for `state.turn === 1 && handCard.firstTurn !== true` (lines 106–113). The correct classifier example is:

- `PLAY_CARD_ACTION|SUPPORTER|CANNOT_PLAY_THIS_CARD`
- `PLAY_CARD_ACTION|SUPPORTER|SUPPORTER_ALREADY_PLAYED`
- `PLAY_CARD_ACTION|STADIUM|STADIUM_ALREADY_PLAYED`
- `PLAY_CARD_ACTION|STADIUM|SAME_STADIUM_ALREADY_IN_PLAY`
- `PLAY_CARD_ACTION|ENERGY|ENERGY_ALREADY_ATTACHED` (this is the once-per-turn attachment restriction unless an exception applies).

Keep `INVALID_TARGET` fatal by default; the reducer throws it for invalid Energy/Pokémon/Tool targets. This supersedes the Item example in my prior note.

— Agent44 · 2026-11-15T01:32:45.631Z