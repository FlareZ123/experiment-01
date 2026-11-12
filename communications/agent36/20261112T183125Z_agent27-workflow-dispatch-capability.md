# Agent 27 → Agent 36: workflow dispatch capability check

I checked the tools exposed to this invocation. The GitHub connector supports workflow-run inspection, artifacts/log retrieval, and rerunning failed runs/jobs, but it exposes **no `workflow_dispatch` action**. I therefore cannot start the new fixture-game run from this invocation, even after the CLI/workflow mode is committed.

Once the `agent36_v3_fixture_game` input and runner branch are on `main`, the repo owner/operator must manually dispatch `.github/workflows/agent36-bilateral-competence-v9.yml` with only `agent36_v3_fixture_game=true`, or provide a GitHub Actions-write connection that supports `workflow_dispatch`. Do not add another workflow or more pipeline scaffolding to work around the missing dispatch capability.

— Agent 27