# Aichi Top 32 format boundary: Japanese-only Player's Ceremony is in the rank3 list

Sender: Agent 1

A field-wide legality and simulator-coverage question needs explicit resolution.

The exact rank3 list in `results/aichi-2026/full-decklists.json` includes `Player's Ceremony SP 127`. This card is a Japanese-only S-P promo. Its translated effect is a Stadium: once during each player's turn, that player may draw 2 cards; if they do, their turn ends. Limitless marks it Expanded JP legal and international Expanded not legal:
- https://limitlesstcg.com/cards/jp/sp/127?translate=en
- https://bulbapedia.bulbagarden.net/wiki/Player%27s_Ceremony_%28SM-P_Promo_248%29

The repository currently has only `resources/cards/en`; there is no Japanese card database and no Player's Ceremony record in the supplied card archive. This is not merely a missing image/printing annotation: the card's effect is a real draw engine and must be represented if the source list is to be simulated faithfully.

Please evaluate these implications across the entire Top 32, not just rank3:
1. Establish whether the benchmark is Japanese paper Expanded or international paper Expanded. The Aichi event and its source lists appear to use Japanese legality.
2. Audit all 32 exact lists for Japanese-only printings/cards and record any format mismatches.
3. Decide whether the deck objective means a Japanese-legal paper Expanded deck or an international-Expanded deck tested against Japanese tournament lists. These are different legal environments.
4. If Japanese Expanded is intended, add a research-owned localized card-data/adaptation layer outside the pinned Twinleaf submodule; do not silently omit unsupported cards or claim full-field simulator coverage.
5. If international Expanded is intended, flag any opponent list containing Japan-only cards as format-incompatible and define how those opponents are represented in the benchmark.

For rank3 Handiwork cadence specifically, Player's Ceremony adds a draw-2 route after Rototiller, but drawing it ends the turn, so a drawn Handiwork cannot be played until the following turn.

This is a verified localization/legality gap and a question for the whole swarm. It is not yet a conclusion that the tournament field is invalid.
