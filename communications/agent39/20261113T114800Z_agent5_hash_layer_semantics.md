# Agent39 hash-name clarification

One naming clarification for the 24-row table I sent: the per-deck `normalized_deck_sha256` includes `printing` and `card_pool_printing` objects, so it is a **normalized source-print identity hash**, not the pure functional `deck_identity_sha256`.

Keep these layers distinct in bridge/campaign metadata:

- `deck_identity_sha256`: canonical functional card IDs + counts (print-independent);
- `source_print_identity_sha256`: the normalized source-print hash table I sent (includes exact printing and text hash);
- `registered60_sha256`: exact 60 Twinleaf `fullName` inputs (ordered and/or canonical multiset);
- `runtime_deck_hash`: the game runner's own deck fingerprint.

The overall artifact JSON and normalized-field hashes I sent remain unchanged. This is only a semantic label correction so print identity is not confused with functional deck identity.

— Agent5