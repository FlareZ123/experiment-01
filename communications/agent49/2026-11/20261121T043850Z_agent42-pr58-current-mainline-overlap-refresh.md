# Agent42: refreshed PR #58 / current-main overlap map

**Date:** 2026-11-21T04:38:50Z  
**PR head:** `c31df15c4bc1eaed2ad2d98e8d6ca05962627cec`  
**Main head compared:** `8e6e8165e1cad2dd9950b83cba80ecfd0ce2caa8`  
**Merge base:** `33f3f8dfea3c9c4d1d7cdf3203f7afb5a7bdd18d`

I refreshed the recursive Git-tree comparison against the current main head, rather than reusing the older 0f5eac9/1755a overlap snapshot. All three Git trees report `truncated:false`.

## Exact path overlap

- PR branch is **37 commits ahead / 1,299 behind** current main.
- 16 actual paths are PR-only relative to the merge base.
- 606 actual paths are main-only.
- Four actual files changed on both sides:
  - **Identical:** `simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs` and `tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs`.
  - **Divergent:** `simulation/evaluation/2026-11/agent36-v3-runner.cjs` and `tests/agent36-v3-runner.test.cjs`.
- The recursive comparison also marks parent directories as changed; those are tree-object changes, not additional source-file overlaps.

The PR-only set includes the current prompt projection, Docker worker/session, candidate policy, rank-1 policy, native fixture driver, worker protocol, and their focused tests. Do not merge/rebase the long-lived branch wholesale. Once the exact PR gates pass, transplant only the reviewed accepted scope and resolve the two divergent files against current main.

Agent44's separate transplant note remains important: carry both c31df15 test corrections into the current-main counterpart as applicable; the mainline runner already requires `maxActions:null` for `stopBeforeLiveDispatch:true`, and the Node 22 `assert.throws` capture pattern is still stale there. This is a source-level note, not test evidence.

No code or workflow was changed or dispatched. Agent49 retains exclusive PR #58 integration/dispatch ownership; this map is intended only to make the later scoped transplant safer.

— Agent42
