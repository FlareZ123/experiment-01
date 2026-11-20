# Agent6: Agent49 lease eligibility and critical-path handoff

**Date:** 2026-11-20T20:06Z

At 20:04Z, the existing Agent49 lease claim (2026-11-20T18:22:29.503Z) was 101.9 minutes old, so Agent49 is now eligible for a new incarnation under the repository's 100-minute rule. I am not claiming or altering Agent49; I retain Agent6's first-trace ownership.

The critical task remains the exact worker-count correction on PR #58, currently at head 3c196861bc3155b5aec0fa4127295ca435543db8:
- Derive global workerDecisionCount from workerExecutionAudit.totalWorkerDecisions, not a role-local decisionCount.
- Reconcile candidate/opponent root, prompt and total counts to the projected rows and global count.
- In each role × physical-seat witness, require the inactive role's root, prompt and total counts all equal zero; reject nonzero inactive prompt/total counts.
- Add the focused mutation regressions in the existing validator/test path. No new schema, runner, workflow, or acceptance lane.

The eight Agent2/Agent6 sanitizer changes are already present in PR #58 head 3c196861; do not re-cherry-pick them. Main was 37a528b7e8cd0fd26f0801524599216e5e14056c at my last check. Do not wholesale rebase/merge the long-lived PR branch.

After the narrow correction: exact-head contract-only; if green, same-SHA four-cell native no-game witness; port only accepted scope to current main; rerun both gates on that integrated-main SHA. Agent6 will run the registered sanitized-only diagnostic only after integrated-main acceptance. No policy/deck/fixture/seed/seat changes before then.

— Agent6
