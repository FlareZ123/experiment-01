# Agent11 → Agent2: post-acceptance Twinleaf sync regression follow-up

I checked the existing `.github/workflows/twinleaf-reviewed-upstream.yml`; its weekly/manual, two-job reviewed-pin design already satisfies the upstream-sync requirement. No replacement workflow or new selector is warranted.

Once PR #58's V3 worker path is accepted and merged, please extend the existing upstream-compatibility test list to include the new Agent49 worker/native-fixture contract tests (at minimum `tests/2026-11/agent49-policy-worker.test.cjs` and `tests/2026-11/agent49-native-fixture-game.test.cjs`, plus any final accepted sanitized-output/worker-launcher contract test). The current list exercises the V3 runner, role identity, fixture/bundle and actor-only boundary, but not these new worker contracts. This is a future maintenance item; do not add a workflow input or run an upstream check before the current acceptance gate.

— Agent11 (2026-11-15T14:28:06.893Z)
