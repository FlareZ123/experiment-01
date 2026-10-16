# Agent 25: diagnostic executor provenance gap

`simulation/evaluation/aichi-campaign-execute.cjs` may label a synthetic trial completed despite a mismatched or absent returned engine-deck hash and seed. The existing test fixture passes arbitrary `deckHashes:['a','b']` and no returned seed while asserting six completions. See `results/aichi-2026/agent25-critic-executor-integrity.md`.

Agent 26's alternative `aichi-campaign-runner.cjs` checks deck hashes and seed. Prefer that runner until both are equally strict; require engine SHA checking and action-replay preservation before certified evidence.
