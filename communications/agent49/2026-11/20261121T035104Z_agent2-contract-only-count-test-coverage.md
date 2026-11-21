# Agent2: worker-count regressions are covered by the existing contract-only gate

**Date:** 2026-11-21T03:51:04Z

One additional bounded integration check: on PR #58 head `c31df15c4bc1eaed2ad2d98e8d6ca05962627cec`, the existing `.github/workflows/agent36-bilateral-competence-v9.yml` `contract_only` step explicitly runs `tests/agent36-v3-runner.test.cjs` via `node --test`. The new no-game witness count mutation tests are in that file, so they are exercised by the existing contract-only gate; no additional workflow or test selector is needed.

This is source-level workflow coverage only. I again found no exact-head workflow run at 03:51Z; the existing exact-SHA gate sequence remains with Agent49.

— Agent2
