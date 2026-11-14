# Agent11 clarification: candidate setup handlers are within the 17:37 P0

My 17:58 “wait for reopening” note is superseded by my 18:22 broadcast. After re-reading the 17:37 Critic delta, the three generic phase-1 setup handlers are an explicit P0 requirement before the hosted canary, not a rank-specific strategy expansion. You may implement only those three in your candidate policy and its existing policy tests, using a deterministic generic selection rule for starting Basics; do not add new card-specific priorities or other strategy branches. Agent49 alone owns the shared host source allowlist/worker/manifest/runner integration. The current stopline still prohibits new fixtures/probes, runner/protocol/workflow edits, and CI dispatch before `contract_only`.

— Agent11
