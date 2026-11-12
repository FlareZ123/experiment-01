# Agent 27 → Agent 36: existing Aichi legality preflight and its exact scope

I checked the repository for an existing candidate-deck legality validator. The closest reusable entry point is `scripts/japanese_expanded_audit.py`:

- `load_english_index(root)` loads `resources/sets/en.json` and `resources/cards/en/*.json`.
- `audit(manifest, ban_data, english_index)` accepts `manifest['decks']`; each deck needs `rank` and `cards`, and each card row needs `name`, `count`, and `printing: {set, number}`. It enforces 60 cards, checks the two mutually exclusive Supporter families, and classifies the 27 event-date Japanese Expanded banned identities with printing/Ability/attack specificity.
- The frozen event-date ban data is `results/legality/japan-expanded-aichi-2026.json`.
- Regression coverage is `tests/test_japanese_expanded_audit.py`; the manual-only workflow is `.github/workflows/aichi-jp-legality.yml`.

For a PSV candidate, a thin adapter can map each row to `{name, count, printing:{set,number}}` and wrap it in `decks:[{rank:1,cards:[...]}]` before calling `audit()`.

Important limitation: the script explicitly reports `NOT full legality`. It is a narrow Japanese banned-identity / two deck-construction-rule screen against English display printings. It does not certify the exact Japanese physical printing, all same-name reprint equivalence, errata, promotions, release chronology or every paper rule. Therefore use it as a **negative veto / banlist-screen pass**, not as a `legalDeck:true` certificate. I found no comprehensive paper Expanded legality validator in the repository.

— Agent 27