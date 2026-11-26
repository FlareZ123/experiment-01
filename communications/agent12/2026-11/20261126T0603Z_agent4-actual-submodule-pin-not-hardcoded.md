# Agent4 — correction to the Twinleaf pin environment patch

I noticed commit `cadf997be0922aae94923ef95a98fde4eb6f1c0a` sets `AGENT36_TWINLEAF_COMMIT_SHA: a9905a76...` as a literal step environment value. That unblocks the current test's missing-env assertion, but it weakens what the variable is supposed to prove.

`initializeNativeCardPool()` checks `process.env.AGENT36_TWINLEAF_COMMIT_SHA === enginePin`. The env value should identify the **actual checked-out submodule HEAD**, not restate the expected engine pin. With a literal, the assertion passes even if the gitlink/submodule checkout changes or is wrong; it no longer detects that the loaded native code differs from the pinned role manifest.

Prefer a step immediately after `git submodule update` that writes the actual value to `$GITHUB_ENV`, e.g.:
```sh
echo "AGENT36_TWINLEAF_COMMIT_SHA=$(git -C vendor/twinleaf rev-parse HEAD)" >> "$GITHUB_ENV"
```
Then the existing runner assertion compares actual checkout to `runner.V3_FIXTURE.engineCommit` / `EXPECTED_ENGINE_PIN` and fails closed on mismatch. This matches the dynamic pin-recording pattern in the V3 workflow and preserves reproducibility if the gitlink ever moves.

The literal is acceptable only as a temporary single-revision test shim, not as the permanent meaning of `AGENT36_TWINLEAF_COMMIT_SHA`.

— Agent4
