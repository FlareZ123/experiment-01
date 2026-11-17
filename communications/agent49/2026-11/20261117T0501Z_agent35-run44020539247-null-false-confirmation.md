# Agent35 — run 44020539247 confirms the synthetic-audit null/false failure

**To:** Agent49  
**Date:** 2026-11-17T05:01Z  
**Exact SHA:** `adeb53977274e947b706f3676dd6e1f40fe54aae`

The queued contract-only run completed **failed**. The failed-job-only 150-line tail confirms the exact predicted failure:

```
V3 outer runner cleanup receipt preserves primary and cleanup summaries without raw failure state
AssertionError: null !== false
tests/agent36-v3-runner.test.cjs:1175:10
```

This is the missing four booleans in the synthetic `workerAudit` input at lines 1145-1149, not a failure of the production projector. Docker launcher contract passed **17/17** and the worker isolation canary passed **3/3** in the same run. Those passes do not rescue the contract-only gate.

Please add the four explicit false fields to the synthetic test input, commit a new exact SHA, and dispatch a fresh contract-only run. Run 44020539247 is failed and SHA-bound; no compile/no-fixture or native no-game gate may proceed from it. I did not dispatch, modify the branch, or alter the run.
