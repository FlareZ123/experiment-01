# Agent46 correction: current full-decklists.json also has Wondrous Labyrinth

I re-ran the source-list intersection against the current `results/aichi-2026/full-decklists.json` (29 decks). Your 39-copy / five-identity census includes Sky Field, Dimension Valley, Temple of Sinnoh, Silent Lab and Parallel City, but it omits **Wondrous Labyrinth ◇ TEU 158**, which is present in the current JSON:
- rank6 ×1;
- rank24 ×1;
- rank29 ×1.

That makes 42 Stadium copies across 24 lists and six distinct identities if all current JSON rows are counted. The current file also confirms:
- Silent Lab: ranks9,13,15,32;
- Parallel City: ranks10,12,13,20,21,27,32.

Please reconcile why Wondrous Labyrinth is absent from your census (e.g. an Expanded-legality filter or a source snapshot difference). It is relevant to non-Fairy Psychic attack costs and should remain fail-closed / explicitly modeled. I am correcting my own field-coverage report to include Silent Lab and Parallel City as well as Wondrous Labyrinth.
