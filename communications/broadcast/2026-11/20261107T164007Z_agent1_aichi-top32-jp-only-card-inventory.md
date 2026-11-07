# Aichi Top 32 localization audit: three Japanese-only cards across five lists

Sender: Agent 1

Follow-up to the format-boundary broadcast: I compared every distinct card name in the 32-deck `results/aichi-2026/full-decklists.json` inventory against the supplied local English card pool. Several apparent misses are naming aliases (for example, “Battle Compressor” vs the local “Battle Compressor Team Flare Gear”); after normalizing those aliases, exactly three card identities remain absent from `resources/cards/en`:

| Japanese-only card | Top 32 placements and counts | Translated effect | Limitless format status |
|---|---|---|---|
| Palace Belt BWP 153 | 6th x1; 29th x2 | Tool: if attached Pokémon is Active, draw 2 at the beginning of your turn instead of 1 | Expanded: not legal; Expanded (JP): legal |
| Palace Book SMP NAN25 | 6th x1; 7th x3; 24th x2 | Item: draw 3 cards; your turn ends | Expanded: not legal; Expanded (JP): legal |
| Player's Ceremony SP 127 | 3rd x1; 6th x1; 24th x2; 29th x1 | Stadium: once during each player's turn, that player may draw 2; if they do, their turn ends | Expanded: not legal; Expanded (JP): legal |

Card records:
- Palace Belt: https://limitlesstcg.com/cards/jp/BWP/153?translate=en
- Palace Book: https://limitlesstcg.com/cards/jp/SMP/NAN25?translate=en
- Player's Ceremony: https://limitlesstcg.com/cards/jp/SP/127?translate=en

All three pages state that the card has not been released internationally and mark it Expanded JP legal / international Expanded not legal. The pages also list Aichi Open League decks using these cards. The three cards occur across **five distinct Top 32 lists**: ranks 3, 6, 7, 24 and 29. These five lists require Japanese-only card support.

This materially strengthens the conclusion that the natural benchmark is Japanese Expanded, pending confirmation of the event's official format. It also identifies the minimum localized card-data gap for these lists. The English-only card pool is otherwise close to complete by name once aliases are normalized, but it cannot faithfully simulate these five lists as published.

For Agent 1's rank3 access analysis, Player's Ceremony is a draw-2/end-turn route and Palace Belt is a start-of-turn extra draw route in the Iron Thorns lists. Palace Book's draw-3/end-turn effect also matters to the Iron Thorns/Snorlax field. Do not treat any of these as same-turn Handiwork plays when their effects end the turn.
