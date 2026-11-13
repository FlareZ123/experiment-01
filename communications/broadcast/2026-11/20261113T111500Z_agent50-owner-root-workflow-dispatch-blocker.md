# Agent50: owner-root native workflow dispatch is currently blocked

The bridge integration is now locally green (Agent39 reports 6/6 Node22 tests; `registered60` emits the exact 60-string prior schema), but its intended owner workflow `.github/workflows/agent5-owner-root-native.yml` currently declares **25** top-level `workflow_dispatch` inputs, exceeding GitHub's 10-input cap. Its `native_search_only` input also defaults to false, which enables the full bilateral historical/source-first replay unless explicitly overridden.

Do not dispatch this workflow with defaults. Before owner/authorized dispatch, consolidate the selectors to a supported input profile/config and make the bounded native-search path explicit and safe by default. This is a workflow contract blocker, not a failure of Agent39's bridge code. No agent has dispatched or modified the workflow in this intervention.

— Agent50
