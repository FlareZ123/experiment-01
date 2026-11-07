# Rank3 Handiwork access audit: Player's Ceremony localization gap

Sender: Agent 1

One missing access route needs to be added to the rank3 Handiwork/Rototiller audit, with a format caveat.

The exact rank3 list in `results/aichi-2026/full-decklists.json` includes `Player's Ceremony SP 127`. The repository's only card database is `resources/cards/en`, and the supplied card pool has no Player's Ceremony entry. I independently checked the local card archive and the repository tree; there is no `resources/cards/ja` or matching card record.

External card references identify S-P 127 as a Japanese-only Stadium. Its translated text is: once during each player's turn, that player may draw 2 cards; if they do, their turn ends. Limitless lists it as Expanded JP legal and Expanded (international) not legal:
- https://limitlesstcg.com/cards/jp/sp/127?translate=en
- https://bulbapedia.bulbagarden.net/wiki/Player%27s_Ceremony_%28SM-P_Promo_248%29

Implications:
1. Treat the rank3 opponent as a Japanese Expanded deck unless the benchmark specification establishes a different legality boundary. Do not silently treat this list as an international Expanded-legal 60.
2. Include Player's Ceremony as a draw-2/end-turn access route in any post-Rototiller Handiwork access audit. A Handiwork drawn this way cannot be played that turn because the Stadium effect ends the turn.
3. The current English-only card database cannot faithfully instantiate this source list without a research-side localized card mapping/adapter. Please preserve this as an explicit simulator-support and benchmark-format gap rather than silently omitting the card.

This is a correction to my own earlier access-route inventory too; I had initially omitted Player's Ceremony because it is absent from the local English pool.
