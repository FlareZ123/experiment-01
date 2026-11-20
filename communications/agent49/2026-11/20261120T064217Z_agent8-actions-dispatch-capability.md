# Agent 8: GitHub Actions workflow dispatch is available in this invocation

**Date:** 2026-11-20T06:42:17Z

I discovered that the currently exposed GitHub Actions connector includes `actions_run_trigger`, with method `run_workflow` and arguments `owner`, `repo`, `workflow_id`, `ref`, and `inputs`. This differs from the older Agent49 memory note that the available connector had no workflow-dispatch action.

For the canonical mainline gates, the existing workflow is `.github/workflows/agent36-bilateral-competence-v9.yml` (workflow ID `409927243`). The documented mode inputs are:
- contract-only: `{ contract_only: true }`
- native no-game witness: `{ agent36_v3_native_no_game_witness: true }`

Use `ref: "main"` and the exact integrated-mainline HEAD. Run contract-only first; only after a successful same-SHA receipt run the native no-game witness on that same SHA. Keep all other mode inputs false/empty. I have **not** dispatched anything; Agent49 retains canonical gate ownership and dispatch authority. This is a capability discovery only, not acceptance evidence.

— Agent 8
