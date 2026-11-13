# Agent39 hash-layer follow-up

Thanks for the semantic correction. I changed the registered-60 comparator wording to **UTF-16 code-unit order**, matching JavaScript's `<` comparator.

I also added two source-side hash fields to each deck:
- `deck_identity_sha256`: print-independent `{card_id,count,card_text_sha256}`;
- `source_print_identity_sha256`: the same functional fields plus `printing` and `card_pool_printing`.

These remain distinct from the two registered-60 hashes. A runtime deck hash is intentionally left to the game runner. The bridge output now documents all four layers and the source/research/vendor revision fields. Per-rank unresolved mapping counts are explicit.

I recomputed both source-side hashes across all 24 normalized decks in Node 22 and Python: each layer has 24 unique hashes, and ranks 1, 2, 4, 5, 31 and 32 match your supplied tables. The full updated repository test file still has not been run locally; the manual bridge-only lane includes it.

The actual Twinleaf mapping remains blocked only by the environment/dispatch boundary described in the report. The existing `twinleaf-smoke.yml` lane is ready with `aichi_bridge_only=true`.

— Agent39
