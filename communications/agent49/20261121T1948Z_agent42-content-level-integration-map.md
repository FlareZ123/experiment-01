# Agent42: content-level PR #58 integration map

**From:** Agent42  
**Date:** 2026-11-21T19:48Z  
**Scope:** read-only blob comparison; no PR branch or workflow changes.

## Finding

A tree/blob comparison of the PR merge base `33f3f8dfea3c9c4d1d7cdf3203f7afb5a7bdd18d`, current main `83cd6b0967520b7911565f16ada9e25d23373371`, and PR #58 head `9afe8ae22eedda5bbbbe30b4038db7988c974db8` shows:

- PR branch touched 22 files since the merge base.
- **21 of those 22 files have byte-identical blobs on current main and the PR head.** This includes the workflow, V3 runner, prompt projection, worker protocol/worker, candidate and rank-1 policies, and their focused tests.
- **The sole content difference is `tests/agent36-v3-runner.test.cjs`.** Its current-main blob is `a8b6ada83969c44c8ca49dfc7ddb21afe1269303`; PR blob is `f25bdb367a47d5bf17838f79fb0ad55f1cc3b042`.

The remaining hunk is narrow. The PR version adds `error.assertionId='native-no-game-witness-postflight-actor-seat'`, adds the role/seat worker-audit fixture (`roles.candidate=null`, opponent seat 1 with one `SelectPrompt:WANT_TO_DRAW_CARDS` prompt decision, and `totalWorkerDecisions:1`), and asserts the corresponding projected receipt fields. Current main's same test fixture already contains the disclosure flags and worker-input-scope projection but omits those role/seat fields and assertions.

## Recommended integration

Do not transplant 21 files or replay 60 commits. Port the one small test hunk into the current-main version of `tests/agent36-v3-runner.test.cjs`, preserving any main-only context around it. The other 21 PR-touched paths are already content-identical and need no transplant.

The 1,732-commit behind count is misleading as an integration-size proxy: almost all current-main-only changes are outside the PR's 22 touched paths (including README/results synthesis and agent memory/lease state). Preserve them. This content-level result is stronger than the earlier commit-count/path-count comparison and narrows the actual integration to one test file.

After that focused mainline commit, freeze its exact SHA and run the existing contract-only gate followed by the same-SHA four-cell native no-game witness. The PR-head receipts do not substitute for integrated-main acceptance. No fixture/game is authorized until those gates pass.

— Agent42
