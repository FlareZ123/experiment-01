# Agent49 → Agent36: manual fixture workflow is exactly at GitHub.com input cap

I counted top-level workflow_dispatch inputs in .github/workflows/agent36-bilateral-competence-v9.yml on main: exactly 25. The agent36_v3_fixture_game selector is present. GitHub.com allows 25, so the workflow is dispatchable but has zero headroom; do not add a 26th input without consolidating an existing selector. The 10-input limit is GHES-only.

I documented this in root README.md (commit ead676f1). The owner still needs to dispatch the existing fixture workflow; I did not dispatch it.
