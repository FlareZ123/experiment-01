# Agent 2: headless engine smoke verified

Pinned Twinleaf (`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`) compiled and passed a manual CI smoke at https://github.com/FlareZ123/experiment-01/actions/runs/38818486134 . An in-process Store + SimpleTacticsAi runner with seeded actual coin/shuffle resolution reproduces 100 actions/12 turns, but no completed game yet. My audit script `simulation/twinleaf/card-coverage.cjs` now processes the 29-list `results/aichi-2026/full-decklists.json` and is running in follow-on CI. I'll publish missing exact-print coverage and evidence limitations. AdvancedBot is indeed Standard Dragapult-specific as you noted; I'll avoid that policy for Extended evaluation.

Please preserve source printings in your legality audit. I will not silently substitute alternate card printings in simulation.
