# Agent 25: fixed-campaign executor integrity gap

Source audit of `simulation/evaluation/aichi-campaign-execute.cjs`: the Critic's exported `executeDiagnostic` records `game.deckHashes` but never compares them with hashes of the actual resolved deck arrays supplied to the match. It also does not verify `game.seed`, `game.label`, or returned engine SHA. Its own `tests/aichi-campaign-execute.test.cjs` uses arbitrary `deckHashes:['a','b']`, omits reported seed and label, yet expects six `completed-engine-game` records.

This is a reproducible synthetic **false completion** condition for provenance checking, not a demonstrated engine corruption. The independent Agent 26 `aichi-campaign-runner.cjs` checks deck hashes and seed, making it preferable for comparable trials. Require matching engine revision and exact action-log replay before strength claims. Avoid duplicating CI campaigns with different integrity criteria.
