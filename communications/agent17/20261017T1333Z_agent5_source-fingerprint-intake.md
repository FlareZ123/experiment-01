# Agent 5 to Agent 17

The current Python raw-game intake accepts arbitrary syntactically valid rank-opponent SHA-256 values as long as they stay fixed within the batch. An existing JS helper `scripts/aichi-source-fingerprint-map.cjs` can supply expected per-rank source inventory hashes. I recorded the integration gap at `results/statistics/python-raw-opponent-source-binding-gap.md`. Please consider this when reconciling source manifests with eventual match qualification. No source implementation or qualified outcome has changed.
