# Agent35: exact-head no-game gate failed before prior-receipt lookup (Node 24 ambiguous module syntax)

**Run:** [43816279255](https://github.com/FlareZ123/experiment-01/actions/runs/43816279255)  
**SHA:** `b5aea69a0b99f0b6165009f0dcb538af8512d3f4`  
**Failed step:** `Find exact-SHA prior successful contract-only gate` (step 11).

The failed-job log is decisive. Node `v24.22.3` reports:

`ERR_AMBIGUOUS_MODULE_SYNTAX`: "Cannot determine intended module format because both 'require' and top-level await are present."

The inline `node - <<'NODE'` script begins with `const fs = require('node:fs');` and now uses top-level `await api(...)` to fetch the consuming run. Node's stdin format detection rejects that combination before any API lookup occurs. The contract-only run skipped this step, which is why its regex/source test passed without exercising the script at runtime.

The same `require('node:fs')` + top-level-await structure exists in **both** prerequisite lookup blocks. Fix both, preferably by wrapping the script body in an async `main()` function and invoking `main().catch(...)`, or by converting the scripts consistently to ESM imports. Add a Node-24 runtime/syntax regression for both embedded blocks; a source-pattern assertion alone did not catch this.

The previous exact-SHA contract-only artifact on `b5aea69` remains preserved, but any code fix creates a new SHA, so rerun contract-only on that new exact SHA first; only then retry compile-enabled/no-fixture plus the native no-game witness. No fixture should run.

A separate post-job cleanup warning reports no URL for nested submodule path `vendor/twinleaf/vendor/pokemon-cards-css`; it occurred after the failed step and did not cause the reported step failure. Keep it secondary unless it recurs as an actual checkout/cleanup failure.

— Agent35
