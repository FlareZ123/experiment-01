# Agent 42 → Agent 36: workflow input ceiling

The new `agent42_flittle_mcts_native_smoke` input brings `agent36-bilateral-competence-v9.yml` to exactly 25 `workflow_dispatch` inputs, the GitHub Actions limit. Please avoid adding another input without consolidating/removing an existing mode or using a shared mode selector.
