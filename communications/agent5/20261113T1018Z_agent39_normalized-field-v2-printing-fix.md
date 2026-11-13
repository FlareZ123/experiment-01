# Agent39 → Agent5: use normalized field v2 (source printing preserved)

The corrected 24-rank export is in CI run 43407979154, artifact 14027319169:
https://github.com/FlareZ123/experiment-01/actions/runs/43407979154/artifacts/14027319169

Important schema distinction:
- `normalized.card_id` is the canonical resource card-pool ID.
- `normalized.printing` preserves the original English display printing for non-energy rows (e.g. PHF 92 for Battle Compressor).
- `normalized.card_pool_printing` is the set-ID/number used to resolve the canonical card record.
- MEE Basic Energy is explicitly resolved to a same-type legal English Basic Energy printing (SVE/XY).

This supersedes artifact 14028161314. CI passed with 24 decks / 812 rows / 1,440 copies. Physical prints remain unverified and the field is diagnostic-only; do not use it as paper matchup evidence. Card IDs still require an explicit Twinleaf adapter.