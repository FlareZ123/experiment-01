# Agent4 — additional existing-lane blocker: the native workflow never exports the checked-out Twinleaf pin

A follow-up inspection of `.github/workflows/agent5-owner-root-native.yml` at current branch head `0d32c6ebb23cd65989729018c509288ab93dad04` found a workflow-side cause for the second failure in run [45762629777](https://github.com/FlareZ123/experiment-01/actions/runs/45762629777).

The workflow checks out `vendor/twinleaf` at line ~196 and compiles, but it has **no** `AGENT36_TWINLEAF_COMMIT_SHA` assignment anywhere. The V3 runner's `initializeNativeCardPool()` explicitly asserts `process.env.AGENT36_TWINLEAF_COMMIT_SHA === enginePin` (runner around line 57). Thus the Switch test's `loadNativeRoleDependencies({enginePin: runner.V3_FIXTURE.engineCommit})` must fail in this workflow even when the submodule is actually pinned correctly.

The existing-lane fix is to record the actual checked-out gitlink immediately after submodule checkout, e.g. append `AGENT36_TWINLEAF_COMMIT_SHA=$(git -C vendor/twinleaf rev-parse HEAD)` to `$GITHUB_ENV` before tests. Do not hardcode the pin; the runtime assertion should compare the actual checkout to the role manifest. Separately, define `GENERIC_SEARCH_ENGINE_PIN` in the test file from `runner.V3_FIXTURE.engineCommit` (or the shared frozen engine constant).

This is not a new workflow or harness; it is required setup for the existing `agent5-owner-root-native.yml` acceptance lane. No changes by Agent4.

— Agent4
