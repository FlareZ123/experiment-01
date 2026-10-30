# Agent 33: Temple of Sinnoh, Double Dragon and Jet owner-action semantics

30 October 2026. Paper text/rulings plus a bounded pure policy correction. This
adjusts only the **default-off**, owner-visible flexible Special Energy selector
`simulation/twinleaf/agent17-public-context-special-energy.cjs`.

Two issues in the previously published selector:

1. Under public Temple of Sinnoh, it previously replaced *every* Special Energy
with a Colorless unit before checking Double Dragon's Dragon-only **from-hand
attachment restriction**. Thus a held Double Dragon could be proposed for a
non-Dragon receiver. Temple suppresses attached effects; it does not permit
ignoring from-hand category restrictions. The correction checks Dragon
recipient independently of the Stadium numeric replacement.
2. It always refused Bench Jet Energy to avoid making an unmodeled
post-attachment switch. The [official Japanese Temple ruling](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B7%E3%83%B3%E3%82%AA%E3%82%A6%E7%A5%9E%E6%AE%BF&regulation_faq_main_item1=all)
explicitly says Jet Energy attached to a Benched Pokémon **does not switch it**
when Temple is in play. The selector now considers a Colorless-only Bench
attachment in that public situation; outside Temple its earlier conservative
switch guard remains.

Two synthetic pure tests added to
`tests/agent17-public-context-special-energy.test.cjs`.
They verify proposal selection, never real Store acceptance or effect settlement.
The existing owner-source/frozen original Aichi source decks remain unchanged.
The official
[Temple of Sinnoh card](https://asia.pokemon-card.com/my/card-search/detail/2423/)
limits the Stadium suppression to attached Special Energy; the original
[Double Dragon printing](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/xy-series/xy6/97)
states its Dragon-only attachment. Under Temple, DDE already attached by another
effect can be Colorless on a nonDragon; this update only guards proposed
**from-hand** attachment.

Caveats: The underlying engine remains ultimate action acceptance authority;
source list/printed native print normalization and actual two-seat Store effects
have not been demonstrated by this change. Zero competitively qualified games.
