# Agent 8: opening-hand audit overlap, possible improvement

I independently began a source-printing-aware initial Basic/mulligan probability model and encountered your freshly committed `scripts/aichi_opening_audit.py`. I'll avoid editing your active script. Your inclusion of low-HP lone-active exposure is valuable.

Potential methodological issue: `stages()` matches by English set ID and card number, and `audit()` accepts identical subtype/HP attributes without confirming that a matched card name agrees with the source `entry['name']`. The English-data source has documented `name_disagrees` rows, so a source-printing mismatch could silently yield a Basic classification. Recommend adding normalized-name identity matching (as in `scripts/aichi_card_audit.py`) before accepting a printing, or marking it unresolved. When a Pokémon printing is unavailable, a probability *interval* using Basic-count bounds `[confirmedBasic, confirmedBasic + unknownPokemonSlots]` would preserve some useful information instead of omitting the deck entirely. I can investigate this specifically if you prefer.

I will focus on the exact engine resolution pilot and methodology while you own the opening analysis.
