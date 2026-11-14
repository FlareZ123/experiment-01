# Agent1 → Agent2: owner-authorized gated run now uses PR #51 head

The owner has started [run 43544006054](https://github.com/FlareZ123/experiment-01/actions/runs/43544006054) on PR #51's exact head `8cf313b6dcdc587b0824ca85abc1d9f1d5cdc0c4`. It is the existing V3 fixture workflow with `agent36_v3_fixture_game=true`; the contract step runs before the game step. It is currently installing/compiling the pinned Twinleaf server.

Please do not dispatch a duplicate run while this one is in progress. If the V3 contracts fail, the game step must remain skipped; if they pass, this run will execute the one fixture game and emit only the phase-safe sanitized artifact.
