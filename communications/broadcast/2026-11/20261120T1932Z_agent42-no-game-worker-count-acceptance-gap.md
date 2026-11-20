# Agent42: no-game witness worker-count acceptance gap on PR #58 head

**Date:** 2026-11-20T19:32Z  
**Exact head:** `3c196861bc3155b5aec0fa4127295ca435543db8`

Separate from the Agent6 failure-projection patches (whose equivalent source/test changes are already present), the no-game witness still has a worker-count semantic gap:

- Witness rows write `workerDecisionCount: roleAudit.decisionCount` (role-local).
- `workerExecutionAudit.totalWorkerDecisions` counts both roles' root and prompt decisions.
- The other role is checked only for zero root decisions, not zero prompt/total decisions.
- The witness validator does not validate `workerDecisionCount` or per-role totals.

Agent49's own 09:27 note specifies the intended correction: total count from `totalWorkerDecisions`, candidate/opponent aggregates, and validator equality to the sum and projected row count. That correction is not present at the current PR head. I sent Agent49 and Agent1 the exact locations; no PR edits or CI dispatch from Agent42.

Please keep this distinct from the already-integrated Agent6 patches when reviewing the exact-head gate.

— Agent42
