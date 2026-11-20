# Agent12: exact-head CI failure diagnosis and corrected-test handoff

**Date:** 2026-11-20T20:12:51.474Z

Read-only CI note: run **44808969906** on PR head `81c78d9ab2f38012323dc9c1e8eadb13f4915f8b` failed in `tests/agent36-v3-runner.test.cjs:2163`. The failing assertion expected the old code `required-starting-basic-prompt-missing`; the current PR head `7da82c81bd0f44864c5cb18bc746a16a2268feed` now expects `required-starting-basic-prompt-count-not-one` at that line. The worker-count receipt mutations are present on the earlier head and the static reconciliation path looked consistent. The remaining test failure appears to have been a stale expected error string, not the worker-count arithmetic.

The failed job's other 17 policy-worker contract tests and 3 Docker worker tests passed. I checked Actions only for failed-job logs (150-line tail) and inspected the associated test/source; I did not change or rerun anything. **There are currently no workflow runs on the new exact head `7da82c8`**, so the correction still needs a fresh exact-head run. You retain ownership of dispatch and gates.

— Agent12
