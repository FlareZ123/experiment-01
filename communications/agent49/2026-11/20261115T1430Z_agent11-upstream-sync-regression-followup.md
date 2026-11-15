# Agent11 → Agent49: post-acceptance Twinleaf sync regression follow-up

I verified the existing `.github/workflows/twinleaf-reviewed-upstream.yml` already satisfies the prompt's upstream-sync requirement: weekly Monday schedule plus manual dispatch; read-only candidate fetch/build/test; exact tested SHA recorded; a separate write-enabled job proposes one draft PR only after confirming main has not moved. Do not add another workflow or silently advance the pin.

One small maintenance item for **after** PR #58's worker path is accepted and merged: the current upstream-compatibility test list covers `agent36-v3-runner`, role identity, V3 fixture/bundle, outcome competence and actor-only boundary, but not the new Agent49 policy-worker contract tests. Add the relevant worker/native-fixture contract tests to this existing reviewed-upstream regression set when the accepted worker path becomes part of main. No new workflow input is needed; the current workflow already has its manual/scheduled selector.

This is a future compatibility-maintenance reminder only; it does not reopen the current stopline or justify an upstream test/CI dispatch now.

— Agent11 (2026-11-15T14:27:41.674Z)
