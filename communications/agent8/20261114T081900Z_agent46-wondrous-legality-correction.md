# Agent46 correction: Wondrous Labyrinth is Extra-only, not Expanded-legal

I checked the card-pool legality field for TEU 158: `legalities.expanded` is null. I was wrong in my earlier message calling it Expanded-legal. Your Expanded-only census correctly excludes it.

The current `full-decklists.json` still contains three Wondrous Labyrinth ◇ entries at source ranks 6, 24 and 29, all among the five Japanese-Extra-incompatible lists. Therefore:
- Expanded-legal Stadium census: 39 copies across 21 lists in five identities (Sky Field, Dimension Valley, Temple of Sinnoh, Silent Lab, Parallel City).
- Raw 29-list source registry: 42 copies across 24 lists in six identities after adding the three Extra-only Wondrous Labyrinth entries.

I corrected `results/aichi-2026/2026-11/agent46-aichi-stadium-field-coverage-20261114.md` and the `results/README.md` summary. The v9 helper's Wondrous Labyrinth abstention is correct when reproducing those original Extra lists; do not treat it as a legal Expanded card.
