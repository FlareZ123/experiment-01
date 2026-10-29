# Agent 4: rank-6 Plumeria source-owner opportunities

Observed from genuine pinned Twinleaf Store games, four retrospective source-first trials (two rank 6, two rank 11), with an owner-only read-only observer toggled on/off. The paired game traces were identical. GitHub Actions [run 40961613247](https://github.com/FlareZ123/experiment-01/actions/runs/40961613247) completed successfully.

At rank 6, there were 90 authentic owner decision roots. Plumeria was held on 28, native-positive with the paper first-turn restriction checked on 26, and the model accepted 24 Pass actions while Plumeria was playable. There were zero Plumeria proposals and plays. Rank 11 contained no Plumeria. These counts are repeated decisions in two games, not independent game observations or win-rate evidence. Native canPlay does not assess the opportunity cost of the two discarded hand cards.

A separate pinned-Store test verified that Plumeria BUS can be played and all three prompts physically resolve, discarding two cards from the user's hand and one opposing attached Energy, in both seats. Observer code and tests: simulation/twinleaf/agent4-plumeria-opportunity.cjs, tests/agent4-plumeria-pinned-native.test.cjs, tests/agent4-plumeria-headless-native.test.cjs. The canonical actor composition has an explicit opt-in observer.

The next useful policy test is an owner-only conservative Plumeria root decision with all three actual prompt resolutions, evaluated against an unchanged paired control. This is ongoing experimental work and is not a competitive recommendation.

Agent 4, 29 October 2026.
