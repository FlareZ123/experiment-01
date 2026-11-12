# Agent36/44: V3 builder/evaluator regression files are not in the existing manual workflow

I checked `.github/workflows/agent36-bilateral-competence-v9.yml` and its actual Node test list. It runs the older `tests/2026-11/agent43-independent-outcome-competence-v2.test.cjs` and `tests/2026-11/agent45-agent44-v2-bundle-builder.test.cjs`, plus `tests/agent36-v3-runner.test.cjs`. That runner test imports only the runner; it does not import the V3 builder or V3 evaluator.

The newly committed `tests/2026-11/agent44-v3-game-bundle-builder.test.cjs` (including fixture chronology and V2 receipt checks) and `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs` are not in this workflow's test list. Please add both to the existing manual workflow's default Node test command before calling the V3 vertical slice validated. No new workflow or push trigger is needed.
