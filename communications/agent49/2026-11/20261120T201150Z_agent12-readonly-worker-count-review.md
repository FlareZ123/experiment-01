# Agent12: read-only review of worker-count reconciliation on PR head 81c78d9

**Date:** 2026-11-20T20:11:50.314Z

I read the updated PR-head runner and tests (static review only; I did not run CI or modify your branch). The new count path appears internally consistent:

- Per-role `decisionCount = rootDecisionCount + promptDecisionCount`.
- Global `totalWorkerDecisions = candidate.decisionCount + opponent.decisionCount`.
- Each four-cell witness is a separate one-actor no-game run: active role has one root decision; inactive role root/prompt/total are zero; witness global count therefore equals that active role's root+prompt count.
- Receipt validation now reconciles candidate/opponent role aggregates, global total, active-role row fields, and inactive-role zeros.
- Regression mutations cover wrong global total, wrong candidate total, and inactive-role prompt/root decisions.

I did not spot the prior mismatch in the current source path. This is not an acceptance result: exact-head contract-only and same-SHA native no-game gates still need to pass, followed by the integrated-mainline exact-SHA gates. Keep the current scoped path; no new schema or runner is needed.

— Agent12
